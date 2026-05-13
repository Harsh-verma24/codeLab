"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../lib/api"
import { getSocket, connectSocket } from "../../lib/socket"
import type { Session, Program, User } from "../../types"
import toast from "react-hot-toast"
import { ArrowLeft, Users, StopCircle, Copy, Check, Eye, Wifi, WifiOff } from "lucide-react"

interface StudentCode {
  studentId: string
  studentName: string
  studentEmail: string
  code: string
  language: string
  isTyping: boolean
  lastUpdate: Date
}

export default function MonitorSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [studentCodes, setStudentCodes] = useState<Map<string, StudentCode>>(new Map())
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    fetchSessionData()
  }, [sessionId])

  useEffect(() => {
    if (session && program) {
      setupSocket()
    }

    return () => {
      const socket = getSocket()
      if (socket) {
        socket.emit("leave-session", sessionId)
      }
    }
  }, [session, program, sessionId])

  // Refetch when question changes to get updated code
  useEffect(() => {
    if (selectedQuestion && session) {
      fetchLiveCodesForQuestion()
    }
  }, [selectedQuestion])

  const fetchSessionData = async () => {
    try {
      const { data } = await api.get(`/teacher/session/${sessionId}`)
      setSession(data.session)
      setProgram(data.session.programId as Program)

      // Set first question as default
      if (data.session.programId?.questions?.length > 0) {
        setSelectedQuestion(data.session.programId.questions[0]._id)
      }

      // Initialize student codes
      initializeStudentCodes(data.session, data.liveCodes || [])
    } catch (error) {
      toast.error("Failed to fetch session")
      navigate("/teacher/sessions")
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveCodesForQuestion = async () => {
    if (!selectedQuestion || !session) return

    try {
      const { data } = await api.get(`/teacher/session/${sessionId}`)
      const liveCodes = data.liveCodes || []
      
      // Update codes for the selected question
      setStudentCodes((prev) => {
        const updated = new Map(prev)
        
        // Update with live codes for this question
        liveCodes.forEach((lc: any) => {
          if (lc.questionId === selectedQuestion) {
            const student = lc.studentId as User
            const studentId = student._id || student.id
            
            updated.set(studentId, {
              studentId,
              studentName: student.name,
              studentEmail: student.email,
              code: lc.code,
              language: lc.language,
              isTyping: prev.get(studentId)?.isTyping || false,
              lastUpdate: new Date(lc.lastUpdated),
            })
          }
        })
        
        return updated
      })
    } catch (error) {
      console.error("Failed to fetch live codes:", error)
    }
  }

  const initializeStudentCodes = (sessionData: Session, liveCodes: any[]) => {
    const codes = new Map<string, StudentCode>()
    const students = sessionData.students as User[] || []

    // First, add all students from session
    students.forEach((student: User) => {
      const studentId = student._id || student.id
      codes.set(studentId, {
        studentId,
        studentName: student.name,
        studentEmail: student.email,
        code: "// No code submitted yet...",
        language: "javascript",
        isTyping: false,
        lastUpdate: new Date(),
      })
    })

    // Then update with live codes if available for current question
    if (selectedQuestion) {
      liveCodes.forEach((lc: any) => {
        if (lc.questionId === selectedQuestion) {
          const student = lc.studentId as User
          const studentId = student._id || student.id
          
          codes.set(studentId, {
            studentId,
            studentName: student.name,
            studentEmail: student.email,
            code: lc.code,
            language: lc.language,
            isTyping: false,
            lastUpdate: new Date(lc.lastUpdated),
          })
        }
      })
    }

    setStudentCodes(codes)
  }

  const setupSocket = useCallback(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const socket = connectSocket(token)

    socket.on("connect", () => {
      setConnected(true)
      socket.emit("teacher:join-session", sessionId)
    })

    socket.on("disconnect", () => {
      setConnected(false)
    })

    // Listen for student joins
    socket.on("student:joined", ({ studentId, studentName, studentEmail }) => {
      toast.success(`${studentName} joined the session`)
      
      // Add new student to the map
      setStudentCodes((prev) => {
        const updated = new Map(prev)
        if (!updated.has(studentId)) {
          updated.set(studentId, {
            studentId,
            studentName,
            studentEmail,
            code: "// No code submitted yet...",
            language: "javascript",
            isTyping: false,
            lastUpdate: new Date(),
          })
        }
        return updated
      })
      
      // Refresh session data to get updated student list
      fetchSessionData()
    })

    // Listen for student leaves
    socket.on("student:left", ({ studentId }) => {
      toast("A student left the session")
      fetchSessionData()
    })

    // Listen for live code updates
    socket.on("code:updated", ({ studentId, questionId, code, language, timestamp }) => {
      if (questionId === selectedQuestion) {
        setStudentCodes((prev) => {
          const updated = new Map(prev)
          const existing = updated.get(studentId)
          if (existing) {
            updated.set(studentId, {
              ...existing,
              code,
              language,
              isTyping: false,
              lastUpdate: new Date(timestamp),
            })
          }
          return updated
        })
      }
    })

    // Listen for typing indicator
    socket.on("student:typing", ({ studentId, questionId }) => {
      if (questionId === selectedQuestion) {
        setStudentCodes((prev) => {
          const updated = new Map(prev)
          const existing = updated.get(studentId)
          if (existing) {
            updated.set(studentId, { ...existing, isTyping: true })
          }
          return updated
        })

        // Clear typing indicator after 2 seconds
        setTimeout(() => {
          setStudentCodes((prev) => {
            const updated = new Map(prev)
            const existing = updated.get(studentId)
            if (existing) {
              updated.set(studentId, { ...existing, isTyping: false })
            }
            return updated
          })
        }, 2000)
      }
    })

    // Listen for new submissions
    socket.on("submission:new", ({ submission, studentId: submittingStudentId }) => {
      toast.success("New submission received!")
      // Optionally refresh session data or update UI to show submission indicator
    })
  }, [sessionId, selectedQuestion])

  const handleEndSession = async () => {
    if (!window.confirm("Are you sure you want to end this session?")) return

    try {
      await api.put(`/teacher/session/${sessionId}/end`)
      toast.success("Session ended")
      navigate("/teacher/sessions")
    } catch (error) {
      toast.error("Failed to end session")
    }
  }

  const copySessionCode = () => {
    if (session?.sessionCode) {
      navigator.clipboard.writeText(session.sessionCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!session || !program) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Session not found</p>
      </div>
    )
  }

  const connectedStudents = session.connectedStudents as User[] || []
  const allStudents = session.students as User[] || []
  const selectedStudentCode = selectedStudent ? studentCodes.get(selectedStudent) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/teacher/sessions")}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{program.title}</h1>
              {connected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  <Wifi className="w-3.5 h-3.5" />
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  <WifiOff className="w-3.5 h-3.5" />
                  Disconnected
                </span>
              )}
            </div>
            <p className="text-slate-600">{program.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
            <span className="text-sm text-slate-500">Session Code:</span>
            <span className="font-mono font-bold text-lg text-slate-900">{session.sessionCode}</span>
            <button onClick={copySessionCode} className="p-1 text-slate-400 hover:text-slate-600">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={handleEndSession} className="btn btn-danger">
            <StopCircle className="w-4 h-4" />
            End Session
          </button>
        </div>
      </div>

      {/* Question Selector */}
      <div className="card p-4">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Questions:</span>
          {program.questions?.map((q, index) => (
            <button
              key={q._id}
              onClick={() => setSelectedQuestion(q._id || "")}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedQuestion === q._id ? "bg-primary-100 text-primary-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Q{index + 1}: {q.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-600" />
              <h2 className="font-semibold text-slate-900">Students in Session ({allStudents?.length || 0})</h2>
            </div>
          </div>
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {allStudents?.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No students in session yet</p>
            ) : (
              Array.from(studentCodes.values()).map((studentCode) => {
                const isConnected = connectedStudents?.some(
                  (s) => (s._id || s.id) === studentCode.studentId
                )

                return (
                  <button
                    key={studentCode.studentId}
                    onClick={() => setSelectedStudent(studentCode.studentId)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedStudent === studentCode.studentId
                        ? "bg-primary-50 border-2 border-primary-500"
                        : "bg-slate-50 hover:bg-slate-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-700">
                          {studentCode.studentName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-900">{studentCode.studentName}</p>
                        <p className="text-xs text-slate-500">{studentCode.studentEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {studentCode.isTyping && (
                        <span className="text-xs text-primary-600 animate-pulse">Typing...</span>
                      )}
                      <div className="flex items-center gap-1">
                        {isConnected ? (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                        )}
                        <Eye className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Live Code Preview */}
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
                {selectedStudentCode
                  ? `${selectedStudentCode.studentName}'s Code`
                  : "Select a student to view their code"}
              </h2>
              {selectedStudentCode && (
                <span className="text-sm text-slate-500">
                  Last update: {selectedStudentCode.lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            {selectedStudentCode ? (
              <div className="relative">
                {selectedStudentCode.isTyping && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded animate-pulse">
                    Typing...
                  </div>
                )}
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-auto font-mono text-sm min-h-[400px] max-h-[60vh]">
                  {selectedStudentCode.code || "// No code yet..."}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-slate-50 rounded-lg">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Select a student from the list to view their live code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}