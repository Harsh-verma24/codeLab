import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import Teacher from "../models/Teacher.model"
import Student from "../models/Student.model"

interface JwtPayload {
  id: string
  role: "teacher" | "student"
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: "teacher" | "student"
      }
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload

    // Verify user exists
    if (decoded.role === "teacher") {
      const teacher = await Teacher.findById(decoded.id)
      if (!teacher) {
        return res.status(401).json({ message: "Teacher not found" })
      }
    } else {
      const student = await Student.findById(decoded.id)
      if (!student) {
        return res.status(401).json({ message: "Student not found" })
      }
    }

    req.user = { id: decoded.id, role: decoded.role }
    next()
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" })
  }
}

export const teacherOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ message: "Access denied. Teachers only." })
  }
  next()
}

export const studentOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({ message: "Access denied. Students only." })
  }
  next()
}
