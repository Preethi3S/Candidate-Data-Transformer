import { AlertTriangle, BarChart3, CheckCircle2, Download, GitCompareArrows, Layers3, Moon, Network, Sparkles, Sun, Wand2 } from "lucide-react";

export function PremiumCommandBar({ darkMode, onToggleDarkMode, onLoadDemo, onDownloadBundle, loading }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-coral">Premium workspace</p>
          <h2 className="text-lg font-semibold text-ink dark:text-white">Enterprise explainability controls</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-field px-3 py-2 text-sm font-semibold text-ink transition hover:border-coral/50 dark:border-white/10 dark:bg-[#15191d] dark:text-white" type="button" onClick={onToggleDarkMode}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {darkMode ? "Light" : "Dark"}
          </button>
          <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-field px-3 py-2 text-sm font-semibold text-ink transition hover:border-coral/50 disabled:opacity-60 dark:border-white/10 dark:bg-[#15191d] dark:text-white" type="button" onClick={onLoadDemo} disabled={loading}>
            <Wand2 className="h-4 w-4" />
            Load Demo Dataset
          </button>
          <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-coral px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#c85e3d] disabled:opacity-60" type="button" onClick={onDownloadBundle}>
            <Download className="h-4 w-4" />
            Download Reports
          </button>
        </div>
      </div>
    </section>
  );
}

export function PremiumInsightsPanel({ premium }) {
  if (!premium) return null;
  const { completeness, quality, insights, duplicates = [] } = premium;
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={Layers3} label="Completeness" value={`${completeness.completeness_score}%`} detail={`${completeness.completed_fields}/${completeness.total_expected_fields} expected fields`} />
      <MetricCard icon={Sparkles} label="Quality" value={quality.label} detail={`${quality.quality_score}/100 platform score`} tone="coral" />
      <MetricCard icon={BarChart3} label="Top Skill" value={insights.top_skill || "Unknown"} detail={insights.recommended_action} />
      <MetricCard icon={GitCompareArrows} label="Duplicate Risk" value={duplicates.length ? `${duplicates[0].match_score * 100}%` : "Low"} detail={duplicates.length ? duplicates[0].name || duplicates[0].candidate_id : "No strong matches"} />
    </section>
  );
}

export function ConflictDashboard({ conflicts = [], embedded = false }) {
  return (
    <section className={embedded ? "" : "rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]"}>
      <div className={`${embedded ? "mb-3" : "mb-4"} flex items-center justify-end gap-3`}>
        <span className="rounded-md bg-field px-2 py-1 text-xs font-semibold text-ink dark:bg-[#15191d] dark:text-white">{conflicts.length} conflicts</span>
      </div>
      {conflicts.length ? (
        <div className="space-y-3">
          {conflicts.map((conflict) => (
            <div key={conflict.field} className="rounded-md border border-coral/25 bg-coral/5 p-3 dark:border-coral/40">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-ink dark:text-white">{conflict.field}</h3>
                <span className="text-sm font-semibold text-coral">Winner: {formatValue(conflict.winner)}</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {conflict.candidates.map((candidate, index) => (
                  <div key={`${conflict.field}-${index}`} className="rounded-md bg-white p-3 text-sm shadow-sm dark:bg-[#15191d]">
                    <div className="flex justify-between gap-2 text-ink dark:text-white"><span className="font-semibold">{candidate.source}</span><span>{Math.round(candidate.confidence * 100)}%</span></div>
                    <p className="mt-1 break-words text-ink/70 dark:text-white/65">{formatValue(candidate.value)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-ink/70 dark:text-white/65">Reason: {conflict.reason}</p>
            </div>
          ))}
        </div>
      ) : <EmptyState text="No conflicts detected in this transformation." />}
    </section>
  );
}

export function SourceReliabilityDashboard({ reliability = {} }) {
  const entries = Object.entries(reliability);
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]">
      <h2 className="mb-4 text-base font-semibold text-ink dark:text-white">Source Reliability</h2>
      <div className="space-y-3">
        {entries.length ? entries.map(([source, score]) => (
          <ProgressRow key={source} label={source} score={score} />
        )) : <EmptyState text="No source reliability data yet." />}
      </div>
    </section>
  );
}

export function SkillIntelligencePanel({ skills = [], embedded = false }) {
  return (
    <section className={embedded ? "" : "rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]"}>
      <div className="space-y-2">
        {skills.length ? skills.map((skill) => (
          <div key={skill.canonical_skill} className="rounded-md border border-ink/10 bg-field p-3 dark:border-white/10 dark:bg-[#15191d]">
            <div className="mb-2 flex items-center justify-between gap-3"><span className="font-semibold text-ink dark:text-white">{skill.canonical_skill}</span><span className="text-sm text-moss">{Math.round(skill.confidence * 100)}%</span></div>
            <p className="text-sm text-ink/60 dark:text-white/60">Aliases: {skill.aliases.join(", ")}</p>
            <p className="text-sm text-ink/60 dark:text-white/60">Sources: {skill.sources.join(", ") || "Unknown"} · Frequency: {skill.frequency}</p>
          </div>
        )) : <EmptyState text="No normalized skills detected yet." />}
      </div>
    </section>
  );
}

export function AuditTimeline({ auditTrail = [], embedded = false }) {
  return (
    <section className={embedded ? "" : "rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]"}>
      <div className="space-y-2">
        {auditTrail.map((entry) => (
          <div key={entry.step} className="flex gap-3">
            <div className={`mt-1 h-3 w-3 rounded-full ${entry.status === "success" ? "bg-moss" : "bg-coral"}`} />
            <div className="min-w-0 flex-1 border-b border-ink/10 pb-2 dark:border-white/10">
              <div className="flex flex-wrap justify-between gap-2"><span className="font-semibold text-ink dark:text-white">{entry.step}</span><span className="text-xs text-ink/50 dark:text-white/45">{new Date(entry.timestamp).toLocaleTimeString()}</span></div>
              <p className="text-sm capitalize text-ink/60 dark:text-white/60">{entry.status}{entry.notes ? ` · ${entry.notes}` : ""}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DataQualityWarnings({ warnings = [], embedded = false }) {
  return (
    <section className={embedded ? "" : "rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]"}>
      <div className="flex flex-wrap gap-2">
        {warnings.length ? warnings.map((warning, index) => (
          <span key={`${warning.code}-${index}`} className="inline-flex items-center gap-2 rounded-md border border-coral/25 bg-coral/10 px-3 py-2 text-sm font-semibold text-ink dark:text-white">
            <AlertTriangle className="h-4 w-4 text-coral" />
            {warning.message}
          </span>
        )) : <span className="inline-flex items-center gap-2 rounded-md border border-moss/20 bg-moss/10 px-3 py-2 text-sm font-semibold text-ink dark:text-white"><CheckCircle2 className="h-4 w-4 text-moss" />No quality warnings</span>}
      </div>
    </section>
  );
}

export function ArchitectureVisualization({ embedded = false }) {
  const steps = ["Upload", "Parse", "Normalize", "Merge", "Conflict Resolver", "Confidence", "Projection", "Complete"];
  return (
    <section className={embedded ? "" : "rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]"}>
      {!embedded && <div className="mb-4 flex items-center gap-2"><Network className="h-5 w-5 text-coral" /><h2 className="text-base font-semibold text-ink dark:text-white">Architecture Flow</h2></div>}
      <div className="grid gap-2 sm:grid-cols-4">
        {steps.map((step, index) => <div key={step} className="rounded-md border border-ink/10 bg-field p-3 text-sm font-semibold text-ink dark:border-white/10 dark:bg-[#15191d] dark:text-white">{index + 1}. {step}</div>)}
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "moss" }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]">
      <div className={`mb-3 inline-flex rounded-md p-2 ${tone === "coral" ? "bg-coral/10 text-coral" : "bg-moss/10 text-moss"}`}><Icon className="h-5 w-5" /></div>
      <p className="text-sm font-semibold text-ink/55 dark:text-white/55">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-ink/55 dark:text-white/55">{detail}</p>
    </div>
  );
}

function ProgressRow({ label, score }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-ink dark:text-white"><span className="font-semibold">{label}</span><span>{Math.round(score * 100)}%</span></div>
      <div className="h-2 rounded-full bg-ink/10 dark:bg-white/10"><div className="h-2 rounded-full bg-moss" style={{ width: `${Math.max(score * 100, 2)}%` }} /></div>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="rounded-md bg-field px-3 py-3 text-sm text-ink/55 dark:bg-[#15191d] dark:text-white/55">{text}</p>;
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "No value";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
