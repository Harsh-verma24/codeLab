"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import api from "../../lib/api"
import { getSocket, connectSocket } from "../../lib/socket"
import type { Session, Program, Submission } from "../../types"
import toast from "react-hot-toast"
import { ArrowLeft, Send, CheckCircle, Clock, XCircle, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react"

const LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  c: "c",
  cpp: "cpp",
}

export default function CodeEditor() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [code, setCode] = useState("")
  const [submissions, setSubmissions] = useState<Map<string, Submission>>(new Map())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [showQuestion, setShowQuestion] = useState(true)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCodeRef = useRef("")

  const currentQuestion = program?.questions?.[currentQuestionIndex]

  useEffect(() => {
    fetchSessionData()
    setupSocket()

    return () => {
      const socket = getSocket()
      if (socket) {
        socket.emit("leave-session", sessionId)
      }
    }
  }, [sessionId])

  useEffect(() => {
    // Load saved code for current question
    if (currentQuestion?._id) {
      const savedCode = localStorage.getItem(`code_${sessionId}_${currentQuestion._id}`)
      setCode(savedCode || getDefaultCode(currentQuestion.language))
      lastCodeRef.current = savedCode || ""
    }
  }, [currentQuestionIndex, currentQuestion, sessionId])

  const fetchSessionData = async () => {
    try {
      const [sessionRes, submissionsRes] = await Promise.all([
        api.get("/student/session/active"),
        api.get(`/student/submissions?sessionId=${sessionId}`),
      ])

      if (!sessionRes.data.session) {
        toast.error("Session not found or has ended")
        navigate("/student/dashboard")
        return
      }

      setSession(sessionRes.data.session)
      setProgram(sessionRes.data.session.programId as Program)

      // Map submissions by questionId
      const subMap = new Map<string, Submission>()
      submissionsRes.data.submissions?.forEach((sub: Submission) => {
        subMap.set(sub.questionId, sub)
      })
      setSubmissions(subMap)
    } catch (error) {
      toast.error("Failed to load session")
      navigate("/student/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const setupSocket = useCallback(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const socket = connectSocket(token)

    socket.on("connect", () => {
      setConnected(true)
      socket.emit("student:join-session", sessionId)
    })

    socket.on("disconnect", () => {
      setConnected(false)
    })

    socket.on("session:ended", () => {
      toast("Session has ended")
      navigate("/student/dashboard")
    })

    socket.on("submission:verified", ({ submission }) => {
      setSubmissions((prev) => {
        const updated = new Map(prev)
        updated.set(submission.questionId, submission)
        return updated
      })
      toast.success(`Submission ${submission.status}!`)
    })
  }, [sessionId, navigate])

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ""
    setCode(newCode)

    // Save to localStorage
    if (currentQuestion?._id) {
      localStorage.setItem(`code_${sessionId}_${currentQuestion._id}`, newCode)
    }

    // Emit typing indicator
    const socket = getSocket()
    if (socket && currentQuestion?._id) {
      socket.emit("student:typing", {
        sessionId,
        questionId: currentQuestion._id,
      })
    }

    // Debounce code update
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket && currentQuestion?._id && newCode !== lastCodeRef.current) {
        socket.emit("code:update", {
          sessionId,
          questionId: currentQuestion._id,
          code: newCode,
          language: currentQuestion.language,
        })
        lastCodeRef.current = newCode
      }
    }, 500)
  }

  const handleSubmit = async () => {
    if (!currentQuestion?._id || !code.trim()) {
      toast.error("Please write some code before submitting")
      return
    }

    setSubmitting(true)
    try {
      const { data } = await api.post("/student/submission/submit", {
        sessionId,
        questionId: currentQuestion._id,
        code,
        language: currentQuestion.language,
      })

      setSubmissions((prev) => {
        const updated = new Map(prev)
        updated.set(currentQuestion._id!, data.submission)
        return updated
      })

      toast.success("Code submitted successfully!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit code")
    } finally {
      setSubmitting(false)
    }
  }

  const getDefaultCode = (language: string) => {
    const templates: Record<string, string> = {
      python: "# Write your code here\n\n",
      javascript: "// Write your code here\n\n",
      java: "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
      c: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    }
    return templates[language] || "// Write your code here\n"
  }

  const getSubmissionStatus = (questionId: string) => {
    const submission = submissions.get(questionId)
    if (!submission) return null
    return submission.status
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!session || !program) {
    return null
  }

  const currentSubmission = currentQuestion?._id ? submissions.get(currentQuestion._id) : null

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{program.title}</h1>
              {connected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  <Wifi className="w-3 h-3" />
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">
              Session: <span className="font-mono font-bold">{session.sessionCode}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentSubmission && (
            <div
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                currentSubmission.status === "verified"
                  ? "bg-emerald-100 text-emerald-700"
                  : currentSubmission.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {currentSubmission.status === "verified" && "Verified"}
              {currentSubmission.status === "rejected" && "Rejected"}
              {currentSubmission.status === "pending" && "Under Review"}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || currentSubmission?.status === "verified"}
            className="btn bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {program.questions?.map((q, index) => {
          const status = getSubmissionStatus(q._id || "")
          return (
            <button
              key={q._id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                currentQuestionIndex === index
                  ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent"
              }`}
            >
              Q{index + 1}
              {getStatusIcon(status)}
            </button>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Question Panel */}
        <div className={`card transition-all duration-300 ${showQuestion ? "w-1/3" : "w-0 overflow-hidden"}`}>
          {showQuestion && currentQuestion && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">{currentQuestion.title}</h2>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                  {currentQuestion.language}
                </span>
              </div>
              <div className="flex-1 p-4 overflow-auto space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{currentQuestion.description}</p>
                </div>
                {currentQuestion.sampleInput && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Sample Input</h3>
                    <pre className="p-3 bg-slate-100 rounded-lg text-sm font-mono overflow-x-auto">
                      {currentQuestion.sampleInput}
                    </pre>
                  </div>
                )}
                {currentQuestion.sampleOutput && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Sample Output</h3>
                    <pre className="p-3 bg-slate-100 rounded-lg text-sm font-mono overflow-x-auto">
                      {currentQuestion.sampleOutput}
                    </pre>
                  </div>
                )}
                {currentSubmission?.feedback && (
                  <div
                    className={`p-3 rounded-lg ${
                      currentSubmission.status === "verified"
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <h3 className="text-sm font-medium text-slate-700 mb-1">Teacher Feedback</h3>
                    <p className="text-sm text-slate-600">{currentSubmission.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setShowQuestion(!showQuestion)}
          className="self-center p-1 bg-slate-200 hover:bg-slate-300 rounded-full"
        >
          {showQuestion ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Code Editor */}
        <div className={`card flex-1 overflow-hidden ${!showQuestion ? "ml-0" : ""}`}>
          <Editor
            height="100%"
            language={LANGUAGE_MAP[currentQuestion?.language || "python"]}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "JetBrains Mono, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>
      </div>
    </div>
  )
}
