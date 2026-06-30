import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { LogOut, RefreshCw, Upload, UserRound } from "lucide-react";
import { uploadCandidate } from "../services/api";
import { FileUploadCard } from "../components/FileUploadCard";
import { PipelineStatus } from "../components/PipelineStatus";
import { CanonicalProfile } from "../components/CanonicalProfile";
import { JsonViewer } from "../components/JsonViewer";
import { LineagePanel } from "../components/LineagePanel";
import { ConfidenceDashboard } from "../components/ConfidenceDashboard";
import { formatDefaultProjectionConfig } from "../projection/configFormatter";
import { useAuth } from "../hooks/useAuth";

export function Dashboard() {
  const { register, handleSubmit, watch } = useForm();
  const { user, logOut } = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const watched = watch();

  const validationErrors = useMemo(() => result?.validation?.errors || [], [result]);

  async function onSubmit(values) {
    setLoading(true);
    setError("");
    try {
      const data = await uploadCandidate({
        csvFile: values.csvFile?.[0],
        resumeFile: values.resumeFile?.[0],
        configFile: values.configFile?.[0]
      });
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-coral">Secure recruiter workspace</p>
          <h1 className="text-2xl font-semibold tracking-normal">Multi-Source Candidate Data Transformer</h1>
          <p className="mt-1 text-sm text-ink/60">Recruiting intelligence ingestion, normalization, provenance, and configurable projection.</p>
        </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-field px-3 py-2 text-sm">
              <UserRound className="h-4 w-4 text-moss" />
              <span className="font-semibold">{user?.name}</span>
            </div>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-coral/50 hover:text-coral"
              type="button"
              onClick={logOut}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <form onSubmit={handleSubmit(onSubmit)}>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-steel disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Process
              </button>
            </form>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
        <FileUploadCard label="Recruiter CSV" accept=".csv,text/csv" registration={register("csvFile")} value={watched.csvFile} />
        <FileUploadCard label="Resume PDF" accept=".pdf,.txt" registration={register("resumeFile")} value={watched.resumeFile} />
        <FileUploadCard label="Projection Config" accept=".json,application/json" registration={register("configFile")} value={watched.configFile} />
      </form>

      {error && <div className="rounded-md border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink">{error}</div>}

      <details className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
        <summary className="cursor-pointer text-sm font-semibold">Default Projection Config</summary>
        <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-[#172026] p-4 text-sm leading-6 text-[#f6f7f2]">
          <code>{formatDefaultProjectionConfig()}</code>
        </pre>
      </details>

      <PipelineStatus active={loading} completed={Boolean(result)} />

      {validationErrors.length > 0 && (
        <section className="rounded-lg border border-coral/30 bg-white p-4 shadow-panel">
          <h2 className="mb-2 text-base font-semibold">Validation Notes</h2>
          <ul className="space-y-1 text-sm text-ink/70">
            {validationErrors.map((item, index) => (
              <li key={`${item.message}-${index}`}>{item.source ? `${item.source}: ` : ""}{item.message || item.code}</li>
            ))}
          </ul>
        </section>
      )}

      {result && (
        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-5">
            <CanonicalProfile profile={result.canonicalProfile} />
            <LineagePanel profile={result.canonicalProfile} conflicts={result.conflicts} />
          </div>
          <div className="space-y-5">
            <ConfidenceDashboard confidence={result.confidence} />
            <JsonViewer title="Projected Output" data={result.projectedProfile} />
            <JsonViewer title="Canonical JSON" data={result.canonicalProfile} />
          </div>
        </div>
      )}
    </main>
  );
}
