import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import './Modal.css';
import logo from '../Image/logo.svg';
import { getCurrentUser, logoutUser } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../Modal';

const Header = () => {
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUsername(userData.login);
      } catch (error) {
        setUsername(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUsername(null);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const { openModal } = useModal();

  const handleSupportClick = (e) => {
    e.preventDefault();
    openModal(
      <div className='profile'>
        <label className='main-label label'>Мой профиль</label>
        <img 
          src={ logo } 
          alt="Ваше фото"
          className="profile-photo"
        />
        <div className='profile-names'>
          <div className='profile-name-div'>
            <label className='profile-name label'>Имя</label>
            <input
              type="text"
              className="profile-name-input pr-input"
              //value={query}
              //onChange={handleChange}
              placeholder={"Иван"}
            />
          </div>
          <div className='profile-surname-div'>
            <label className='profile-surname label'>Фамилия</label>
            <input
              type="text"
              className="profile-surname-input pr-input"
              //value={query}
              //onChange={handleChange}
              placeholder={"Иван"}
            />
          </div>
        </div>
        <div className='profile-notifs'>
          <div className='profile-email-div'>
            <label className='profile-email label'>Электронная почта</label>
            <label className='profile-email-hint'>Для получаения уведомлений через почту</label>
            <input
              type="text"
              className="profile-email-input pr-input"
              //value={query}
              //onChange={handleChange}
              placeholder={"example@mail.com"}
            />
          </div>
          <div className='profile-tg-div'>
            <label className='profile-tg label'>Телеграмм</label>
            <label className='profile-tg-hint'>Для отправки уведомлений через Телеграмм-бота</label>
            <input
              type="text"
              className="profile-tg-input pr-input"
              //value={query}
              //onChange={handleChange}
              placeholder={"@tg_user"}
            />
          </div>
        </div>
        <div className='profile-buttons'>
          <button 
            type="button"
            className="profile-save-btn"
            //onClick={}
            aria-label="Сохранить изменения">
            Сохранить изменения
          </button>
          <button 
            type="button"
            className="profile-exit-btn"
            //onClick={}
            aria-label="Отмена">
            Отмена
          </button>  
        </div>
      </div>
    );
  };

  return (
    <header className={styles.header}>
      <img src={logo} alt="Логотип" className={styles.logo} />

      <nav className={styles.nav}>
        <a href="/" className={styles.navLink}>Главная</a>
        <a 
        href="/profile" 
        className={styles.navLink}
        onClick={handleSupportClick}
      >
        Мой профиль
      </a>
        <a href="/contact" className={styles.navLink}>Поддержка</a>

        {isLoading ? (
          <span className={styles.navLink}>Загрузка...</span>
        ) : username ? (
          <div className={styles.authSection}>
            <span className={styles.username}>Привет, {username}!</span>
            <button 
              className={styles.logoutBtn}
              onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        ) : (
          <a href="/login" className={styles.navLink}>Войти</a>
        )}
      </nav>
    </header>
  );
};

export default Header;
