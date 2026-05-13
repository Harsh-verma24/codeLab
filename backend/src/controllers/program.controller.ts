import type { Request, Response } from "express"
import Program from "../models/Program.model"

// Create Program
export const createProgram = async (req: Request, res: Response) => {
  try {
    const { title, subject, description, questions } = req.body

    const program = await Program.create({
      title,
      subject,
      description,
      teacherId: req.user!.id,
      questions,
    })

    res.status(201).json({
      message: "Program created successfully",
      program,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get All Programs for Teacher
export const getPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await Program.find({ teacherId: req.user!.id }).sort({ createdAt: -1 })

    res.json({ programs })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get Program by ID
export const getProgramById = async (req: Request, res: Response) => {
  try {
    const program = await Program.findOne({
      _id: req.params.id,
      teacherId: req.user!.id,
    })

    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    res.json({ program })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update Program
export const updateProgram = async (req: Request, res: Response) => {
  try {
    const { title, subject, description, questions } = req.body

    const program = await Program.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user!.id },
      { title, subject, description, questions },
      { new: true },
    )

    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    res.json({ message: "Program updated successfully", program })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete Program
export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const program = await Program.findOneAndDelete({
      _id: req.params.id,
      teacherId: req.user!.id,
    })

    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    res.json({ message: "Program deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
