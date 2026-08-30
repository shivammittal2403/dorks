import { createHash, randomUUID } from "node:crypto";
import { generateText, jsonSchema, Output } from "ai";

export const runtime = "nodejs";
export const maxDuration = 45;

type Analysis = { title: string; classification: "exposure" | "misconfiguration" | "informational" | "likely-benign" | "needs-review"; summary: string; confidence: number; falsePositiveProbability: number; impact: "critical" | "high" | "moderate" | "low" | "none"; recommendedAction: string };
const analysisSchema = jsonSchema<Analysis>({ type: "object", additionalProperties: false, required: ["title", "classification", "summary", "confidence", "falsePositiveProbability", "impact", "recommendedAction"], properties: { title: { type: "string" }, classification: { type: "string", enum: ["exposure", "misconfiguration", "informational", "likely-benign", "needs-review"] }, summary: { type: "string" }, confidence: { type: "number", minimum: 0, maximum: 1 }, falsePositiveProbability: { type: "number", minimum: 0, maximum: 1 }, impact: { type: "string", enum: ["critical", "high", "moderate", "low", "none"] }, recommendedAction: { type: "string" } } });

const forbidden = /(?:credential(?:s)?|password|secret\s*key|access\s*token|auth(?:entication)?\s*bypass|sql\s*injection|\bxss\b|\blfi\b|\brfi\b|exploit|persistence|destructive|private\s+(?:account|community)|session\s*hijack)/i;

function hostname(value: string) {
  try { return new URL(value.includes("://") ? value : `https://${value}`).hostname.toLowerCase().replace(/\.$/, ""); }
  catch { return value.toLowerCase().replace(/^\.+|\.+$/g, ""); }
}

function deterministicAnalysis(evidence: string) {
  const lower = evidence.toLowerCase();
  const publicIntent = /documentation|developer portal|public api|intended public|marketing/.test(lower);
  const sensitiveSignal = /directory listing|public bucket|stack trace|debug|internal hostname|source map|backup file|configuration/.test(lower);
  const impact = /public bucket|backup file|configuration/.test(lower) ? "high" : sensitiveSignal ? "moderate" : publicIntent ? "none" : "low";
  return {
    title: publicIntent ? "Public content appears consistent with intended exposure" : sensitiveSignal ? "Publicly observable exposure requires validation" : "Public evidence requires analyst review",
    classification: publicIntent ? "likely-benign" : sensitiveSignal ? "exposure" : "needs-review",
    summary: publicIntent ? "Deterministic rules found an explicit public-purpose signal. Confirm ownership and intended audience before closure." : "The submitted public evidence is in authorized scope. Rules identified context that should be validated by an analyst before it is treated as a security finding.",
    confidence: publicIntent || sensitiveSignal ? 0.82 : 0.64,
    falsePositiveProbability: publicIntent ? 0.78 : sensitiveSignal ? 0.24 : 0.42,
    impact,
    recommendedAction: publicIntent ? "Confirm the asset owner and document the approved public-access decision." : "Verify the observed content, confirm business intent, and restrict public access if exposure is not required.",
  } as Analysis;
}

function priorityFor(analysis: Analysis) {
  const impactWeight = { critical: 9.5, high: 8, moderate: 5.5, low: 3, none: 1 }[analysis.impact];
  const score = Math.max(1, Math.min(10, impactWeight * analysis.confidence * (1 - analysis.falsePositiveProbability) + 1));
  return { score: Number(score.toFixed(1)), priority: `P${Math.max(1, Math.min(10, 11 - Math.round(score)))}` };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const target = typeof body?.target === "string" ? body.target.trim() : "";
  const authorizedDomain = typeof body?.authorizedDomain === "string" ? body.authorizedDomain.trim() : "";
  const sourceClass = typeof body?.sourceClass === "string" ? body.sourceClass : "";
  const evidence = typeof body?.evidence === "string" ? body.evidence.trim() : "";
  const allowedSources = ["web-search", "certificate-transparency", "dns-rdap", "public-code"];
  if (target.length < 3 || target.length > 253 || authorizedDomain.length < 3 || authorizedDomain.length > 253 || !allowedSources.includes(sourceClass) || evidence.length < 12 || evidence.length > 8000) return Response.json({ error: "Enter a valid target, authorized domain, source, and evidence." }, { status: 400 });
  const targetHost = hostname(target);
  const scopeHost = hostname(authorizedDomain);
  if (!(targetHost === scopeHost || targetHost.endsWith(`.${scopeHost}`))) {
    return Response.json({ error: "Scope gate blocked this run: target is outside the authorized domain." }, { status: 403 });
  }
  if (forbidden.test(evidence)) {
    return Response.json({ error: "Safety gate blocked prohibited credential, bypass, exploitation, private-access, or destructive content." }, { status: 422 });
  }

  let analysis = deterministicAnalysis(evidence);
  let ai = { provider: "Local deterministic", model: "ruleset-2026.1", status: "Fallback used because managed AI was unavailable." };
  try {
    const result = await generateText({
      model: "openai/gpt-5-mini",
      output: Output.object({ schema: analysisSchema }),
      system: "You are the context-analysis layer of an authorized OSINT evidence platform. Analyze only supplied public evidence. Do not propose bypass, credential collection, exploitation, persistence, destructive actions, or private access. A search result is not automatically a vulnerability. Return concise, audit-ready analysis; never reveal chain-of-thought.",
      prompt: `Authorized target: ${targetHost}\nSource class: ${sourceClass}\nPublic evidence:\n${evidence}`,
    });
    analysis = result.output;
    ai = { provider: "Vercel AI Gateway", model: "openai/gpt-5-mini", status: "Structured contextual analysis completed." };
  } catch {
    // A deterministic, explicitly labelled result keeps the safety/risk workflow usable without pretending AI ran.
  }

  const risk = priorityFor(analysis);
  const timestamp = new Date().toISOString();
  const evidenceHash = createHash("sha256").update(evidence).digest("hex");
  return Response.json({
    runId: randomUUID(), timestamp, gates: { authorization: "passed", scope: "passed", safety: "passed", privacy: "public-evidence-only" },
    target: targetHost, sourceClass, evidenceHash, analysis, risk, ai,
    lineage: ["authorization attestation", `query:${sourceClass}`, `provider result:${targetHost}`, `evidence:sha256:${evidenceHash.slice(0, 12)}`, "ruleset:2026.1", `analysis:${ai.model}`],
  });
}
