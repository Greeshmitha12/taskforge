import React, { useState } from "react";
import { Lock, Mail, User, CheckCircle2, AlertCircle } from "lucide-react";

export default function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    // Build out the dynamic path depending on user state
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setStatus({ type: "success", message: data.message || "Success!" });
      
      // Save token to browser local storage safely
      if (data.token) localStorage.setItem("token", data.token);
      
      // Trigger the main app view switch
      if (onLoginSuccess) onLoginSuccess();
      
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Or{" "}
            <button
              type="button" 
              onClick={() => {
                setIsRegister(!isRegister);
                setStatus({ type: "", message: "" }); // Clears old messages on toggle
              }}
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {isRegister ? "sign in to your existing account" : "register a new account"}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {status.message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${status.type === "success" ? "bg-emerald-950/50 border border-emerald-500/30 text-emerald-400" : "bg-rose-950/50 border border-rose-500/30 text-rose-400"}`}>
              {status.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-slate-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors font-semibold cursor-pointer"
            >
              {loading ? "Processing..." : isRegister ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}