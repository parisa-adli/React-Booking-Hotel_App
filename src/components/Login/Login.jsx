import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../context/AuthProvider";

function Login() {
  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState(null);
  const { user, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Enter your email and password.");
    if (login(email, password)) {
      navigate(state?.from || "/", { replace: true });
    } else {
      setError("That email and password don't match the demo account.");
    }
  };

  if (isAuthenticated) {
    return (
      <div className="loginContainer">
        <h1 className="pageTitle">Account</h1>
        <p className="mutedText">
          Signed in as <strong>{user.name}</strong> ({user.email}).
        </p>
        <button type="button" className="btn btn--secondary" onClick={() => {
          logout();
          navigate("/");
        }}>
          <MdLogout aria-hidden="true" /> Log out
        </button>
      </div>
    );
  }

  return (
    <div className="loginContainer">
      <h1 className="pageTitle">Log in</h1>
      <p className="mutedText loginNote">
        Demo account only. Logging in unlocks bookmarked places.
      </p>
      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="formControl">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            name="email"
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        <div className="formControl">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            name="password"
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        {error && (
          <p id="login-error" className="fieldError" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn--primary btn--block">Log in</button>
      </form>
    </div>
  );
}

export default Login;
