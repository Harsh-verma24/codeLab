import jwt from "jsonwebtoken"

export const generateToken = (id: string, role: "teacher" | "student"): string => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    } as jwt.SignOptions // Add type assertion here
  )
}