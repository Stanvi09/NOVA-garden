import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("aarav@nova.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate("/garden");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        position: "relative",
        zIndex: 1,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 360,
          padding: 36,
          background: "var(--color-surface-soft)",
          backdropFilter: "blur(14px)",
          border: "1px solid var(--color-sage-soft)",
          borderRadius: 18,
          boxShadow: "0 0 40px rgba(255, 143, 199, 0.15), 0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ fontSize: 30, marginBottom: 4, fontStyle: "italic" }}><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7em", fontWeight: 700, fontStyle: "normal", letterSpacing: 1 }}>NOVA</span> garden</h1>
        <p style={{ marginTop: 0, marginBottom: 26, color: "var(--color-muted-strong)", fontSize: 14 }}>
          🌸 Grow better code, one bloom at a time.
        </p>

        {mode === "signup" && (
          <label style={fieldStyle}>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </label>
        )}
        <label style={fieldStyle}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </label>
        <label style={fieldStyle}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
        </label>

        {error && <p role="alert" style={{ color: "var(--color-coral)", fontSize: 13 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 0",
            marginTop: 8,
            background: "var(--color-forest)",
            color: "var(--color-ivory)",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
          }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          style={{
            width: "100%",
            padding: "8px 0",
            marginTop: 8,
            background: "transparent",
            border: "none",
            color: "var(--color-olive)",
            fontSize: 13,
          }}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>

        <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 16 }}>
          Demo login: aarav@nova.dev / password123 (seeded)
        </p>
      </form>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "var(--color-muted-strong)",
  marginBottom: 14,
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "9px 11px",
  marginTop: 4,
  border: "1px solid var(--color-sage-soft)",
  borderRadius: 8,
  fontSize: 14,
  background: "var(--color-ivory-deep)",
  color: "var(--color-charcoal)",
  fontFamily: "var(--font-body)",
};
