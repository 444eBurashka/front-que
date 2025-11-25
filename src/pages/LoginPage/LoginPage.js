import React from "react";
import "./LoginPage.css";

export const LoginPage = () => {
  return (
    <div className="login">
      <div className="login-section">
        <div className="text-wrapper">Добро пожаловать</div>

        <div className="login-and-password">
          <div className="div">
            <div className="frame">
              <div className="text-wrapper-2">Введите логин</div>
            </div>

            <div className="div-wrapper">
              <div className="text-wrapper-2">Введите пароль</div>
            </div>
          </div>
        </div>

        <div className="buttons">
          <div className="frame-2">
            <div className="text-wrapper-3">Войти</div>
          </div>

          <div className="frame-3">
            <div className="text-wrapper-4">Создать аккаунт</div>
          </div>
        </div>

        <p className="p">
          <span className="span">
            Нажимая кнопку «Войти», Вы подтверждаете, что ознакомлены с
          </span>

          <span className="text-wrapper-5">&nbsp;</span>

          <a
            href="https://k-telecom.org/wp-content/uploads/2023/11/soglasie-na-obrabotku-dannyh.pdf"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="text-wrapper-6">
              Условиями обработки персональных данных
            </span>
          </a>

          <span className="text-wrapper-5">, </span>

          <span className="span">а также с</span>

          <span className="text-wrapper-5">&nbsp;</span>

          <a
            href="https://k-telecom.org/politika-konfidentsialnosti"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="text-wrapper-6">Политикой конфиденциальности</span>
          </a>
        </p>

        <div className="text-wrapper-7">Восстановить доступ</div>
      </div>

      <div className="rectangle" />
    </div>
  );
};

export default LoginPage;