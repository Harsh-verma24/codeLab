"use client"

import { useEffect, useState } from "react"
import api from "../../lib/api"
import type { Submission, User, Session } from "../../types"
import toast from "react-hot-toast"
import { CheckCircle, XCircle, Clock, Eye, MessageSquare } from "lucide-react"

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState("")
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const { data } = await api.get("/teacher/submissions")
      setSubmissions(data.submissions)
    } catch (error) {
      toast.error("Failed to fetch submissions")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!selectedSubmission) return

    setVerifying(true)
    try {
      await api.put("/teacher/submission/verify", {
        submissionId: selectedSubmission._id,
        status,
        feedback,
      })
      toast.success(`Submission ${status}`)
      setSelectedSubmission(null)
      setFeedback("")
      fetchSubmissions()
    } catch (error) {
      toast.error("Failed to verify submission")
    } finally {
      setVerifying(false)
    }
  }

  const filteredSubmissions = submissions.filter((s) => (filter === "all" ? true : s.status === filter))

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
          <p className="text-slate-600">Review and verify student submissions</p>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "verified", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f ? "bg-primary-100 text-primary-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No submissions</h2>
          <p className="text-slate-600">No submissions to review yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSubmissions.map((submission) => (
            <div key={submission._id} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900">
                      {(submission.studentId as User)?.name || "Unknown Student"}
                    </h3>
                    {getStatusBadge(submission.status)}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{(submission.studentId as User)?.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span>Language: {submission.language}</span>
                    <span>Session: {(submission.sessionId as Session)?.sessionCode || "N/A"}</span>
                    <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedSubmission(submission)
                    setFeedback(submission.feedback || "")
                  }}
                  className="btn btn-secondary"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Review Submission</h2>
                  <p className="text-slate-600">
                    {(selectedSubmission.studentId as User)?.name} - {selectedSubmission.language}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-auto max-h-[50vh]">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-auto font-mono text-sm">
                {selectedSubmission.code}
              </pre>
            </div>

            <div className="p-6 border-t border-slate-200 space-y-4">
              <div>
                <label className="label">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="input min-h-[80px]"
                  placeholder="Add feedback for the student..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setSelectedSubmission(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={() => handleVerify("rejected")} disabled={verifying} className="btn btn-danger">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button onClick={() => handleVerify("verified")} disabled={verifying} className="btn btn-success">
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
