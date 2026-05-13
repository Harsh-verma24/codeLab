"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../lib/api"
import type { Program } from "../../types"
import toast from "react-hot-toast"
import { Plus, FileCode, Trash2 } from "lucide-react"

export default function ProgramList() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this program?")) return

    try {
      await api.delete(`/teacher/programs/${id}`)
      setPrograms(programs.filter((p) => p._id !== id))
      toast.success("Program deleted")
    } catch (error) {
      toast.error("Failed to delete program")
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programs</h1>
          <p className="text-slate-600">Manage your programming question sets</p>
        </div>
        <Link to="/teacher/programs/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New Program
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No programs yet</h2>
          <p className="text-slate-600 mb-6">Create your first program to get started</p>
          <Link to="/teacher/programs/new" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create Program
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {programs.map((program) => (
            <div key={program._id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{program.title}</h3>
                  <p className="text-slate-600 mt-1">{program.subject}</p>
                  {program.description && <p className="text-sm text-slate-500 mt-2">{program.description}</p>}
                  <div className="flex items-center gap-4 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                      <FileCode className="w-4 h-4" />
                      {program.questions?.length || 0} questions
                    </span>
                    <span className="text-sm text-slate-500">
                      Created {new Date(program.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/teacher/sessions/new?program=${program._id}`} className="btn btn-primary btn-sm">
                    Start Session
                  </Link>
                  <button
                    onClick={() => handleDelete(program._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
