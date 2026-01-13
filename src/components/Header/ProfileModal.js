import { useState, useEffect } from 'react';
import logo from '../Image/logo.svg';

const ProfileModal = ({ user, onSave, onCancel }) => {
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setTelegram(user.telegram_login || '');
    }
  }, [user]);

  const isChanged =
    email !== user?.email ||
    telegram !== user?.telegram_login;

  const handleSave = () => {
    onSave({ email, telegram });
  };

  return (
    <div className="profile">
      <label className="main-label label">Мой профиль</label>

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
              placeholder={"Иванов"}
            />
          </div>
        </div>
      <div className='profile-notifs'>
        <div className='profile-email-div'>
            <label className='profile-email label'>Электронная почта</label>
            <label className='profile-email-hint'>Для получаения уведомлений через почту</label>
            <input
              type="email"
              className="profile-email-input pr-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
        </div>
        <div className='profile-tg-div'>
            <label className='profile-tg label'>Телеграм</label>
            <label className='profile-tg-hint'>Для отправки уведомлений через Телеграм-бота</label>
            <input
              type="text"
              value={telegram}
              className="profile-tg-input pr-input"
              onChange={(e) => setTelegram(e.target.value)}
            />
        </div>
      </div>
      <div className='profile-buttons'>
        <button disabled={!isChanged} onClick={handleSave} className="profile-save-btn">Сохранить</button>
        <button onClick={onCancel} className="profile-exit-btn">Отмена</button>
      </div>
      
    </div>
  );
};

export default ProfileModal;
