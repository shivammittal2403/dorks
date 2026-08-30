"use client";

import { FormEvent, useState } from "react";

const navigation = ["Overview", "Projects", "Investigations", "Query Library", "Providers", "Findings", "Evidence", "Correlation", "Reports", "Audit Log", "Settings"];
const findings = [
  { priority: "P2", title: "Public storage policy needs review", asset: "cdn.acme.example", confidence: "94%", state: "Review required" },
  { priority: "P5", title: "Historical endpoint remains indexed", asset: "docs.acme.example", confidence: "78%", state: "Triaged" },
  { priority: "P8", title: "Expected public developer documentation", asset: "developer.acme.example", confidence: "97%", state: "Confirmed benign" },
];

function Dashboard({ onNavigate }: { onNavigate: (section: string) => void }) {
  const priorities = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"];
  return <>
    <div className="authorization"><div className="shield">✓</div><div><strong>Authorization is active</strong><span>Scope attestation valid through 18 Sep 2026 · 12 allowed assets · 3 exclusions</span></div><button className="textButton" onClick={() => onNavigate("Projects")}>Review scope →</button></div>
    <div className="metrics">{[["Asset coverage", "84%", "+9 this run"], ["Queries executed", "1,284", "97.2% complete"], ["Canonical results", "342", "1,906 duplicates linked"], ["Open findings", "27", "4 require review"], ["AI + search cost", "$18.42", "62% of budget"]].map(([k, v, s]) => <article key={k}><span>{k}</span><b>{v}</b><small>{s}</small></article>)}</div>
    <div className="grid"><article className="panel risk"><div className="panelHead"><div><p className="eyebrow">RISK DISTRIBUTION</p><h2>Priority posture</h2></div><span>Ruleset 2026.1</span></div><div className="bars">{priorities.map((priority, index) => <div key={priority}><span>{priority}</span><i style={{ height: `${[68, 92, 55, 42, 78, 62, 38, 27, 16, 9][index]}%` }} /><small>{[1, 3, 4, 2, 6, 4, 3, 2, 1, 1][index]}</small></div>)}</div><p className="note">Priority is deterministic and reproducible. A search hit is not automatically a vulnerability.</p></article>
      <article className="panel pipeline"><div className="panelHead"><div><p className="eyebrow">LIVE PIPELINE</p><h2>Evidence processing</h2></div><span className="live">● RUNNING</span></div>{[["Provider execution", "1,284 / 1,320", "97%"], ["Normalization & dedup", "1,247 / 1,284", "94%"], ["Evidence collection", "318 / 342", "93%"], ["Deterministic analysis", "286 / 318", "90%"], ["AI contextual review", "108 / 127", "85%"]].map(([label, value, progress]) => <div className="step" key={label}><div><strong>{label}</strong><span>{value}</span></div><div className="track"><i style={{ width: progress }} /></div></div>)}</article></div>
    <article className="panel findings"><div className="panelHead"><div><p className="eyebrow">REVIEW QUEUE</p><h2>Findings needing attention</h2></div><button className="textButton" onClick={() => onNavigate("Findings")}>View all findings →</button></div><div className="table"><div className="row heading"><span>Priority</span><span>Finding</span><span>Asset</span><span>Confidence</span><span>State</span></div>{findings.map(finding => <button className="row findingRow" key={finding.title} onClick={() => onNavigate("Findings")}><span><b className={`badge ${finding.priority}`}>{finding.priority}</b></span><span><strong>{finding.title}</strong><small>Evidence lineage complete</small></span><span>{finding.asset}</span><span>{finding.confidence}</span><span>{finding.state}</span></button>)}</div></article>
  </>;
}

function InvestigationEngine() {
  const [target, setTarget] = useState("cdn.acme.example");
  const [authorizedDomain, setAuthorizedDomain] = useState("acme.example");
  const [sourceClass, setSourceClass] = useState("web-search");
  const [evidence, setEvidence] = useState("Public search result exposes a directory listing containing dated configuration backup files.");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const run = async (event: FormEvent) => {
    event.preventDefault(); setRunning(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target, authorizedDomain, sourceClass, evidence }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Analysis could not be completed.");
      setResult(body);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Analysis could not be completed."); }
    finally { setRunning(false); }
  };

  return <div className="engineGrid"><article className="panel engineForm"><div className="panelHead"><div><p className="eyebrow">AUTHORIZED ANALYSIS</p><h2>Run Investigation Engine</h2></div><span>Public evidence only</span></div><p className="moduleCopy">The engine validates authorization and scope before contextual AI analysis, deterministic risk scoring, and lineage creation.</p><form onSubmit={run}><div className="fieldPair"><label>Target asset<input value={target} onChange={event => setTarget(event.target.value)} required /></label><label>Authorized root domain<input value={authorizedDomain} onChange={event => setAuthorizedDomain(event.target.value)} required /></label></div><label>Source class<select value={sourceClass} onChange={event => setSourceClass(event.target.value)}><option value="web-search">Web search / SERP</option><option value="certificate-transparency">Certificate transparency</option><option value="dns-rdap">DNS / RDAP</option><option value="public-code">Public code search</option></select></label><label>Observed public evidence<textarea value={evidence} onChange={event => setEvidence(event.target.value)} rows={6} required /></label><div className="gateStrip"><span>✓ Authorization gate</span><span>✓ Allowlist gate</span><span>✓ Safety policy</span></div>{error ? <div className="engineError" role="alert">{error}</div> : null}<button type="submit" disabled={running}>{running ? "Analyzing evidence…" : "Run analysis engine"}</button></form></article>
    <article className="panel engineResult"><div className="panelHead"><div><p className="eyebrow">STRUCTURED FINDING</p><h2>{result ? result.analysis.title : "Awaiting authorized evidence"}</h2></div>{result ? <b className={`badge ${result.risk.priority}`}>{result.risk.priority}</b> : null}</div>{!result ? <div className="engineEmpty"><div className="emptyIcon">AI</div><p>No model claim is shown until a run completes. If managed AI is unavailable, the response is clearly labelled as deterministic.</p></div> : <><div className="providerStatus"><strong>{result.ai.provider}</strong><span>{result.ai.model} · {result.ai.status}</span></div><p className="resultSummary">{result.analysis.summary}</p><div className="resultMetrics"><div><span>Risk score</span><b>{result.risk.score}/10</b></div><div><span>Confidence</span><b>{Math.round(result.analysis.confidence * 100)}%</b></div><div><span>False positive</span><b>{Math.round(result.analysis.falsePositiveProbability * 100)}%</b></div><div><span>Classification</span><b>{result.analysis.classification}</b></div></div><div className="recommendation"><span>Recommended action</span><p>{result.analysis.recommendedAction}</p></div><div className="lineage"><span>Evidence lineage</span>{result.lineage.map((item: string, index: number) => <div key={item}><i>{index + 1}</i>{item}</div>)}</div></>}</article></div>;
}

function SectionView({ section }: { section: string }) {
  const descriptions: Record<string, string> = {
    Projects: "Manage authorized assets, scope rules, exclusions, and attestations.", Investigations: "Plan and monitor provider-native query runs.", "Query Library": "Review safe query templates, provenance, quality, and provider support.", Providers: "Configure provider capabilities, permissions, health, and rate limits.", Findings: "Triage canonical findings and analyst review decisions.", Evidence: "Inspect hashed artifacts and complete evidence lineage.", Correlation: "Explore supported entity relationships without asserting weak identities.", Reports: "Generate executive, technical, query, JSON, CSV, and XLSX reports.", "Audit Log": "Review immutable authorization and access events.", Settings: "Configure tenant AI policy, budgets, retention, and notifications.",
  };
  return <div className="moduleGrid"><article className="panel moduleIntro"><p className="eyebrow">WORKSPACE MODULE</p><h2>{section}</h2><p>{descriptions[section] ?? "Workspace module ready for connected API data."}</p><div className="moduleStats"><div><span>Policy state</span><b>Enforced</b></div><div><span>Tenant boundary</span><b>Isolated</b></div><div><span>Audit events</span><b>Current</b></div></div></article><article className="panel moduleFeed"><div className="panelHead"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>{section} workspace</h2></div><span>Live module</span></div>{["Authorization and scope policy evaluated", "Tenant data boundary verified", "Evidence lineage checkpoint recorded"].map((item, index) => <div className="activity" key={item}><i>✓</i><div><strong>{item}</strong><span>{index + 2} minutes ago · audit-ready</span></div></div>)}</article></div>;
}

function InvestigationModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("External exposure review");
  const [domain, setDomain] = useState("acme.example");
  const submit = (event: FormEvent) => { event.preventDefault(); if (step < 3) setStep(value => value + 1); else onCreate(name); };
  return <div className="modalBackdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="wizard-title"><div className="modalHead"><div><p className="eyebrow">NEW INVESTIGATION · STEP {step} OF 3</p><h2 id="wizard-title">{step === 1 ? "Investigation details" : step === 2 ? "Authorized scope" : "Review and authorize"}</h2></div><button className="closeButton" onClick={onClose} aria-label="Close investigation wizard">×</button></div><div className="progress"><i style={{ width: `${step * 33.33}%` }} /></div><form onSubmit={submit}>
    {step === 1 ? <><label>Investigation name<input value={name} onChange={event => setName(event.target.value)} required /></label><label>Investigation profile<select defaultValue="balanced"><option value="balanced">Balanced external exposure</option><option value="local">Local-only privacy review</option><option value="quality">Best quality analysis</option></select></label></> : null}
    {step === 2 ? <><label>Authorized root domain<input value={domain} onChange={event => setDomain(event.target.value)} required /></label><fieldset><legend>Permitted source classes</legend><label className="check"><input type="checkbox" defaultChecked /> Web search / SERP</label><label className="check"><input type="checkbox" defaultChecked /> Certificate transparency</label><label className="check"><input type="checkbox" defaultChecked /> DNS / RDAP</label></fieldset></> : null}
    {step === 3 ? <div className="reviewCard"><strong>{name}</strong><span>Target: {domain}</span><span>AI mode: Balanced · Evidence retention: 180 days</span><p>Execution remains blocked until an active authorization attestation and matching allow rules are saved.</p></div> : null}
    <div className="modalActions">{step > 1 ? <button type="button" className="secondary" onClick={() => setStep(value => value - 1)}>Back</button> : <span />}<button type="submit">{step === 3 ? "Create draft" : "Continue"}</button></div>
  </form></section></div>;
}

export default function DashboardPage() {
  const [active, setActive] = useState("Overview");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [toast, setToast] = useState("");
  const createInvestigation = (name: string) => { setWizardOpen(false); setActive("Investigations"); setToast(`${name} created as a draft`); };
  return <main><aside><div className="brand"><span className="mark">QI</span><div>Query Intelligence<small>Evidence Platform</small></div></div><nav aria-label="Primary navigation">{navigation.map(item => <button className={active === item ? "active" : ""} key={item} onClick={() => { setActive(item); setToast(""); }}>{item}</button>)}</nav><div className="tenant">TENANT<br /><strong>Northstar Security</strong><span>Authorized workspace</span></div></aside><section className="content"><header><div><p className="eyebrow">ACME / EXTERNAL EXPOSURE</p><h1>{active === "Overview" ? "Investigation overview" : active}</h1></div><button onClick={() => setWizardOpen(true)}>+ New investigation</button></header>{toast ? <div className="toast" role="status">✓ {toast}</div> : null}{active === "Overview" ? <Dashboard onNavigate={setActive} /> : active === "Investigations" ? <InvestigationEngine /> : <SectionView section={active} />}</section>{wizardOpen ? <InvestigationModal onClose={() => setWizardOpen(false)} onCreate={createInvestigation} /> : null}</main>;
}
