export default function FullHeader() {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-4 backdrop-blur-xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-emerald-200">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Workflow Control Room
      </div>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        A cleaner operating dashboard for planning, editing, and shipping every content lane.
      </h1>
    </section>
  );
}
