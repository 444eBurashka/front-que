import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from '../Image/logo.svg';
import { getCurrentUser, logoutUser } from '../../api';
import { useNavigate } from 'react-router-dom';

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

  return (
    <header className={styles.header}>
      <img src={logo} alt="Логотип" className={styles.logo} />

      <nav className={styles.nav}>
        <a href="/" className={styles.navLink}>Главная</a>
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
