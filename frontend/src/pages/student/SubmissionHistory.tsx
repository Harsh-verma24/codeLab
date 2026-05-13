"use client"

import { useEffect, useState } from "react"
import api from "../../lib/api"
import type { Submission, Session } from "../../types"
import { CheckCircle, XCircle, Clock, Code, MessageSquare } from "lucide-react"

export default function SubmissionHistory() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/student/history")
      setSubmissions(data.submissions)
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const verifiedSubmissions = submissions.filter((s) => s.status === "verified")
  const pendingSubmissions = submissions.filter((s) => s.status === "pending")
  const rejectedSubmissions = submissions.filter((s) => s.status === "rejected")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submission History</h1>
        <p className="text-slate-600">View all your past submissions and feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">{verifiedSubmissions.length}</p>
              <p className="text-sm text-emerald-600">Verified</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-700">{pendingSubmissions.length}</p>
              <p className="text-sm text-amber-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">{rejectedSubmissions.length}</p>
              <p className="text-sm text-red-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="card p-12 text-center">
          <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No submissions yet</h2>
          <p className="text-slate-600">Join a session and start coding to see your history here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission._id} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-900">
                      Session: {(submission.sessionId as Session)?.sessionCode || "N/A"}
                    </span>
                    {getStatusBadge(submission.status)}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span>Language: {submission.language}</span>
                    <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                  </div>
                  {submission.feedback && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-1 text-sm font-medium text-slate-700 mb-1">
                        <MessageSquare className="w-4 h-4" />
                        Teacher Feedback
                      </div>
                      <p className="text-sm text-slate-600">{submission.feedback}</p>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedSubmission(submission)} className="btn btn-secondary">
                  <Code className="w-4 h-4" />
                  View Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Code Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Submission Code</h2>
                <p className="text-slate-600">
                  {selectedSubmission.language} - {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[70vh]">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-auto font-mono text-sm">
                {selectedSubmission.code}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
