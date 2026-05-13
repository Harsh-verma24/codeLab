import { Link } from "react-router-dom"
import { GraduationCap, Code2, Users, Zap, Monitor, CheckCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">CodeLab</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/student/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Student Login
            </Link>
            <Link to="/teacher/login" className="btn btn-primary">
              Teacher Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Real-time Programming Practice Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Monitor Student Code <span className="text-primary-600">in Real-Time</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Create programming sessions, watch your students code live, and provide instant feedback. The modern way
              to conduct lab sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/teacher/register" className="btn btn-primary px-8 py-3 text-base">
                <GraduationCap className="w-5 h-5" />
                Get Started as Teacher
              </Link>
              <Link to="/student/register" className="btn btn-secondary px-8 py-3 text-base">
                <Code2 className="w-5 h-5" />
                Join as Student
              </Link>
            </div>
          </div>

          {/* Preview Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-sm text-slate-500 ml-2">CodeLab - Live Session</span>
              </div>
              <div className="p-8 bg-slate-900">
                <pre className="text-green-400 font-mono text-sm leading-relaxed">
                  {`# Welcome to CodeLab
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the function
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")
`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need for Lab Sessions</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A complete platform for conducting programming practice sessions with real-time monitoring.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Monitor,
                title: "Live Code Monitoring",
                description:
                  "Watch students type code in real-time. See their progress and identify struggles instantly.",
              },
              {
                icon: Users,
                title: "Session Management",
                description: "Create sessions with unique codes. Students join easily and start coding immediately.",
              },
              {
                icon: CheckCircle,
                title: "Code Verification",
                description: "Review submissions, provide feedback, and approve verified solutions with one click.",
              },
            ].map((feature, index) => (
              <div key={index} className="card p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Lab Sessions?</h2>
            <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of educators who are already using CodeLab to conduct more effective programming sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/teacher/register" className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3">
                Start Free Trial
              </Link>
              <Link to="/student/register" className="btn bg-primary-500 text-white hover:bg-primary-400 px-8 py-3">
                Student Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">CodeLab</span>
          </div>
          <p className="text-sm">2024 CodeLab. Built for educators, by educators.</p>
        </div>
      </footer>
    </div>
  )
}
