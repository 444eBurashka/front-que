import React from "react";
import "./RegisterPage.css";

export const RegisterPage = () => {
  return (
    <div className="registration">
      <div className="log-section">
        <div className="text-wrapper">Давайте знакомиться</div>

        <div className="login-and-password">
          <div className="log">
            <div className="frame">
              <div className="div">Введите имя</div>
            </div>

            <div className="div-wrapper">
              <div className="div">Введите почту</div>
            </div>

            <div className="div-wrapper">
              <div className="div">Введите пароль</div>
            </div>

            <div className="frame-2">
              <div className="div">Подтвердите пароль</div>
            </div>
          </div>
        </div>

        <div className="buttons">
          <div className="frame-3">
            <div className="text-wrapper-2">Создать аккаунт</div>
          </div>

          <div className="frame-4">
            <div className="text-wrapper-3">У меня есть аккаунт</div>
          </div>
        </div>

        <p className="p">
          <span className="span">
            Нажимая кнопку «Создать аккаунт», Вы подтверждаете, что ознакомлены
            с
          </span>

          <span className="text-wrapper-4">&nbsp;</span>

          <a
            href="https://k-telecom.org/wp-content/uploads/2023/11/soglasie-na-obrabotku-dannyh.pdf"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="text-wrapper-5">
              Условиями обработки персональных данных
            </span>
          </a>

          <span className="text-wrapper-4">, </span>

          <span className="span">а также с</span>

          <span className="text-wrapper-4">&nbsp;</span>

          <a
            href="https://k-telecom.org/politika-konfidentsialnosti"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="text-wrapper-5">Политикой конфиденциальности</span>
          </a>
        </p>
      </div>

      <div className="rectangle" />
    </div>
  );
};

export default RegisterPage;