export function CanonicalProfile({ profile }) {
  if (!profile) return null;

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{profile.full_name || "Unnamed Candidate"}</h2>
          <p className="text-sm text-ink/60">{profile.headline || "No headline available"}</p>
        </div>
        <span className="rounded-md bg-moss px-3 py-1 text-sm font-semibold text-white">
          {(profile.overall_confidence * 100).toFixed(0)}%
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <InfoBlock label="Emails" items={profile.emails} />
        <InfoBlock label="Phones" items={profile.phones} />
        <InfoBlock label="Skills" items={profile.skills?.map((skill) => skill.name)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Table title="Experience" rows={profile.experience} columns={["title", "company", "start_date", "end_date"]} />
        <Table title="Education" rows={profile.education} columns={["degree", "institution", "graduation_year"]} />
      </div>
    </section>
  );
}

function InfoBlock({ label, items = [] }) {
  return (
    <div className="rounded-md border border-ink/10 bg-field p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.length ? items.map((item) => (
          <span key={item} className="rounded-md bg-white px-2 py-1 text-xs font-medium text-ink shadow-sm">{item}</span>
        )) : <span className="text-sm text-ink/45">No data</span>}
      </div>
    </div>
  );
}

function Table({ title, rows = [], columns }) {
  return (
    <div className="overflow-hidden rounded-md border border-ink/10">
      <div className="bg-field px-3 py-2 text-sm font-semibold">{title}</div>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white text-xs uppercase text-ink/50">
            <tr>{columns.map((column) => <th key={column} className="px-3 py-2">{column.replace("_", " ")}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t border-ink/10">
                {columns.map((column) => <td key={column} className="px-3 py-2">{row[column] || "-"}</td>)}
              </tr>
            )) : (
              <tr><td className="px-3 py-3 text-ink/45" colSpan={columns.length}>No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
