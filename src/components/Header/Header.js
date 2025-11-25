import styles from './Header.module.css';
import logo from '../Image/logo.svg';

const Header = () => {
  return (
    <header className={styles.header}>
      <img src={logo} alt="Логотип" className={styles.logo} />

      <nav className={styles.nav}>
        <a href="/" className={styles.navLink}>Главная</a>
        <a href="/catalog" className={styles.navLink}>Записаться</a>
        <a href="/about" className={styles.navLink}>Мои очереди</a>
        <a href="/contact" className={styles.navLink}>Поддержка</a>
        <a href="/login" className={styles.navLink}>
          Войти
        </a>
      </nav>
    </header>
  );
};

export default Header;