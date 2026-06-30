import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ChevronDown, LogOut, RefreshCw, Upload, UserRound } from "lucide-react";
import { processDemoDataset, uploadCandidate } from "../services/api";
import { FileUploadCard } from "../components/FileUploadCard";
import { PipelineStatus } from "../components/PipelineStatus";
import { CanonicalProfile } from "../components/CanonicalProfile";
import { JsonViewer } from "../components/JsonViewer";
import { LineagePanel } from "../components/LineagePanel";
import { ConfidenceDashboard } from "../components/ConfidenceDashboard";
import { formatDefaultProjectionConfig } from "../projection/configFormatter";
import { useAuth } from "../hooks/useAuth";
import {
  ArchitectureVisualization,
  AuditTimeline,
  ConflictDashboard,
  DataQualityWarnings,
  PremiumCommandBar,
  PremiumInsightsPanel,
  SkillIntelligencePanel,
  SourceReliabilityDashboard
} from "../components/PremiumPanels";

export function Dashboard() {
  const { register, handleSubmit, watch } = useForm();
  const { user, logOut } = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem("candidate-transformer-theme") === "dark");
  const watched = watch();

  const validationErrors = useMemo(() => result?.validation?.errors || [], [result]);

  useEffect(() => {
    window.localStorage.setItem("candidate-transformer-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  async function onSubmit(values) {
    setLoading(true);
    setError("");
    try {
      const data = await uploadCandidate({
        csvFile: values.csvFile?.[0],
        resumeFile: values.resumeFile?.[0],
        atsFile: values.atsFile?.[0],
        linkedinFile: values.linkedinFile?.[0],
        githubFile: values.githubFile?.[0],
        configFile: values.configFile?.[0],
        atsJson: values.atsJson,
        linkedinJson: values.linkedinJson,
        githubJson: values.githubJson
      });
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDemoDataset() {
    setLoading(true);
    setError("");
    try {
      const data = await processDemoDataset();
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadReports() {
    if (!result) return;
    const reports = {
      canonicalProfile: result.canonicalProfile,
      projectedProfile: result.projectedProfile,
      provenanceReport: result.canonicalProfile?.provenance || [],
      auditReport: result.premium?.auditTrail || [],
      premiumInsights: result.premium || {}
    };
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `candidate-reports-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className={`${darkMode ? "dark bg-[#15191d]" : "bg-field"} min-h-screen`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-coral">Secure recruiter workspace</p>
            <h1 className="text-2xl font-semibold tracking-normal text-ink dark:text-white">Multi-Source Candidate Data Transformer</h1>
            <p className="mt-1 text-sm text-ink/60 dark:text-white/60">Recruiting intelligence ingestion, normalization, provenance, and configurable projection.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-field px-3 py-2 text-sm text-ink dark:border-white/10 dark:bg-[#15191d] dark:text-white">
              <UserRound className="h-4 w-4 text-moss" />
              <span className="font-semibold">{user?.name}</span>
            </div>
            <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-coral/50 hover:text-coral dark:border-white/10 dark:bg-[#15191d] dark:text-white" type="button" onClick={logOut}>
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <form onSubmit={handleSubmit(onSubmit)}>
              <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-steel disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Submit
              </button>
            </form>
          </div>
        </div>
      </header>

      <PremiumCommandBar darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} onLoadDemo={loadDemoDataset} onDownloadBundle={downloadReports} loading={loading} />

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
        <FileUploadCard label="Recruiter CSV" accept=".csv,text/csv" registration={register("csvFile")} value={watched.csvFile} />
        <FileUploadCard label="Resume PDF" accept=".pdf,.txt" registration={register("resumeFile")} value={watched.resumeFile} />
        <FileUploadCard label="ATS JSON" accept=".json,application/json" registration={register("atsFile")} value={watched.atsFile} />
        <FileUploadCard label="LinkedIn JSON" accept=".json,application/json" registration={register("linkedinFile")} value={watched.linkedinFile} />
        <FileUploadCard label="GitHub JSON" accept=".json,application/json" registration={register("githubFile")} value={watched.githubFile} />
        <FileUploadCard label="Projection Config" accept=".json,application/json" registration={register("configFile")} value={watched.configFile} />
      </form>
{/* 
      <section className="grid gap-4 rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b] md:grid-cols-2">
        <SourceTextArea label="ATS JSON" placeholder='{"candidateName":"Preethi S","email":"preethi@gmail.com","yearsExp":2}' registration={register("atsJson")} />
        <SourceTextArea label="LinkedIn Profile JSON" placeholder='{"name":"Preethi S","headline":"Software Engineer","skills":["Java","React"]}' registration={register("linkedinJson")} />
        <SourceTextArea label="GitHub Profile JSON" placeholder='{"github_url":"https://github.com/preethi3s","languages":["JavaScript","TypeScript"]}' registration={register("githubJson")} />
      </section> */}

      {error && <div className="rounded-md border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink dark:text-white">{error}</div>}

      <details className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]">
        <summary className="cursor-pointer text-sm font-semibold text-ink dark:text-white">Default Projection Config</summary>
        <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-[#172026] p-4 text-sm leading-6 text-[#f6f7f2]"><code>{formatDefaultProjectionConfig()}</code></pre>
      </details>

      <PipelineStatus active={loading} completed={Boolean(result)} steps={result?.pipeline} />

      {result && (
        <>
          <section className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2">
            <JsonViewer title="Projected Output" data={result.projectedProfile} />
            <JsonViewer title="Canonical JSON" data={result.canonicalProfile} />
          </section>

          {validationErrors.length > 0 && (
            <section className="rounded-lg border border-coral/30 bg-white p-4 shadow-panel dark:bg-[#1f252b]">
              <h2 className="mb-2 text-base font-semibold text-ink dark:text-white">Validation Notes</h2>
              <ul className="space-y-1 text-sm text-ink/70 dark:text-white/65">
                {validationErrors.map((item, index) => <li key={`${item.message}-${index}`}>{item.source ? `${item.source}: ` : ""}{item.message || item.code}</li>)}
              </ul>
            </section>
          )}

          <PremiumInsightsPanel premium={result.premium} />

          <CanonicalProfile profile={result.canonicalProfile} />

          <div className="space-y-4">
            <CollapsibleSection title="Candidate Lineage">
              <LineagePanel profile={result.canonicalProfile} conflicts={result.conflicts} embedded />
            </CollapsibleSection>

            <div className="grid gap-4 lg:grid-cols-2">
              <ConfidenceDashboard confidence={result.confidence} />
              <SourceReliabilityDashboard reliability={result.premium?.sourceReliability} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <CollapsibleSection title="Skill Intelligence">
                <SkillIntelligencePanel skills={result.premium?.skillIntelligence} embedded />
              </CollapsibleSection>
              <CollapsibleSection title="Transformation Audit Trail">
                <AuditTimeline auditTrail={result.premium?.auditTrail} embedded />
              </CollapsibleSection>
              
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <CollapsibleSection title="Conflict Resolution">
                <ConflictDashboard conflicts={result.conflicts} embedded />
              </CollapsibleSection>
              <CollapsibleSection title="Data Quality Warnings">
                <DataQualityWarnings warnings={result.premium?.warnings} embedded />
              </CollapsibleSection>
            </div>

            <CollapsibleSection title="Architecture Flow">
              <ArchitectureVisualization embedded />
            </CollapsibleSection>
          </div>
        </>
      )}
      </div>
    </main>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }) {
  return (
    <details className="group overflow-hidden rounded-lg border border-ink/10 bg-white shadow-panel dark:border-white/10 dark:bg-[#1f252b]" open={defaultOpen}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-base font-semibold text-ink transition hover:bg-field dark:text-white dark:hover:bg-[#15191d]">
        <span>{title}</span>
        <ChevronDown className="h-5 w-5 text-ink/55 transition group-open:rotate-180 dark:text-white/55" />
      </summary>
      <div className="border-t border-ink/10 p-3 dark:border-white/10">
        {children}
      </div>
    </details>
  );
}

function SourceTextArea({ label, placeholder, registration }) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1 block text-sm font-semibold text-ink dark:text-white">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-md border border-ink/15 bg-field px-3 py-2 text-sm text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20 dark:border-white/10 dark:bg-[#15191d] dark:text-white"
        placeholder={placeholder}
        {...registration}
      />
    </label>
  );
}
