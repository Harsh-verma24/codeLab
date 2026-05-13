"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../lib/api"
import toast from "react-hot-toast"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import type { Question } from "../../types"

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
]

export default function CreateProgram() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    { title: "", description: "", sampleInput: "", sampleOutput: "", language: "python" },
  ])

  const addQuestion = () => {
    setQuestions([...questions, { title: "", description: "", sampleInput: "", sampleOutput: "", language: "python" }])
  }

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("At least one question is required")
      return
    }
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (!title.trim() || !subject.trim()) {
      toast.error("Title and subject are required")
      return
    }

    const validQuestions = questions.filter((q) => q.title.trim() && q.description.trim())
    if (validQuestions.length === 0) {
      toast.error("At least one complete question is required")
      return
    }

    setSaving(true)
    try {
      await api.post("/teacher/programs/create", {
        title,
        subject,
        description,
        questions: validQuestions,
      })
      toast.success("Program created successfully")
      navigate("/teacher/programs")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create program")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Program</h1>
          <p className="text-slate-600">Add programming questions for your students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Program Details */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Program Details</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Program Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g., Arrays and Strings Lab"
                required
              />
            </div>
            <div>
              <label className="label">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input"
                placeholder="e.g., Data Structures"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px]"
              placeholder="Brief description of the program..."
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Questions</h2>
            <button type="button" onClick={addQuestion} className="btn btn-secondary">
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <div key={index} className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">Question {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    value={question.title}
                    onChange={(e) => updateQuestion(index, "title", e.target.value)}
                    className="input"
                    placeholder="e.g., Reverse a String"
                  />
                </div>
                <div>
                  <label className="label">Language</label>
                  <select
                    value={question.language}
                    onChange={(e) => updateQuestion(index, "language", e.target.value)}
                    className="input"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={question.description}
                  onChange={(e) => updateQuestion(index, "description", e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Describe the problem statement..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Sample Input</label>
                  <textarea
                    value={question.sampleInput}
                    onChange={(e) => updateQuestion(index, "sampleInput", e.target.value)}
                    className="input font-mono text-sm min-h-[80px]"
                    placeholder="hello"
                  />
                </div>
                <div>
                  <label className="label">Sample Output</label>
                  <textarea
                    value={question.sampleOutput}
                    onChange={(e) => updateQuestion(index, "sampleOutput", e.target.value)}
                    className="input font-mono text-sm min-h-[80px]"
                    placeholder="olleh"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Program"}
          </button>
        </div>
      </form>
    </div>
  )
}
