import { useState } from "react";
import { prettyJson } from "../utils/json";
import { Maximize2, X } from "lucide-react";

export function JsonViewer({ title, data }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-panel dark:border-white/10 dark:bg-[#1f252b]">
        <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3 dark:border-white/10">
          <h2 className="text-base font-semibold text-ink dark:text-white">{title}</h2>
          <button
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-ink/10 bg-field px-3 py-2 text-sm font-semibold text-ink transition hover:border-coral/50 dark:border-white/10 dark:bg-[#15191d] dark:text-white"
            type="button"
            onClick={() => setOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
            Open
          </button>
        </div>
        <pre className="max-h-[420px] overflow-auto bg-[#172026] p-4 text-sm leading-6 text-[#f6f7f2]">
          <code>{prettyJson(data)}</code>
        </pre>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={title}>
          <section className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl dark:bg-[#1f252b]">
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3 dark:border-white/10">
              <h2 className="text-base font-semibold text-ink dark:text-white">{title}</h2>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 bg-field text-ink transition hover:border-coral/50 dark:border-white/10 dark:bg-[#15191d] dark:text-white"
                type="button"
                onClick={() => setOpen(false)}
                aria-label={`Close ${title}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <pre className="min-h-0 flex-1 overflow-auto bg-[#172026] p-4 text-sm leading-6 text-[#f6f7f2]">
              <code>{prettyJson(data)}</code>
            </pre>
          </section>
        </div>
      )}
    </>
  );
}
