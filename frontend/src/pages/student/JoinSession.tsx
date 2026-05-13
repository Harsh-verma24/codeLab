"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../lib/api"
import toast from "react-hot-toast"
import { PlayCircle, ArrowRight } from "lucide-react"

export default function JoinSession() {
  const navigate = useNavigate()
  const [sessionCode, setSessionCode] = useState("")
  const [joining, setJoining] = useState(false)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (sessionCode.length !== 6) {
      toast.error("Session code must be 6 characters")
      return
    }

    setJoining(true)
    try {
      const { data } = await api.post("/student/session/join", {
        sessionCode: sessionCode.toUpperCase(),
      })
      toast.success("Joined session successfully!")
      navigate(`/student/session/${data.session._id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join session")
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PlayCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Join Session</h1>
        <p className="text-slate-600 mt-2">Enter the 6-character session code provided by your teacher</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="label text-center block">Session Code</label>
            <input
              type="text"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase().slice(0, 6))}
              className="input text-center text-3xl font-mono font-bold tracking-widest py-4"
              placeholder="AB1290"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={joining || sessionCode.length !== 6}
            className="btn bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 w-full py-3 text-lg"
          >
            {joining ? "Joining..." : "Join Session"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-500">Ask your teacher for the session code if you don't have one</p>
    </div>
  )
}
