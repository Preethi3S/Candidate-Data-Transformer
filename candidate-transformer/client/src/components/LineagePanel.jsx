export function LineagePanel({ profile, conflicts = [], embedded = false }) {
  const provenance = profile?.provenance || [];
  const grouped = provenance.reduce((acc, entry) => {
    acc[entry.field] = acc[entry.field] || [];
    acc[entry.field].push(entry);
    return acc;
  }, {});

  return (
    <section className={embedded ? "" : "rounded-lg border border-ink/10 bg-white p-4 shadow-panel"}>
      <div className="space-y-3">
        {Object.entries(grouped).slice(0, 8).map(([field, entries]) => {
          const conflict = conflicts.find((item) => item.field === field);
          return (
            <div key={field} className="rounded-md border border-ink/10 bg-field p-3 dark:border-white/10 dark:bg-[#15191d]">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{field}</h3>
                {conflict && <span className="rounded-md bg-coral px-2 py-1 text-xs font-semibold text-white">Conflict</span>}
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {entries.map((entry, index) => (
                  <div key={`${field}-${index}`} className="rounded-md bg-white p-2 text-sm shadow-sm dark:bg-[#1f252b]">
                    <div className="mb-1 flex justify-between gap-2">
                      <span className="font-semibold">{entry.source}</span>
                      <span className="text-moss">{(entry.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <p className="break-words text-ink/75 dark:text-white/70">{formatValue(entry.value)}</p>
                    <p className="mt-1 text-xs text-ink/45 dark:text-white/45">{entry.method}</p>
                  </div>
                ))}
              </div>
              {conflict && (
                <div className="mt-2 rounded-md border border-moss/30 bg-white px-3 py-2 text-sm dark:bg-[#1f252b]">
                  <span className="font-semibold">Winner:</span> {formatValue(conflict.winner)} · {conflict.reason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "No value";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
