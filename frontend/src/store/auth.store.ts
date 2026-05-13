import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "../lib/api"
import type { User } from "../types"
import { connectSocket, disconnectSocket } from "../lib/socket"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role: "teacher" | "student") => Promise<void>
  register: (data: RegisterData, role: "teacher" | "student") => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  college: string
  branch: string
  subject: string
  semester: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password, role) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post(`/auth/${role}/login`, { email, password })
          localStorage.setItem("token", data.token)
          connectSocket(data.token)
          set({
            user: { ...data.user, role },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (registerData, role) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post(`/auth/${role}/register`, registerData)
          localStorage.setItem("token", data.token)
          connectSocket(data.token)
          set({
            user: { ...data.user, role },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem("token")
        disconnectSocket()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      checkAuth: async () => {
        const token = localStorage.getItem("token")
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null })
          return
        }

        try {
          const { data } = await api.get("/auth/me")
          connectSocket(token)
          set({
            user: data.user,
            token,
            isAuthenticated: true,
          })
        } catch (error) {
          localStorage.removeItem("token")
          set({ isAuthenticated: false, user: null, token: null })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
