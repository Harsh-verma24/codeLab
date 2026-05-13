"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "../../lib/api"
import type { Program } from "../../types"
import toast from "react-hot-toast"
import { ArrowLeft, Play, FileCode } from "lucide-react"

export default function CreateSession() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState(searchParams.get("program") || "")
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const { data } = await api.get("/teacher/programs/list")
      setPrograms(data.programs)
    } catch (error) {
      toast.error("Failed to fetch programs")
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async () => {
    if (!selectedProgram) {
      toast.error("Please select a program")
      return
    }

    setStarting(true)
    try {
      const { data } = await api.post("/teacher/session/start", {
        programId: selectedProgram,
      })
      toast.success(`Session started! Code: ${data.session.sessionCode}`)
      navigate(`/teacher/monitor/${data.session._id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start session")
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Start New Session</h1>
          <p className="text-slate-600">Select a program to begin the lab session</p>
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No programs available</h2>
          <p className="text-slate-600 mb-6">Create a program first before starting a session</p>
          <button onClick={() => navigate("/teacher/programs/new")} className="btn btn-primary">
            Create Program
          </button>
        </div>
      ) : (
        <div className="card p-6 space-y-6">
          <div>
            <label className="label">Select Program</label>
            <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className="input">
              <option value="">Choose a program...</option>
              {programs.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.title} - {program.subject} ({program.questions?.length || 0} questions)
                </option>
              ))}
            </select>
          </div>

          {selectedProgram && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-slate-900">{programs.find((p) => p._id === selectedProgram)?.title}</h3>
              <p className="text-sm text-slate-600 mt-1">
                {programs.find((p) => p._id === selectedProgram)?.description || "No description"}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {programs.find((p) => p._id === selectedProgram)?.questions?.length || 0} questions
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleStartSession} disabled={starting || !selectedProgram} className="btn btn-primary">
              <Play className="w-4 h-4" />
              {starting ? "Starting..." : "Start Session"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
