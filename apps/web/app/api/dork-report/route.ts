function escapePdf(value: string) { return value.replace(/[^\x20-\x7E]/g, "-").replace(/([\\()])/g, "\\$1"); }

function makePdf(lines: string[]) {
  const visible = lines.flatMap(line => line.match(/.{1,86}(?:\s|$)/g) ?? [line]).slice(0, 48);
  const stream = `BT\n/F1 10 Tf\n48 770 Td\n14 TL\n${visible.map((line, index) => `${index ? "T* " : ""}(${escapePdf(line.trim())}) Tj`).join("\n")}\nET`;
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>", `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  let pdf = "%PDF-1.4\n", offset = pdf.length; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(offset); const block = `${index + 1} 0 obj\n${object}\nendobj\n`; pdf += block; offset += block.length; });
  const xref = offset; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(value => `${String(value).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, any> | null;
  if (!body?.campaignId || !body?.target) return Response.json({ error: "Campaign result required." }, { status: 400 });
  const lines = ["QUERY INTELLIGENCE - AUTHORIZED DORK CAMPAIGN REPORT", "", `Campaign: ${body.campaignId}`, `Target: ${body.target}`, `Created: ${body.createdAt}`, `State: ${body.state}`, "", "EXECUTIVE SUMMARY", String(body.review?.executiveSummary ?? ""), "", "CONTROL SUMMARY", `Queries accepted: ${body.counts?.accepted ?? 0}`, `Queries quarantined: ${body.counts?.quarantined ?? 0}`, `Provider batches: ${body.counts?.batches ?? 0}`, `Execution mode: ${body.safety?.executionMode ?? "unknown"}`, "", "REPRESENTATIVE FINDINGS", ...(Array.isArray(body.findings) ? body.findings.map((finding: any) => `${finding.priority} - ${finding.title} - confidence ${Math.round(finding.confidence * 100)}%`) : []), "", "AGENT PIPELINE", ...(Array.isArray(body.agents) ? body.agents.map((agent: any) => `${agent.name}: ${agent.status} - ${agent.output}`) : []), "", "SAFETY NOTE", "Public or explicitly authorized sources only. No authentication bypass, credential harvesting, private access, exploitation, persistence, destructive actions, or automated Google browser tabs."];
  return new Response(makePdf(lines), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="dork-campaign-${String(body.campaignId).slice(0, 8)}.pdf"` } });
}
