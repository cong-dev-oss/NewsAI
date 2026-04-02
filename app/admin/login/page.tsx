"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, AlertCircle, Newspaper } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_token", data.access_token);
        router.push("/admin/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50/50 p-6 selection:bg-zinc-900 selection:text-white">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200/50">
            <Newspaper size={24} className="text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Admin Authentication</h1>
            <p className="text-sm text-zinc-500">Sign in to manage your news aggregation system.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl shadow-zinc-200/20 space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-xs font-semibold animate-in zoom-in-95 duration-200">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5 focus-within:text-zinc-900 text-zinc-500 transition-colors">
                <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 ">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all text-zinc-900 font-medium"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="space-y-1.5 focus-within:text-zinc-900 text-zinc-500 transition-colors">
                <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all text-zinc-900 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Continue to Dashboard"
              )}
            </button>
          </form>
          
          <div className="pt-2 text-center">
            <p className="text-zinc-400 text-[11px] font-medium leading-relaxed">
                Protected by enterprise-grade encryption.<br/>
                Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
