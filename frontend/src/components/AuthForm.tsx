import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { UserRole } from "../types";

type Props = {
  form: { email: string; password: string; role: UserRole; name: string };
  setForm: Dispatch<SetStateAction<{ email: string; password: string; role: UserRole; name: string }>>;
  onRegister: () => void;
  onLogin: () => void;
  mode: "register" | "login";
  setMode: Dispatch<SetStateAction<"register" | "login">>;
  error?: string;
  loading?: boolean;
};

export function AuthForm({ form, setForm, onRegister, onLogin, mode, setMode, error, loading }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const canSubmit =
    mode === "register"
      ? form.name.trim().length > 1 && form.email.trim().length > 4 && form.password.trim().length >= 8
      : form.email.trim().length > 4 && form.password.trim().length > 0;

  const passwordStrength =
    form.password.length >= 12 ? "Strong" : form.password.length >= 8 ? "Good" : form.password.length >= 1 ? "Weak" : "";

  return (
    <section className="auth-card">
      <div className="card-title">
        <div>
          <h2>{mode === "register" ? "Join ApplyHub" : "Welcome back"}</h2>
        </div>
      </div>

      <div className="form-grid">
        {mode === "register" && (
          <div className="field">
            <label>Name</label>
            <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label>Password</label>
          <div className="input-wrap">
            <input
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              className="icon-button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
                  <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a18.38 18.38 0 0 1-3.16 4.21" />
                  <path d="M6.1 6.1C3.7 7.7 2 12 2 12s3 7 10 7c1.1 0 2.15-.15 3.12-.42" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {mode === "register" && (
          <div className="field">
            <label>Role</label>
            <div className="select-wrap">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
          </div>
        )}
        {error ? <div className="auth-error">{error}</div> : null}
        <div className="button-row">
          <button type="button" onClick={mode === "register" ? onRegister : onLogin} disabled={!canSubmit || loading}>
            {loading ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
          </button>
        </div>

        <button
          className="switch-link"
          type="button"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
        >
          {mode === "register" ? (
            <>
              <span className="switch-muted">Already have an account?</span>{" "}
              <span className="switch-accent">Sign in</span>
            </>
          ) : (
            <>
              <span className="switch-muted">Need an account?</span>{" "}
              <span className="switch-accent">Create one</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
