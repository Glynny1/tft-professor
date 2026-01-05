import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate/40 bg-midnight/60 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">MVP</p>
        <h1 className="mt-2 text-3xl font-bold text-white">TFT Comp Recommender</h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Pick the champions and items you have, and we’ll suggest the best comps for Set 16. View positioning on a TFT-style
          board and edit comps in the admin area.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/builder"
            className="rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-midnight shadow hover:brightness-110"
          >
            Start
          </Link>
          <Link
            to="/results"
            className="rounded-lg border border-slate/50 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate/30"
          >
            See comps
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Select champs & items', desc: 'Build from what you already rolled.' },
          { title: 'Recommended comps', desc: 'Filtered list with match % and tags.' },
          { title: 'Board positioning', desc: 'Visual 7x4 grid showing unit placement.' },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-slate/40 bg-slate/40 p-4">
            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
            <p className="text-sm text-slate-200">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

