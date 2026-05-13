import mongoose, { type Document, Schema } from "mongoose"
import bcrypt from "bcryptjs"

export interface IStudent extends Document {
  name: string
  email: string
  password: string
  college: string
  branch: string
  subject: string
  semester: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    college: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model<IStudent>("Student", studentSchema)
