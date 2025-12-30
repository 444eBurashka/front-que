import React, { useState } from "react";
import "./LoginPage.css";
import { loginUser } from "../../api";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginUser({ login, password });
      setError("");
      navigate("/catalog"); // Редирект на главную после входа
    } catch (err) {
      setError(
        err.detail?.[0]?.msg ||
        err.message ||
        "Ошибка при входе"
      );
    }
  };

  return (
    <div className="login">
      <div className="login-section">
        <div className="text-wrapper">Добро пожаловать</div>

        <div className="login-and-password">
          <div className="div">
            <div className="frame">
              <input
                className="text-wrapper-2"
                placeholder="Введите логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>

            <div className="div-wrapper">
              <input
                className="text-wrapper-2"
                placeholder="Введите пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="buttons">
          <div className="frame-2" onClick={handleLogin}>
            <div className="text-wrapper-3">Войти</div>
          </div>

          <div className="frame-3" onClick={() => navigate("/register")}>
            <div className="text-wrapper-4">Создать аккаунт</div>
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div className="rectangle" />
    </div>
  );
};

export default LoginPage;
