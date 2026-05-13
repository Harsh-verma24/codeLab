import { Router } from "express"
import { protect, teacherOnly } from "../middleware/auth.middleware"
import {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
} from "../controllers/program.controller"
import { startSession, getActiveSessions, getSessionById, endSession } from "../controllers/session.controller"
import { getSubmissions, verifySubmission, getSubmissionById } from "../controllers/submission.controller"
import { getTeacherStats } from "../controllers/stats.controller"

const router = Router()

// All routes require teacher authentication
router.use(protect, teacherOnly)

// Program routes
router.post("/programs/create", createProgram)
router.get("/programs/list", getPrograms)
router.get("/programs/:id", getProgramById)
router.put("/programs/:id", updateProgram)
router.delete("/programs/:id", deleteProgram)

// Session routes
router.post("/session/start", startSession)
router.get("/session/active", getActiveSessions)
router.get("/session/:id", getSessionById)
router.put("/session/:id/end", endSession)

// Submission routes
router.get("/submissions", getSubmissions)
router.get("/submissions/:id", getSubmissionById)
router.put("/submission/verify", verifySubmission)

// Stats
router.get("/stats", getTeacherStats)

export default router
