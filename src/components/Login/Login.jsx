import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { replace, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("1234");
  const { user, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) login(email, password);
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="loginContainer">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="formControl">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            name="email"
          />
        </div>
        <div className="formControl">
          <label htmlFor="password">Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            name="password"
          />
        </div>
        <button className="btn btn--primary">Login</button>
      </form>
    </div>
  );
}

export default Login;
