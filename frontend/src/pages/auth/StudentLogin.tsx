"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/auth.store"
import toast from "react-hot-toast"
import { Code2, Mail, Lock, ArrowRight } from "lucide-react"

export default function StudentLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password, "student")
      toast.success("Welcome back!")
      navigate("/student/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">CodeLab</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Student Login</h1>
          <p className="text-slate-600">Welcome back! Sign in to continue.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11"
                  placeholder="student@college.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 w-full py-3"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link to="/student/register" className="text-emerald-600 font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-slate-500">
          <Link to="/teacher/login" className="hover:underline">
            Are you a teacher? Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
