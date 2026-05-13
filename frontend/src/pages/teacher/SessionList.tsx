"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../lib/api"
import type { Session, Program } from "../../types"
import toast from "react-hot-toast"
import { Plus, Play, StopCircle, Users, Monitor } from "lucide-react"

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const { data } = await api.get("/teacher/session/active")
      setSessions(data.sessions)
    } catch (error) {
      toast.error("Failed to fetch sessions")
    } finally {
      setLoading(false)
    }
  }

  const handleEndSession = async (id: string) => {
    if (!window.confirm("Are you sure you want to end this session?")) return

    try {
      await api.put(`/teacher/session/${id}/end`)
      setSessions(sessions.filter((s) => s._id !== id))
      toast.success("Session ended")
    } catch (error) {
      toast.error("Failed to end session")
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
          <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
          <p className="text-slate-600">Manage your active lab sessions</p>
        </div>
        <Link to="/teacher/sessions/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="card p-12 text-center">
          <Play className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No active sessions</h2>
          <p className="text-slate-600 mb-6">Start a new session to begin monitoring students</p>
          <Link to="/teacher/sessions/new" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Start Session
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session._id} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {(session.programId as Program)?.title || "Untitled Program"}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Active
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{(session.programId as Program)?.subject}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                      <span className="text-sm text-slate-500">Session Code:</span>
                      <span className="font-mono font-bold text-lg text-slate-900">{session.sessionCode}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      {session.connectedStudents?.length || 0} students connected
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/teacher/monitor/${session._id}`} className="btn btn-primary">
                    <Monitor className="w-4 h-4" />
                    Monitor
                  </Link>
                  <button onClick={() => handleEndSession(session._id)} className="btn btn-danger">
                    <StopCircle className="w-4 h-4" />
                    End
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
