import type { Request, Response } from "express"
import Session from "../models/Session.model"
import Program from "../models/Program.model"
import LiveCode from "../models/LiveCode.model"
import { generateSessionCode } from "../utils/generateSessionCode"

// Start Session (Teacher)
export const startSession = async (req: Request, res: Response) => {
  try {
    const { programId } = req.body

    // Verify program exists and belongs to teacher
    const program = await Program.findOne({
      _id: programId,
      teacherId: req.user!.id,
    })

    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    // Generate unique session code
    let sessionCode = generateSessionCode()
    let existingSession = await Session.findOne({ sessionCode, status: "active" })

    while (existingSession) {
      sessionCode = generateSessionCode()
      existingSession = await Session.findOne({ sessionCode, status: "active" })
    }

    const session = await Session.create({
      sessionCode,
      programId,
      teacherId: req.user!.id,
      status: "active",
      students: [], // Initialize empty array for students
      connectedStudents: [],
    })

    await session.populate("programId")

    res.status(201).json({
      message: "Session started successfully",
      session,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get Active Sessions (Teacher)
export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find({
      teacherId: req.user!.id,
      status: "active",
    })
      .populate("programId")
      .populate("students", "name email") // Populate all students
      .populate("connectedStudents", "name email")
      .sort({ createdAt: -1 })

    res.json({ sessions })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get Session by ID (Teacher)
export const getSessionById = async (req: Request, res: Response) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      teacherId: req.user!.id,
    })
      .populate("programId")
      .populate("students", "name email") // Populate all students who joined
      .populate("connectedStudents", "name email")

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    // Get live code for all students in this session
    const liveCodes = await LiveCode.find({ 
      sessionId: session._id 
    }).populate("studentId", "name email")

    res.json({ session, liveCodes })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// End Session (Teacher)
export const endSession = async (req: Request, res: Response) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user!.id },
      { status: "ended" },
      { new: true },
    )

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    // Emit session ended event via Socket.io
    const io = req.app.get("io")
    io.to(`session:${session._id}`).emit("session:ended", { sessionId: session._id })

    res.json({ message: "Session ended successfully", session })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Join Session (Student) - UPDATED
export const joinSession = async (req: Request, res: Response) => {
  try {
    const { sessionCode } = req.body

    const session = await Session.findOne({
      sessionCode: sessionCode.toUpperCase(),
      status: "active",
    }).populate("programId")

    if (!session) {
      return res.status(404).json({ message: "Session not found or has ended" })
    }

    // Add student to students array if not already present (permanent record)
    if (!session.students.some((id) => id.toString() === req.user!.id)) {
      session.students.push(req.user!.id as any)
    }

    // Add student to connected students if not already (currently active)
    if (!session.connectedStudents.some((id) => id.toString() === req.user!.id)) {
      session.connectedStudents.push(req.user!.id as any)
    }
    
    await session.save()

    res.json({
      message: "Joined session successfully",
      session,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get Active Session (Student) - UPDATED
export const getActiveSession = async (req: Request, res: Response) => {
  try {
    // Look for session where student is in the students array (not just connected)
    const session = await Session.findOne({
      students: req.user!.id,
      status: "active",
    }).populate("programId")

    res.json({ session })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Leave Session (Student)
export const leaveSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body

    // Only remove from connectedStudents, keep in students array for history
    await Session.findByIdAndUpdate(sessionId, {
      $pull: { connectedStudents: req.user!.id },
    })

    res.json({ message: "Left session successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}