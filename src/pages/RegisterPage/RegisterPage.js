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
    // Проверка совпадения паролей
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      // Формирование данных для отправки
      const data = {
        login,
        password,
        email,
        email_notifications: true,
        telegram_login: login,
        telegram_notifications: true,
      };
      console.log(data);

      // Вызов API для регистрации
      await registerUser(data);

      // Установка сообщения об успехе
      setSuccess("Аккаунт успешно создан!");
      // Сброс ошибки
      setError("");

      // Автоматический редирект на страницу входа через 1.5 секунды
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      // Обработка ошибок от API
      setError(
        err.detail?.[0]?.msg ||
        err.message ||
        "Ошибка при регистрации"
      );
    }
  };

  return (
    <div className="registration">
      <div className="log-section">
        <div className="text-wrapper">Давайте знакомиться</div>

        <div className="login-and-password">
          <div className="log">
            <div className="frame1">
              <input
                className="div"
                placeholder="Введите логин"
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


        {/* Вывод сообщений об ошибках и успехе */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>

      <div className="rectangle" />
    </div>
  );
};

export default RegisterPage;
