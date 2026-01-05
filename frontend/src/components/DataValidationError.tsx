type DataValidationErrorProps = {
  error: string
  details?: string | Record<string, unknown> | null
}

export function DataValidationError({ error, details }: DataValidationErrorProps) {
  return (
    <div className="mx-auto mt-20 max-w-2xl rounded-xl border border-red-500/40 bg-red-500/10 p-8 shadow-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-red-100">Data Validation Failed</h2>
          <p className="text-sm text-red-200">There's an issue with your comps.json file</p>
        </div>
      </div>

      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <p className="mb-2 text-sm font-semibold text-red-100">Error:</p>
        <p className="text-sm text-red-200">{error}</p>
      </div>

      {details && (
        <details className="mt-4 cursor-pointer rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <summary className="text-sm font-semibold text-red-100">Show technical details</summary>
          <pre className="mt-3 overflow-auto rounded bg-black/30 p-3 text-xs text-red-200">
            {JSON.stringify(details, null, 2) || ''}
          </pre>
        </details>
      )}

      <div className="mt-6 space-y-3">
        <p className="text-sm text-red-100">Common fixes:</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-red-200">
          <li>Check that <code className="rounded bg-black/20 px-1 py-0.5">public/data/comps.json</code> exists</li>
          <li>Validate JSON syntax (missing commas, quotes, brackets)</li>
          <li>Ensure all required fields are present (id, name, cost, etc.)</li>
          <li>Check that champion/item references are valid</li>
          <li>Verify board positions are within 0-6 (x) and 0-3 (y)</li>
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
        >
          Retry
        </button>
        <a
          href="/data/comps.json"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/10"
        >
          View JSON file
        </a>
      </div>
    </div>
  )
}

