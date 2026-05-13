import mongoose, { type Document, Schema, type Types } from "mongoose"

export interface ILiveCode extends Document {
  sessionId: Types.ObjectId
  studentId: Types.ObjectId
  questionId: Types.ObjectId
  code: string
  language: string
  lastUpdated: Date
}

const liveCodeSchema = new Schema<ILiveCode>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    questionId: { type: Schema.Types.ObjectId, required: true },
    code: { type: String, default: "" },
    language: { type: String, default: "python" },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Compound index for efficient lookups
liveCodeSchema.index({ sessionId: 1, studentId: 1, questionId: 1 }, { unique: true })

export default mongoose.model<ILiveCode>("LiveCode", liveCodeSchema)
