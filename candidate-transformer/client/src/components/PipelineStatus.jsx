const defaultSteps = ["Detect", "Extract", "Normalize", "Deduplication", "Merge", "Confidence", "Project-to-output", "Validate"];

export function PipelineStatus({ active = false, completed = false, steps = defaultSteps }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-[#1f252b]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink dark:text-white">Processing Pipeline</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-steel">
          {completed ? "Completed" : active ? "Running" : "Idle"}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {steps.map((step, index) => {
          const isDone = completed || active;
          return (
            <div key={step} className="rounded-md border border-ink/10 bg-field p-3 dark:border-white/10 dark:bg-[#15191d]">
              <div className={`mb-2 h-1.5 rounded-full ${isDone ? "bg-moss" : "bg-ink/15"}`} />
              <p className="text-sm font-medium text-ink dark:text-white">{step}</p>
              <p className="text-xs text-ink/50 dark:text-white/45">Stage {index + 1}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
