"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../lib/api"
import type { Stats, Session, Program } from "../../types"
import { useAuthStore } from "../../store/auth.store"
import { PlayCircle, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react"

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats>({})
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, sessionRes] = await Promise.all([api.get("/student/stats"), api.get("/student/session/active")])
      setStats(statsRes.data.stats)
      setActiveSession(sessionRes.data.session)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const statCards = [
    { label: "Total Submissions", value: stats.totalSubmissions || 0, icon: Clock, color: "bg-blue-500" },
    { label: "Verified", value: stats.verifiedSubmissions || 0, icon: CheckCircle, color: "bg-emerald-500" },
    { label: "Pending", value: stats.pendingSubmissions || 0, icon: Clock, color: "bg-amber-500" },
    { label: "Rejected", value: stats.rejectedSubmissions || 0, icon: XCircle, color: "bg-red-500" },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-emerald-100 mt-1">Ready to code? Join a session or check your history.</p>
      </div>

      {/* Active Session */}
      {activeSession && (
        <div className="card p-6 border-2 border-emerald-500 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active Session
                </span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mt-2">
                {(activeSession.programId as Program)?.title || "Untitled Program"}
              </h2>
              <p className="text-slate-600 mt-1">
                Session Code: <span className="font-mono font-bold">{activeSession.sessionCode}</span>
              </p>
            </div>
            <Link
              to={`/student/session/${activeSession._id}`}
              className="btn bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Continue Coding
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

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
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/student/join" className="card p-8 hover:shadow-lg transition-shadow group">
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
            <PlayCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Join Session</h3>
          <p className="text-slate-600 mt-2">Enter a session code to join a live programming session</p>
        </Link>

        <Link to="/student/history" className="card p-8 hover:shadow-lg transition-shadow group">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <CheckCircle className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Submission History</h3>
          <p className="text-slate-600 mt-2">View all your past submissions and feedback</p>
        </Link>
      </div>
    </div>
  )
}
