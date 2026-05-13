import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import mongoose from "mongoose"

// Route imports
import authRoutes from "./routes/auth.routes"
import teacherRoutes from "./routes/teacher.routes"
import studentRoutes from "./routes/student.routes"

// Socket handler
import { setupSocketHandlers } from "./socket/socket.handler"

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.json())

// Make io accessible in routes
app.set("io", io)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/teacher", teacherRoutes)
app.use("/api/student", studentRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" })
})

// Setup socket handlers
setupSocketHandlers(io)

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/code-lab"

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    const PORT = process.env.PORT || 5000
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  })

export { io }
