import React, { useState } from "react";
import "./RegisterPage.css";
import { registerUser } from "../../api";
import { useNavigate } from "react-router-dom";

export const RegisterPage = () => {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      const data = {
        login,
        password,
        email,
        email_notifications: true,
        telegram_login: "",
        telegram_notifications: false,
      };
      await registerUser(data);
      setSuccess("Аккаунт успешно создан!");
      setError("");
    } catch (err) {
      setError(err.detail?.[0]?.msg || "Ошибка при регистрации");
    }
  };

  return (
    <div className="registration">
      <div className="log-section">
        <div className="text-wrapper">Давайте знакомиться</div>

        <div className="login-and-password">
          <div className="log">
            <div className="frame">
              <input
                className="div"
                placeholder="Введите имя"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>

            <div className="div-wrapper">
              <input
                className="div"
                placeholder="Введите почту"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="div-wrapper">
              <input
                className="div"
                placeholder="Введите пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="frame-2">
              <input
                className="div"
                placeholder="Подтвердите пароль"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="buttons">
          <div className="frame-3" onClick={handleRegister}>
            <div className="text-wrapper-2">Создать аккаунт</div>
          </div>

          <div className="frame-4" onClick={() => navigate("/login")}>
            <div className="text-wrapper-3">У меня есть аккаунт</div>
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>

      <div className="rectangle" />
    </div>
  );
};

export default RegisterPage;
