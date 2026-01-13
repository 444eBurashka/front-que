import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import './Modal.css';
import logo from '../Image/logo.svg';
import { getCurrentUser, logoutUser, updateUser } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../Modal';
import ProfileModal from './ProfileModal';


const Header = () => {
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");

  const { openModal, closeModal } = useModal();

  const navigate = useNavigate();

  useEffect(() => {
  const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setUsername(userData.login);
      } catch (error) {
        setUser(null);
        setUsername(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setTelegram(user.telegram_login || "");
    }
  }, [user]);



  const handleLogout = async () => {
    try {
      await logoutUser();
      setUsername(null);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleSaveProfile = async ({ email, telegram }) => {
    try {
      await updateUser(user.uuid, {
        email,
        telegram_login: telegram,
      });

      setUser(prev => ({
        ...prev,
        email,
        telegram_login: telegram,
      }));

      closeModal();
    } catch (error) {
      console.error(error);
    }
  };


  const handleCancel = () => {
    closeModal();
  };

  const isChanged = email !== user?.email || telegram !== user?.telegram_login;

  const handleSupportClick = (e) => {
    e.preventDefault();
    openModal(
      <ProfileModal
        user={user}
        onSave={handleSaveProfile}
        onCancel={closeModal}
      />
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
