import type { Request, Response } from "express"
import Submission from "../models/Submission.model"
import Session from "../models/Session.model"

// Submit Code (Student) - UPDATED
export const submitCode = async (req: Request, res: Response) => {
  try {
    const { sessionId, questionId, code, language } = req.body

    // Verify session is active and student is in the session (check students array)
    const session = await Session.findOne({
      _id: sessionId,
      status: "active",
      students: req.user!.id, // Changed from connectedStudents to students
    })

    if (!session) {
      return res.status(404).json({ message: "Session not found or you are not connected" })
    }

    // Check for existing submission
    let submission = await Submission.findOne({
      sessionId,
      studentId: req.user!.id,
      questionId,
    })

    if (submission) {
      // Update existing submission
      submission.code = code
      submission.language = language
      submission.status = "pending"
      submission.submittedAt = new Date()
      submission.feedback = ""
      await submission.save()
    } else {
      // Create new submission
      submission = await Submission.create({
        sessionId,
        studentId: req.user!.id,
        questionId,
        code,
        language,
        status: "pending",
      })
    }

    // Populate student info for the emission
    await submission.populate("studentId", "name email")

    // Emit submission event to teacher in the specific session room
    const io = req.app.get("io")
    io.to(`session:${sessionId}:teacher`).emit("submission:new", {
      submission: submission.toObject(),
      studentId: req.user!.id,
    })

    res.json({
      message: "Code submitted successfully",
      submission,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get Submissions (Teacher) - UPDATED
export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { sessionId, status } = req.query

    let query: any = {}

    if (sessionId) {
      // Verify teacher owns this session
      const session = await Session.findOne({
        _id: sessionId,
        teacherId: req.user!.id,
      })
      if (!session) {
        return res.status(404).json({ message: "Session not found" })
      }
      query.sessionId = sessionId
    } else {
      // Get all submissions for teacher's sessions
      const sessions = await Session.find({ teacherId: req.user!.id })
      const sessionIds = sessions.map(s => s._id)
      query.sessionId = { $in: sessionIds }
    }

    if (status) {
      query.status = status
    }

    const submissions = await Submission.find(query)
      .populate("studentId", "name email")
      .populate("sessionId", "sessionCode")
      .sort({ submittedAt: -1 })

    res.json({ submissions })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get Submission by ID (Teacher)
export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("sessionId", "sessionCode programId")

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" })
    }

    res.json({ submission })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Verify Submission (Teacher) - UPDATED
export const verifySubmission = async (req: Request, res: Response) => {
  try {
    const { submissionId, status, feedback } = req.body

    const submission = await Submission.findById(submissionId)
      .populate("sessionId")
      .populate("studentId", "name email")

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" })
    }

    // Verify teacher owns the session
    const session = submission.sessionId as any
    if (session.teacherId.toString() !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    submission.status = status
    submission.feedback = feedback || ""
    submission.verifiedAt = new Date()
    await submission.save()

    // Emit verification event to the specific student
    const io = req.app.get("io")
    const studentId = (submission.studentId as any)._id || (submission.studentId as any).id
    
    io.to(`student:${studentId}`).emit("submission:verified", {
      submission: submission.toObject(),
    })

    res.json({
      message: `Submission ${status}`,
      submission,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get My Submissions (Student)
export const getMySubmissions = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query

    const query: any = { studentId: req.user!.id }
    if (sessionId) {
      query.sessionId = sessionId
    }

    const submissions = await Submission.find(query)
      .populate("sessionId", "sessionCode")
      .sort({ submittedAt: -1 })

    res.json({ submissions })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get Submission History (Student)
export const getSubmissionHistory = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find({ studentId: req.user!.id })
      .populate("sessionId", "sessionCode programId")
      .sort({ submittedAt: -1 })

    res.json({ submissions })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}