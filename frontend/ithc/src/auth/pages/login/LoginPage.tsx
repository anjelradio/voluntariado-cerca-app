import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="card">
      <h2>Iniciar sesión</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Iniciar</button>
      </form>

      <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
      <Link to="/register">¿No tienes cuenta? Regístrate</Link>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};
