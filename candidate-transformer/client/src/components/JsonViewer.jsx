import { prettyJson } from "../utils/json";

export function JsonViewer({ title, data }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white shadow-panel">
      <div className="border-b border-ink/10 px-4 py-3">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <pre className="max-h-[520px] overflow-auto bg-[#172026] p-4 text-sm leading-6 text-[#f6f7f2]">
        <code>{prettyJson(data)}</code>
      </pre>
    </section>
  );
}
