import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/Home'
import BuilderPage from './pages/Builder'
import ResultsPage from './pages/Results'
import CompDetailPage from './pages/CompDetail'
import AdminPage from './pages/Admin'
import { DataValidationError } from './components/DataValidationError'
import { loadAndValidateData, type ValidationResult } from './data/dataValidator'

export default function App() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAndValidateData()
      .then((result) => {
        setValidationResult(result)
        setIsLoading(false)
      })
      .catch((error) => {
        setValidationResult({
          isValid: false,
          error: 'Unexpected error loading data',
          details: error
        })
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-midnight">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
          <p className="text-slate-200">Loading TFT Professor...</p>
        </div>
      </div>
    )
  }

  if (!validationResult?.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-midnight to-slate">
        <DataValidationError
          error={validationResult?.error ?? 'Unknown validation error'}
          details={validationResult?.details}
        />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="builder" element={<BuilderPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="comp/:id" element={<CompDetailPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}
