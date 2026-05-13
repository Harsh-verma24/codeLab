"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/auth.store"
import toast from "react-hot-toast"
import { GraduationCap, ArrowRight } from "lucide-react"

export default function TeacherRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    branch: "",
    subject: "",
    semester: "",
  })
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(formData, "teacher")
      toast.success("Registration successful!")
      navigate("/teacher/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">CodeLab</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Teacher Registration</h1>
          <p className="text-slate-600">Create your account to get started.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="teacher@college.edu"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="label">College/University</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="input"
                  placeholder="ABC Engineering College"
                  required
                />
              </div>

              <div>
                <label className="label">Branch/Department</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="input"
                  placeholder="Computer Science"
                  required
                />
              </div>

              <div>
                <label className="label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input"
                  placeholder="Data Structures"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="label">Semester/Year</label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="input"
                  placeholder="3rd Semester"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3 mt-6">
              {isLoading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/teacher/login" className="text-primary-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
