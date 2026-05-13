import mongoose, { type Document, Schema, type Types } from "mongoose"

export interface ISubmission extends Document {
  sessionId: Types.ObjectId
  studentId: Types.ObjectId
  questionId: Types.ObjectId
  code: string
  language: string
  status: "pending" | "verified" | "rejected"
  feedback: string
  submittedAt: Date
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const submissionSchema = new Schema<ISubmission>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    questionId: { type: Schema.Types.ObjectId, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    feedback: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
  },
  { timestamps: true },
)

export default mongoose.model<ISubmission>("Submission", submissionSchema)
