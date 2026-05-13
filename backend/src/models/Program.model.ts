import mongoose, { type Document, Schema, type Types } from "mongoose"

export interface IQuestion {
  _id?: Types.ObjectId
  title: string
  description: string
  sampleInput: string
  sampleOutput: string
  language: string
}

export interface IProgram extends Document {
  title: string
  subject: string
  description: string
  teacherId: Types.ObjectId
  questions: IQuestion[]
  createdAt: Date
  updatedAt: Date
}

const questionSchema = new Schema<IQuestion>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  sampleInput: { type: String, default: "" },
  sampleOutput: { type: String, default: "" },
  language: { type: String, required: true, enum: ["c", "cpp", "java", "python", "javascript"] },
})

const programSchema = new Schema<IProgram>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    questions: [questionSchema],
  },
  { timestamps: true },
)

export default mongoose.model<IProgram>("Program", programSchema)
