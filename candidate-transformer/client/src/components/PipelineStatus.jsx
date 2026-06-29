const steps = ["Uploaded", "Parsed", "Normalized", "Merged", "Validated", "Completed"];

export function PipelineStatus({ active = false, completed = false }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Processing</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-steel">
          {completed ? "Completed" : active ? "Running" : "Idle"}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((step, index) => {
          const isDone = completed || active;
          return (
            <div key={step} className="rounded-md border border-ink/10 bg-field p-3">
              <div className={`mb-2 h-1.5 rounded-full ${isDone ? "bg-moss" : "bg-ink/15"}`} />
              <p className="text-sm font-medium">{step}</p>
              <p className="text-xs text-ink/50">Stage {index + 1}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
