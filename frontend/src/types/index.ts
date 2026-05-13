export interface User {
  _id: string
  id: string
  name: string
  email: string
  college: string
  branch: string
  subject: string
  semester: string
  role: "teacher" | "student"
}

export interface Question {
  _id?: string
  title: string
  description: string
  sampleInput: string
  sampleOutput: string
  language: string
}

export interface Program {
  _id: string
  title: string
  subject: string
  description: string
  teacherId: string
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export interface Session {
  _id: string
  sessionCode: string
  students: User[] 
  programId: Program | string
  teacherId: string
  status: "active" | "ended"
  connectedStudents: (User | string)[]
  createdAt: string
  updatedAt: string
}

export interface Submission {
  _id: string
  sessionId: Session | string
  studentId: User | string
  questionId: string
  code: string
  language: string
  status: "pending" | "verified" | "rejected"
  feedback: string
  submittedAt: string
  verifiedAt?: string
}

export interface LiveCode {
  studentId: string
  questionId: string
  code: string
  language: string
  timestamp: Date
}

export interface Stats {
  programs?: number
  sessions?: number
  activeSessions?: number
  pendingSubmissions?: number
  verifiedSubmissions?: number
  totalSubmissions?: number
  rejectedSubmissions?: number
}
