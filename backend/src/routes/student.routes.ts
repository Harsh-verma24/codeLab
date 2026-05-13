import { Router } from "express"
import { protect, studentOnly } from "../middleware/auth.middleware"
import { joinSession, getActiveSession, leaveSession } from "../controllers/session.controller"
import { submitCode, getMySubmissions, getSubmissionHistory } from "../controllers/submission.controller"
import { getStudentStats } from "../controllers/stats.controller"

const router = Router()

// All routes require student authentication
router.use(protect, studentOnly)

// Session routes
router.post("/session/join", joinSession)
router.get("/session/active", getActiveSession)
router.post("/session/leave", leaveSession)

// Submission routes
router.post("/submission/submit", submitCode)
router.get("/submissions", getMySubmissions)
router.get("/history", getSubmissionHistory)

// Stats
router.get("/stats", getStudentStats)

export default router
