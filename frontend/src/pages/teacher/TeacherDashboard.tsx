"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../lib/api"
import type { Stats, Session, Program } from "../../types"
import { FileCode, Play, ClipboardCheck, Users, Plus, ArrowRight } from "lucide-react"

export default function TeacherDashboard() {
  const [stats, setStats] = useState<Stats>({})
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [recentPrograms, setRecentPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, sessionsRes, programsRes] = await Promise.all([
        api.get("/teacher/stats"),
        api.get("/teacher/session/active"),
        api.get("/teacher/programs/list"),
      ])
      setStats(statsRes.data.stats)
      setRecentSessions(sessionsRes.data.sessions.slice(0, 3))
      setRecentPrograms(programsRes.data.programs.slice(0, 3))
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  const statCards = [
    { label: "Programs", value: stats.programs || 0, icon: FileCode, color: "bg-blue-500" },
    { label: "Total Sessions", value: stats.sessions || 0, icon: Play, color: "bg-emerald-500" },
    { label: "Active Sessions", value: stats.activeSessions || 0, icon: Users, color: "bg-amber-500" },
    { label: "Pending Reviews", value: stats.pendingSubmissions || 0, icon: ClipboardCheck, color: "bg-purple-500" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's your overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/teacher/programs/new" className="btn btn-secondary">
            <Plus className="w-4 h-4" />
            New Program
          </Link>
          <Link to="/teacher/sessions/new" className="btn btn-primary">
            <Play className="w-4 h-4" />
            Start Session
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <div className="card">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Active Sessions</h2>
              <Link to="/teacher/sessions" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <Play className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No active sessions</p>
                <Link to="/teacher/sessions/new" className="btn btn-primary mt-4">
                  Start a Session
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <Link
                    key={session._id}
                    to={`/teacher/monitor/${session._id}`}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {(session.programId as Program)?.title || "Untitled Program"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Code: <span className="font-mono font-semibold">{session.sessionCode}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {session.connectedStudents?.length || 0} students
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Programs */}
        <div className="card">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Programs</h2>
              <Link to="/teacher/programs" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentPrograms.length === 0 ? (
              <div className="text-center py-8">
                <FileCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No programs yet</p>
                <Link to="/teacher/programs/new" className="btn btn-primary mt-4">
                  Create Program
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrograms.map((program) => (
                  <div key={program._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{program.title}</p>
                      <p className="text-sm text-slate-500">{program.subject}</p>
                    </div>
                    <span className="text-sm text-slate-500">{program.questions?.length || 0} questions</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
