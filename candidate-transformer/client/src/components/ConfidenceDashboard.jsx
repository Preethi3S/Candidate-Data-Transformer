export function ConfidenceDashboard({ confidence }) {
  const fields = confidence?.fieldConfidence || {};
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Confidence</h2>
        <span className="text-2xl font-semibold text-moss">
          {confidence ? `${(confidence.overall_confidence * 100).toFixed(0)}%` : "--"}
        </span>
      </div>
      <div className="space-y-3">
        {Object.entries(fields).map(([field, score]) => (
          <div key={field}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="capitalize">{field.replace("_", " ")}</span>
              <span>{(score * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-ink/10">
              <div className="h-2 rounded-full bg-coral" style={{ width: `${Math.max(score * 100, 2)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
