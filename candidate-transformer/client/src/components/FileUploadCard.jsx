import { FileUp } from "lucide-react";

export function FileUploadCard({ label, accept, registration, value }) {
  return (
    <label className="block rounded-lg border border-ink/10 bg-white p-4 shadow-panel transition hover:border-coral/60">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="text-xs text-ink/55">{accept || "Any supported file"}</p>
        </div>
        <FileUp className="h-5 w-5 text-coral" aria-hidden="true" />
      </div>
      <input className="sr-only" type="file" accept={accept} {...registration} />
      <div className="truncate rounded-md border border-dashed border-ink/20 bg-field px-3 py-2 text-sm text-ink/70">
        {value?.[0]?.name || "Select file"}
      </div>
    </label>
  );
}
