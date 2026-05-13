import type { Server, Socket } from "socket.io"
import jwt from "jsonwebtoken"
import LiveCode from "../models/LiveCode.model"
import Session from "../models/Session.model"
import Student from "../models/Student.model"

interface AuthenticatedSocket extends Socket {
  userId?: string
  userRole?: "teacher" | "student"
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error("Authentication required"))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
        id: string
        role: "teacher" | "student"
      }
      socket.userId = decoded.id
      socket.userRole = decoded.role
      next()
    } catch (error) {
      next(new Error("Invalid token"))
    }
  })

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`)

    // Join user's personal room
    socket.join(`user:${socket.userId}`)
    if (socket.userRole === "student") {
      socket.join(`student:${socket.userId}`)
    }

    // Teacher joins session room
    socket.on("teacher:join-session", async (sessionId: string) => {
      try {
        const session = await Session.findOne({
          _id: sessionId,
          teacherId: socket.userId,
        })

        if (session) {
          socket.join(`session:${sessionId}`)
          socket.join(`session:${sessionId}:teacher`)
          console.log(`Teacher joined session: ${sessionId}`)
        }
      } catch (error) {
        console.error("Error joining session:", error)
      }
    })

    // Student joins session room - UPDATED
    socket.on("student:join-session", async (sessionId: string) => {
      try {
        const session = await Session.findOne({
          _id: sessionId,
          status: "active",
        })

        if (!session) {
          console.log(`Session not found or inactive: ${sessionId}`)
          return
        }

        // Check if student is in the session's students array
        const isInSession = session.students.some(
          (id) => id.toString() === socket.userId
        )

        if (!isInSession) {
          console.log(`Student ${socket.userId} not authorized for session ${sessionId}`)
          return
        }

        // Add to connected students if not already there
        if (!session.connectedStudents.some((id) => id.toString() === socket.userId)) {
          session.connectedStudents.push(socket.userId as any)
          await session.save()
        }

        socket.join(`session:${sessionId}`)

        // Get student info and notify teacher
        const student = await Student.findById(socket.userId)
        
        io.to(`session:${sessionId}:teacher`).emit("student:joined", {
          studentId: socket.userId,
          studentName: student?.name || "Unknown",
          studentEmail: student?.email || "",
          sessionId,
        })

        console.log(`Student ${socket.userId} joined session: ${sessionId}`)
      } catch (error) {
        console.error("Error joining session:", error)
      }
    })

    // Live code update from student
    socket.on(
      "code:update",
      async (data: {
        sessionId: string
        questionId: string
        code: string
        language: string
      }) => {
        try {
          const { sessionId, questionId, code, language } = data

          // Save to database
          await LiveCode.findOneAndUpdate(
            {
              sessionId,
              studentId: socket.userId,
              questionId,
            },
            {
              code,
              language,
              lastUpdated: new Date(),
            },
            { upsert: true, new: true },
          )

          // Broadcast to teacher
          io.to(`session:${sessionId}:teacher`).emit("code:updated", {
            studentId: socket.userId,
            questionId,
            code,
            language,
            timestamp: new Date(),
          })
        } catch (error) {
          console.error("Error updating code:", error)
        }
      },
    )

    // Student typing indicator
    socket.on("student:typing", (data: { sessionId: string; questionId: string }) => {
      io.to(`session:${data.sessionId}:teacher`).emit("student:typing", {
        studentId: socket.userId,
        questionId: data.questionId,
      })
    })

    // Teacher requests student code
    socket.on(
      "teacher:request-code",
      async (data: {
        sessionId: string
        studentId: string
        questionId: string
      }) => {
        try {
          const liveCode = await LiveCode.findOne({
            sessionId: data.sessionId,
            studentId: data.studentId,
            questionId: data.questionId,
          })

          socket.emit("teacher:code-response", {
            studentId: data.studentId,
            questionId: data.questionId,
            code: liveCode?.code || "",
            language: liveCode?.language || "python",
          })
        } catch (error) {
          console.error("Error fetching code:", error)
        }
      },
    )

    // Leave session - UPDATED
    socket.on("leave-session", async (sessionId: string) => {
      try {
        // Remove from connected students if student
        if (socket.userRole === "student") {
          await Session.findByIdAndUpdate(sessionId, {
            $pull: { connectedStudents: socket.userId },
          })
        }

        socket.leave(`session:${sessionId}`)
        socket.leave(`session:${sessionId}:teacher`)

        io.to(`session:${sessionId}:teacher`).emit("student:left", {
          studentId: socket.userId,
          sessionId,
        })

        console.log(`User ${socket.userId} left session ${sessionId}`)
      } catch (error) {
        console.error("Error leaving session:", error)
      }
    })

    // Disconnect - UPDATED
    socket.on("disconnect", async () => {
      try {
        // If student, remove from all active sessions' connectedStudents
        if (socket.userRole === "student") {
          await Session.updateMany(
            { connectedStudents: socket.userId, status: "active" },
            { $pull: { connectedStudents: socket.userId } }
          )
        }
        console.log(`User disconnected: ${socket.userId}`)
      } catch (error) {
        console.error("Error on disconnect:", error)
      }
    })
  })
}