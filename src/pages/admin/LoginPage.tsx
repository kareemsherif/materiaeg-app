import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Shield, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(password);
    if (result.ok) {
      toast.success("Welcome back, Administrator");
      navigate("/admin");
    } else {
      toast.error(result.message || "Invalid administrator password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="/materia-logo.png" 
              alt="Materia" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-charcoal-900" style={{ fontFamily: "Playfair Display, serif" }}>
            Materia Admin
          </h1>
          <p className="text-charcoal-500 mt-2">Enter your credentials to access the control panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-burgundy-900/5 p-8 border border-cream-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-burgundy-900/20 focus:border-burgundy-900 transition-all outline-none text-charcoal-900 placeholder:text-charcoal-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-burgundy-900 hover:bg-burgundy-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-burgundy-900/20 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? "Authenticating..." : "Access Control Panel"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-cream-100 text-center">
            <p className="text-xs text-charcoal-400 uppercase tracking-[0.2em]">
              Secure Access Only
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-xs text-charcoal-400">
          &copy; {new Date().getFullYear()} Materia - Premium Artificial Leather
        </p>
      </div>
    </div>
  );
}
