import { useMemo, useState } from 'react'
import { useToast } from '../components/ToastProvider'
import { getAllComps, getAllChampions, getAllItems } from '../data/compHelpers'
import { AdminBoardEditor } from '../components/AdminBoardEditor'

export default function AdminPage() {
  const { pushToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedCompId, setSelectedCompId] = useState<string>(() => getAllComps()[0]?.id ?? '')

  const comps = getAllComps()
  const champions = getAllChampions()
  const items = getAllItems()

  const selectedComp = useMemo(() => comps.find((c) => c.id === selectedCompId) ?? comps[0], [comps, selectedCompId])

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Admin</p>
        <h2 className="text-2xl font-semibold text-white">Login & Comp Editor (placeholder)</h2>
        <p className="text-slate-200">For MVP, this is a stub. Hook this up to Supabase or simple env password later.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate/40 bg-slate/30 p-4">
          <h3 className="text-lg font-semibold text-white">Login</h3>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block">
              <span className="text-slate-200">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate/50 bg-midnight/70 px-3 py-2 text-slate-100 outline-none focus:border-accent"
                placeholder="you@example.com"
                type="email"
              />
            </label>
            <label className="block">
              <span className="text-slate-200">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate/50 bg-midnight/70 px-3 py-2 text-slate-100 outline-none focus:border-accent"
                placeholder="••••••••"
                type="password"
              />
            </label>
            <button
              className="w-full rounded-lg bg-accent px-3 py-2 font-semibold text-white hover:brightness-110"
              onClick={() => pushToast('Admin auth not wired yet (MVP placeholder)', 'info')}
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate/40 bg-slate/30 p-4">
          <h3 className="text-lg font-semibold text-white">Comp Positioning Editor</h3>
          <p className="text-sm text-slate-200 mb-3">
            Drag or click to place units. JSON mode: copy the positioning snippet into comps.json. Supabase mode would save via API.
          </p>
          <div className="mb-3 flex items-center gap-2">
            <label className="text-sm text-slate-200">Select comp:</label>
            <select
              value={selectedComp?.id}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="rounded-lg border border-slate/50 bg-midnight/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
            >
              {comps.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} (Set {comp.set})
                </option>
              ))}
            </select>
          </div>

          {selectedComp ? (
            <AdminBoardEditor comp={selectedComp} champions={champions} items={items} mode="json" />
          ) : (
            <p className="text-sm text-red-200">No comps available.</p>
          )}
        </div>
      </div>
    </section>
  )
}

