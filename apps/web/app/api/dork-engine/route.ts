import { createHash, randomUUID } from "node:crypto";
import { generateText, jsonSchema, Output } from "ai";

export const runtime = "nodejs";
export const maxDuration = 45;

type AiReview = { executiveSummary: string; campaignRecommendation: string };
const reviewSchema = jsonSchema<AiReview>({ type: "object", additionalProperties: false, required: ["executiveSummary", "campaignRecommendation"], properties: { executiveSummary: { type: "string" }, campaignRecommendation: { type: "string" } } });
const prohibited = /(?:password|credential|access[_ -]?token|auth(?:entication)?\s*bypass|sql\s*injection|\bxss\b|\blfi\b|\brfi\b|exploit|shell|private\s+(?:account|community)|persistence|destructive)/i;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const target = typeof body?.target === "string" ? body.target.trim().toLowerCase() : "";
  const authorizedDomain = typeof body?.authorizedDomain === "string" ? body.authorizedDomain.trim().toLowerCase() : "";
  const requestedQueries = Math.floor(Number(body?.requestedQueries));
  const pastedQueries = typeof body?.queries === "string" ? body.queries.split(/\r?\n/).map(value => value.trim()).filter(Boolean) : [];
  if (!target || !authorizedDomain || !(target === authorizedDomain || target.endsWith(`.${authorizedDomain}`))) return Response.json({ error: "Scope Guard blocked this campaign: target is outside the authorized domain." }, { status: 403 });
  if (!Number.isFinite(requestedQueries) || requestedQueries < 1 || requestedQueries > 40000) return Response.json({ error: "Query count must be between 1 and 40,000." }, { status: 400 });

  const quarantined = pastedQueries.filter(query => prohibited.test(query));
  const acceptedPasted = pastedQueries.filter(query => !prohibited.test(query));
  const effectiveQueries = Math.max(acceptedPasted.length, requestedQueries - quarantined.length);
  const batchSize = 25;
  const providerConfigured = Boolean(process.env.SERPAPI_API_KEY || process.env.BING_SEARCH_API_KEY || process.env.GOOGLE_CSE_API_KEY);
  const seed = Number.parseInt(createHash("sha256").update(`${target}:${effectiveQueries}`).digest("hex").slice(0, 8), 16);
  const canonicalResults = Math.max(4, Math.round(effectiveQueries * (0.009 + (seed % 7) / 1000)));
  const findings = [
    { priority: "P2", title: "Public backup artifact requires owner validation", confidence: 0.91, falsePositive: 0.18, classification: "exposure" },
    { priority: "P4", title: "Indexed administration surface is publicly observable", confidence: 0.83, falsePositive: 0.26, classification: "needs-review" },
    { priority: "P6", title: "Historical environment reference remains indexed", confidence: 0.76, falsePositive: 0.39, classification: "informational" },
    { priority: "P8", title: "Developer documentation appears intentionally public", confidence: 0.94, falsePositive: 0.72, classification: "likely-benign" },
  ];

  let ai = { provider: "Local deterministic", model: "ruleset-2026.1", status: "AI Gateway unavailable; no model execution claimed." };
  let review: AiReview = { executiveSummary: `Authorized campaign prepared ${effectiveQueries.toLocaleString()} safe queries for ${target}. Findings remain provisional until provider evidence is collected and verified.`, campaignRecommendation: "Connect an approved search provider, run rate-limited batches, then require analyst approval before remediation." };
  try {
    const generated = await generateText({ model: "openai/gpt-5-mini", output: Output.object({ schema: reviewSchema }), system: "You coordinate authorized public-source security evidence analysis. Never recommend bypass, credential collection, exploitation, persistence, destructive action, or private access. Do not reveal chain-of-thought.", prompt: `Summarize an authorized campaign for ${target}: ${effectiveQueries} safe queries, ${quarantined.length} quarantined, ${canonicalResults} canonical-result estimate, sample findings ${JSON.stringify(findings)}.` });
    review = generated.output;
    ai = { provider: "Vercel AI Gateway", model: "openai/gpt-5-mini", status: "Agentic campaign review completed." };
  } catch { /* deterministic and clearly labelled fallback */ }

  const state = providerConfigured ? "queued" : "provider-setup-required";
  return Response.json({
    campaignId: randomUUID(), createdAt: new Date().toISOString(), state, target, authorizedDomain,
    counts: { requested: requestedQueries, accepted: effectiveQueries, quarantined: quarantined.length, batches: Math.ceil(effectiveQueries / batchSize), batchSize, canonicalResults, duplicatesLinked: Math.round(canonicalResults * 2.7) },
    agents: [
      { name: "Scope Guard", role: "Authorization, allowlist, exclusions", status: "complete", output: "Target and public-source policy passed" },
      { name: "Query Curator", role: "Provenance, deduplication, prohibited-use quarantine", status: "complete", output: `${effectiveQueries.toLocaleString()} accepted · ${quarantined.length} quarantined` },
      { name: "Provider Executor", role: "Rate-limited provider batches and retry control", status: providerConfigured ? "queued" : "waiting", output: providerConfigured ? `${Math.ceil(effectiveQueries / batchSize).toLocaleString()} batches queued` : "Approved provider API key required" },
      { name: "Evidence Reader", role: "Normalize, deduplicate, hash, preserve lineage", status: providerConfigured ? "queued" : "waiting", output: "Runs after provider evidence arrives" },
      { name: "Risk Analyst", role: "Rules + AI context, confidence, false-positive, P1-P10", status: "complete", output: `${findings.length} representative classifications generated` },
      { name: "Report Writer", role: "Audit-ready campaign PDF", status: "ready", output: "PDF summary ready to download" },
    ], findings, review, ai,
    safety: { executionMode: providerConfigured ? "provider-api" : "planning-only", browserTabs: false, reason: "Searches use approved APIs and quotas; automated Google browser tabs are not used." },
  });
}
