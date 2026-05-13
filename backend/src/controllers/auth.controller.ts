import type { Request, Response } from "express"
import Teacher from "../models/Teacher.model"
import Student from "../models/Student.model"
import { generateToken } from "../utils/generateToken"

// Teacher Registration
export const registerTeacher = async (req: Request, res: Response) => {
  try {
    const { name, email, password, college, branch, subject, semester } = req.body

    // Check if teacher exists
    const existingTeacher = await Teacher.findOne({ email })
    if (existingTeacher) {
      return res.status(400).json({ message: "Teacher already exists with this email" })
    }

    // Create teacher
    const teacher = await Teacher.create({
      name,
      email,
      password,
      college,
      branch,
      subject,
      semester,
    })

    const token = generateToken(teacher._id.toString(), "teacher")

    res.status(201).json({
      message: "Teacher registered successfully",
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        college: teacher.college,
        branch: teacher.branch,
        subject: teacher.subject,
        semester: teacher.semester,
        role: "teacher",
      },
      token,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Teacher Login
export const loginTeacher = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const teacher = await Teacher.findOne({ email })
    if (!teacher) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const isMatch = await teacher.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const token = generateToken(teacher._id.toString(), "teacher")

    res.json({
      message: "Login successful",
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        college: teacher.college,
        branch: teacher.branch,
        subject: teacher.subject,
        semester: teacher.semester,
        role: "teacher",
      },
      token,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Student Registration
export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password, college, branch, subject, semester } = req.body

    // Check if student exists
    const existingStudent = await Student.findOne({ email })
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists with this email" })
    }

    // Create student
    const student = await Student.create({
      name,
      email,
      password,
      college,
      branch,
      subject,
      semester,
    })

    const token = generateToken(student._id.toString(), "student")

    res.status(201).json({
      message: "Student registered successfully",
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        college: student.college,
        branch: student.branch,
        subject: student.subject,
        semester: student.semester,
        role: "student",
      },
      token,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Student Login
export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const student = await Student.findOne({ email })
    if (!student) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const isMatch = await student.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const token = generateToken(student._id.toString(), "student")

    res.json({
      message: "Login successful",
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        college: student.college,
        branch: student.branch,
        subject: student.subject,
        semester: student.semester,
        role: "student",
      },
      token,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get Current User
export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" })
    }

    let user
    if (req.user.role === "teacher") {
      user = await Teacher.findById(req.user.id).select("-password")
    } else {
      user = await Student.findById(req.user.id).select("-password")
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user: { ...user.toObject(), role: req.user.role } })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
