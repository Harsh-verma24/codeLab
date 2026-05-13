import { Router } from "express"
import { registerTeacher, loginTeacher, registerStudent, loginStudent, getMe } from "../controllers/auth.controller"
import { protect } from "../middleware/auth.middleware"

const router = Router()

// Teacher auth
router.post("/teacher/register", registerTeacher)
router.post("/teacher/login", loginTeacher)

// Student auth
router.post("/student/register", registerStudent)
router.post("/student/login", loginStudent)

// Get current user
router.get("/me", protect, getMe)

export default router
