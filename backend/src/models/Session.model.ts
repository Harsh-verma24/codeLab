import mongoose, { type Document, Schema, type Types } from "mongoose"

export interface ISession extends Document {
  sessionCode: string
  programId: Types.ObjectId
  teacherId: Types.ObjectId
  status: "active" | "ended"
  students: Types.ObjectId[] // All students who have joined this session
  connectedStudents: Types.ObjectId[] // Currently connected students
  createdAt: Date
  updatedAt: Date
}

const sessionSchema = new Schema<ISession>(
  {
    sessionCode: { type: String, required: true, unique: true, uppercase: true },
    programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    status: { type: String, enum: ["active", "ended"], default: "active" },
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }], // NEW: Track all students who joined
    connectedStudents: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true },
)

// Add indexes for better query performance
sessionSchema.index({ sessionCode: 1, status: 1 })
sessionSchema.index({ teacherId: 1, status: 1 })
sessionSchema.index({ students: 1, status: 1 })

export default mongoose.model<ISession>("Session", sessionSchema)