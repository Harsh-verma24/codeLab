import type { Request, Response } from "express"
import Program from "../models/Program.model"
import Session from "../models/Session.model"
import Submission from "../models/Submission.model"

// Teacher Stats
export const getTeacherStats = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id

    const [programCount, sessionCount, activeSessions, submissions] = await Promise.all([
      Program.countDocuments({ teacherId }),
      Session.countDocuments({ teacherId }),
      Session.countDocuments({ teacherId, status: "active" }),
      Submission.find().populate({
        path: "sessionId",
        match: { teacherId },
      }),
    ])

    // Filter submissions for teacher's sessions
    const teacherSubmissions = submissions.filter((s) => s.sessionId !== null)
    const pendingCount = teacherSubmissions.filter((s) => s.status === "pending").length
    const verifiedCount = teacherSubmissions.filter((s) => s.status === "verified").length

    res.json({
      stats: {
        programs: programCount,
        sessions: sessionCount,
        activeSessions,
        pendingSubmissions: pendingCount,
        verifiedSubmissions: verifiedCount,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Student Stats
export const getStudentStats = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id

    const [totalSubmissions, verifiedSubmissions, pendingSubmissions, rejectedSubmissions] = await Promise.all([
      Submission.countDocuments({ studentId }),
      Submission.countDocuments({ studentId, status: "verified" }),
      Submission.countDocuments({ studentId, status: "pending" }),
      Submission.countDocuments({ studentId, status: "rejected" }),
    ])

    res.json({
      stats: {
        totalSubmissions,
        verifiedSubmissions,
        pendingSubmissions,
        rejectedSubmissions,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
