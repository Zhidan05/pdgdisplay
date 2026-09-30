"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/util/supabase/client";
import { RriBrand } from "@/components/shared/broadcast-ui";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message || "Invalid email or password");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="admin-layout" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="panel" style={{ padding: "30px", width: "100%", maxWidth: "400px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
          <RriBrand />
        </div>
        
        <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", textAlign: "center" }}>Login Konsol Admin</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", textAlign: "center", fontSize: "14px" }}>
          Gunakan kredensial Anda untuk masuk.
        </p>

        <form onSubmit={handleLogin} className="form-stack">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="admin@rri.co.id"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <p className="form-error" role="alert" style={{ marginTop: "10px" }}>{error}</p>}

          <button 
            type="submit" 
            className="button primary" 
            disabled={loading}
            style={{ width: "100%", marginTop: "20px", justifyContent: "center" }}
          >
            {loading ? "Memproses..." : <><LogIn size={16} /> Masuk</>}
          </button>
        </form>
      </div>
    </div>
  );
}
