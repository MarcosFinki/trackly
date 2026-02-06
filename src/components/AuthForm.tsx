import { useState } from "react";
import "./AuthForm.css";
import { login, register } from "../services/authService";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }

      window.location.href = "/";
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case "INVALID_CREDENTIALS":
            setError("Invalid credentials");
            break;
          case "USER_EXISTS":
            setError("User already exists");
            break;
          default:
            setError(isLogin ? "Login failed" : "Registration failed");
        }
      } else {
        setError("Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-card" onSubmit={submit}>
      <h2 className="login-title">
        {isLogin ? "Trackly" : "Create account"}
      </h2>

      <p className="login-subtitle">
        {isLogin
          ? "Sign in to continue"
          : "Register to start tracking time"}
      </p>

      <div className="login-field">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="login-field">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="login-error">{error}</p>}

      <button
        className="login-button"
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Loading..."
          : isLogin
          ? "Login"
          : "Register"}
      </button>

      <a
        href={isLogin ? "/register" : "/login"}
        style={{ textAlign: "center", fontSize: "0.75rem" }}
      >
        {isLogin
          ? "Create account"
          : "Already have an account?"}
      </a>
    </form>
  );
}