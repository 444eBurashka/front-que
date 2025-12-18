/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import './CatalogPage.css';
import urgencyInactiveIcon from '../../../src/components/Image/urgency-inactive.svg';
import urgencyActiveIcon from '../../../src/components/Image/urgency-active.svg';

const CatalogPage = () => {
  const [activeSection, setActiveSection] = useState('queueslist');
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [visitPurpose, setVisitPurpose] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const fileInputRef = useRef(null);

  const QUEUES = useMemo(() => [
    { id: 1, owner: 'Артем Артемович', status: 'на встрече' },
    { id: 2, owner: 'Иван Иванович', status: 'свободен' },
    { id: 3, owner: 'Мария Петровна', status: 'свободен' },
    { id: 4, owner: 'Алексей Сергеевич', status: 'не доступен' }
  ], []);

  const TIME_SLOTS = useMemo(() => 
    ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'], []
  );

  const initialRequests = useMemo(() => [
    { 
      id: 1, 
      userName: 'Иван Иванов', 
      purpose: 'Консультация по проекту', 
      time: '10:00', 
      priority: 'medium',
      status: 'ожидает',
      files: ['техническое_задание.pdf', 'схема.jpg'],
      comment: ''
    },
    { 
      id: 2, 
      userName: 'Мария Петрова', 
      purpose: 'Обсуждение сотрудничества', 
      time: '14:00', 
      priority: 'high',
      status: 'ожидает',
      files: ['презентация.pptx'],
      comment: ''
    },
    { 
      id: 3, 
      userName: 'Алексей Смирнов', 
      purpose: 'Вопрос по договору', 
      time: '11:00', 
      priority: 'low',
      status: 'ожидает',
      files: [],
      comment: ''
    },
  ], []);

  const [queueRequests, setQueueRequests] = useState(initialRequests);

  const handleQueueClick = useCallback((queue) => {
    if (queue.status !== 'не доступен') {
      setSelectedQueue(queue);
      setVisitPurpose('');
      setSelectedTime('');
      setUrgencyLevel('');
      setFiles([]);
    }
  }, []);

  const handleTimeSelect = useCallback((time) => {
    setSelectedTime(time === selectedTime ? '' : time);
  }, [selectedTime]);

  const handleUrgencySelect = useCallback((level) => {
    setUrgencyLevel(level);
  }, []);

  const handleFileChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCreateAppointment = useCallback(() => {
    if (!selectedQueue || !selectedTime || !visitPurpose.trim()) return;
    
    const newAppointment = {
      id: Date.now(),
      queueId: selectedQueue.id,
      queueOwner: selectedQueue.owner,
      time: selectedTime,
      date: new Date().toLocaleDateString('ru-RU'),
      purpose: visitPurpose,
      urgency: urgencyLevel,
      files: files.map(file => file.name)
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    setSelectedQueue(null);
    setVisitPurpose('');
    setSelectedTime('');
    setUrgencyLevel('');
    setFiles([]);
  }, [selectedQueue, selectedTime, visitPurpose, urgencyLevel, files]);

  const handleCancelAppointment = useCallback((id) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  }, []);

  const handleSectionChange = useCallback((sectionKey) => {
    setActiveSection(sectionKey);
    setSelectedQueue(null);
    setSelectedRequest(null);
    setVisitPurpose('');
    setSelectedTime('');
    setUrgencyLevel('');
    setFiles([]);
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSaveRequest = useCallback((updatedRequest) => {
    setQueueRequests(prev => prev.map(req => 
      req.id === updatedRequest.id ? updatedRequest : req
    ));

    if (updatedRequest.status === 'принята' || updatedRequest.status === 'отклонена') {
      setQueueRequests(prev => prev.filter(req => req.id !== updatedRequest.id));
    }
    
    setSelectedRequest(null);
  }, []);

  const handleDeleteRequest = useCallback((requestId) => {
    setQueueRequests(prev => prev.filter(req => req.id !== requestId));
    setSelectedRequest(null);
  }, []);


  const renderUrgencyIcons = () => {
    const icons = [];
    
    for (let i = 1; i <= 3; i++) {
      const isActive = (urgencyLevel === 'low' && i === 1) || 
                      (urgencyLevel === 'medium' && i <= 2) || 
                      (urgencyLevel === 'high' && i <= 3);
      
      icons.push(
        <button
          key={i}
          type="button"
          className="urgency-icon-btn"
          onClick={() => {
            if (i === 1) handleUrgencySelect('low');
            else if (i === 2) handleUrgencySelect('medium');
            else if (i === 3) handleUrgencySelect('high');
          }}
          aria-label={`Срочность: ${i === 1 ? 'Низкая' : i === 2 ? 'Средняя' : 'Высокая'}`}
        >
          <img 
            src={isActive ? urgencyActiveIcon : urgencyInactiveIcon} 
            alt=""
            className="urgency-icon-img"
          />
        </button>
      );
    }
    
    return icons;
  };

  const getUrgencyLabel = (level) => {
    switch(level) {
      case 'low': return 'Низкая';
      case 'medium': return 'Средняя';
      case 'high': return 'Высокая';
      default: return 'Не указана';
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
      default: return 'Не указан';
    }
  };


  const AppointmentFormInline = useCallback(() => (
    <div className="appointment-form-inline">
      <div className="appointment-form-header">
        <h2 className="text">Запись на встречу</h2>
        <button 
          type="button"
          className="close-form-btn"
          onClick={() => setSelectedQueue(null)}
          aria-label="Закрыть форму"
        >
          ×
        </button>
      </div>
      <div className="appointment-body">
        <div className="queue-owner">{selectedQueue.owner}</div>
        
        <div className="form-group">
          <label className="appointment-text">Укажите цель визита</label>
          <input 
            type="text" 
            className="queue-input" 
            value={visitPurpose}
            onChange={(e) => setVisitPurpose(e.target.value)}
            placeholder="Например: Консультация по проекту"
            maxLength={100}
          />
        </div>
        
        <div className="form-group">
          <label className="appointment-text">Укажите время встречи</label>
          <div className="time-slots">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                type="button"
                className={`time-slot-btn ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label className="appointment-text">Укажите срочность встречи</label>
          <div className="urgency-selector">
            {renderUrgencyIcons()}
            <div className="urgency-labels">
              <span className={`urgency-label ${urgencyLevel === 'low' ? 'active' : ''}`}></span>
              <span className={`urgency-label ${urgencyLevel === 'medium' ? 'active' : ''}`}></span>
              <span className={`urgency-label ${urgencyLevel === 'high' ? 'active' : ''}`}></span>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label className="appointment-text">Файлы</label>
          <div 
            className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <div className="file-drop-content">
              <div className="file-drop-text">
                <span className="file-drop-main">Перетащите файлы сюда</span>
                <span className="file-drop-sub">или кликните для выбора файла</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="file-input-hidden"
            />
          </div>
          
          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {file.size > 1024 * 1024 
                      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                      : `${(file.size / 1024).toFixed(1)} KB`
                    }
                  </span>
                  <button 
                    type="button"
                    className="file-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    aria-label="Удалить файл"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button 
          type="button"
          className="submit-appointment-btn"
          onClick={handleCreateAppointment}
          disabled={!selectedTime || !visitPurpose.trim()}
        >
          Записаться
        </button>
      </div>
    </div>
  ), [
    selectedQueue, 
    visitPurpose, 
    selectedTime, 
    urgencyLevel, 
    files, 
    isDragging,
    TIME_SLOTS,
    handleTimeSelect,
    handleUrgencySelect,
    handleCreateAppointment,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    triggerFileInput,
    removeFile,
    renderUrgencyIcons
  ]);

  const MyAppointmentsBlock = useCallback(() => (
    <div className="appointment">
      <h2 className="text">Мои записи</h2>
      {appointments.length === 0 ? (
        <div className="no-appointments">Записей нет</div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-item">
              <div className="appointment-content">
                <div className="app-left">
                  <div className="app-owner">{appointment.queueOwner}</div>
                  <div className="app-purpose">Цель: {appointment.purpose}</div>
                  {appointment.files && appointment.files.length > 0 && (
                    <div className="app-files">
                      Файлы: {appointment.files.join(', ')}
                    </div>
                  )}
                </div>
                <div className="app-right">
                  <div className="app-time">{appointment.time}, {appointment.date}</div>
                  <div className="app-urgency">Срочность: {getUrgencyLabel(appointment.urgency)}</div>
                </div>
              </div>
              <button 
                type="button"
                className="cancel-appointment-btn"
                onClick={() => handleCancelAppointment(appointment.id)}
                aria-label="Отменить запись"
              >
                Отменить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  ), [appointments, handleCancelAppointment, getUrgencyLabel]);


  const IncomingRequestsList = useCallback(() => (
    <div className="incoming-requests">
      <h2 className="text">Поступающие заявки</h2>
      
      {queueRequests.length === 0 ? (
        <div className="no-requests">
          <p>Заявок пока нет</p>
          <p className="requests-hint">Когда кто-то записывается к вам, заявки появятся здесь</p>
        </div>
      ) : (
        <div className="requests-list">
          {queueRequests.map(request => (
            <button
              key={request.id}
              type="button"
              className={`request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`}
              onClick={() => setSelectedRequest(request)}
            >
              <div className='request-priority'>{request.priority}</div>
              <div className="request-purpose">{request.purpose}</div>
              <div className="request-time">{request.time}</div>
              {request.files && request.files.length > 0 && (
                <div className="request-files">📎 {request.files} файл</div>
              )}
              <div className="request-user">{request.userName}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  ), [queueRequests, selectedRequest]);

  const RequestEditForm = useCallback(() => {
    const [newTime, setNewTime] = useState(selectedRequest?.time || '');
    const [newPriority, setNewPriority] = useState(selectedRequest?.priority || 'medium');
    const [status, setStatus] = useState(selectedRequest?.status || 'ожидает');
    const [comment, setComment] = useState(selectedRequest?.comment || '');

    const handleSave = useCallback(() => {
      const updatedRequest = {
        ...selectedRequest,
        time: newTime,
        priority: newPriority,
        status: status,
        comment: comment
      };
      
      handleSaveRequest(updatedRequest);
    }, [selectedRequest, newTime, newPriority, status, comment, handleSaveRequest]);

    const handleDelete = useCallback(() => {
      handleDeleteRequest(selectedRequest.id);
    }, [selectedRequest, handleDeleteRequest]);

    if (!selectedRequest) {
      return (
        <div className="request-edit-form empty">
          <div className="empty-state">
            <h3>Выберите заявку</h3>
            <p>Выберите заявку из списка слева для просмотра и редактирования</p>
          </div>
        </div>
      );
    }

    return (
      <div className="request-edit-form">
        <div className="form-header">
          <h3 className="form-title">Редактирование заявки</h3>
          <button 
            type="button"
            className="close-form-btn"
            onClick={() => setSelectedRequest(null)}
            aria-label="Закрыть форму"
          >
            ×
          </button>
        </div>
        
        <div className="request-details">
          <div className="detail-value user-name">{selectedRequest.userName}</div>
          <div className="detail-value">{selectedRequest.purpose}</div>
          <div className="detail-value time-value">{selectedRequest.time}</div>
          <div className="detail-value priority-value">
            <span className={`priority-badge ${selectedRequest.priority}`}>
              {getPriorityLabel(selectedRequest.priority)}
            </span>
          </div>
          
          {selectedRequest.files && selectedRequest.files.length > 0 && (
            <div className="detail-group">
              <label className="detail-label">Приложенные файлы:</label>
              <div className="file-list">
                {selectedRequest.files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="edit-form">
          <div className="form-group">
            <label className="form-label">Новое время встречи:</label>
            <select 
              className="time-select"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            >
              <option value="">Выберите время</option>
              {TIME_SLOTS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Новый приоритет:</label>
            <div className="priority-selector">
              <button
                type="button"
                className={`priority-option ${newPriority === 'low' ? 'selected' : ''}`}
                onClick={() => setNewPriority('low')}
              >
                Низкий
              </button>
              <button
                type="button"
                className={`priority-option ${newPriority === 'medium' ? 'selected' : ''}`}
                onClick={() => setNewPriority('medium')}
              >
                Средний
              </button>
              <button
                type="button"
                className={`priority-option ${newPriority === 'high' ? 'selected' : ''}`}
                onClick={() => setNewPriority('high')}
              >
                Высокий
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Статус заявки:</label>
            <div className="status-selector">
              <button
                type="button"
                className={`status-option ${status === 'ожидает' ? 'selected' : ''}`}
                onClick={() => setStatus('ожидает')}
              >
                Ожидает
              </button>
              <button
                type="button"
                className={`status-option ${status === 'принята' ? 'selected' : ''}`}
                onClick={() => setStatus('принята')}
              >
                Принять
              </button>
              <button
                type="button"
                className={`status-option ${status === 'отклонена' ? 'selected' : ''}`}
                onClick={() => setStatus('отклонена')}
              >
                Отклонить
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Комментарий:</label>
            <textarea 
              className="comment-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Добавьте комментарий к заявке..."
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button"
              className="save-btn"
              onClick={handleSave}
            >
              Сохранить изменения
            </button>
            <button 
              type="button"
              className="delete-btn"
              onClick={handleDelete}
            >
              Удалить заявку
            </button>
          </div>
        </div>
      </div>
    );
  }, [selectedRequest, TIME_SLOTS, handleSaveRequest, handleDeleteRequest, getPriorityLabel]);

  const MyQueueManager = useCallback(() => (
    <div className="my-queue-manager">
      <IncomingRequestsList />
      <RequestEditForm />
    </div>
  ), [IncomingRequestsList, RequestEditForm]);


  const sections = {
    queueslist: {
      title: 'Просмотр',
      content: (
        <div className="view-section">
          <div className="frame">
            <div className="queues">
              <h2 className="text">Открытые очереди</h2>
              <div className="queues-list">
                {QUEUES.map((queue) => (
                  <button
                    key={queue.id}
                    type="button"
                    className={`queue-item ${queue.status === 'свободен' ? 'available' : ''}`}
                    onClick={() => handleQueueClick(queue)}
                    disabled={queue.status === 'не доступен'}
                    aria-label={`Записаться к ${queue.owner}, статус: ${queue.status}`}
                  >
                    <div className="item-owner">{queue.owner}</div>
                    <div className={`item-status ${queue.status === 'свободен' ? 'free' : 'busy'}`}>
                      {queue.status}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {selectedQueue ? <AppointmentFormInline /> : <MyAppointmentsBlock />}
          </div>
        </div>
      )
    },
    myqueueslist: {
      title: 'Моя очередь',
      content: (
        <div className="my-queue-section">
          <MyQueueManager />
        </div>
      )
    }
  };

  return (
    <div className="catalog-main">
      <div className="toggle-buttons" role="tablist">
        {Object.keys(sections).map((sectionKey) => (
          <button
            key={sectionKey}
            type="button"
            className={`toggle-button ${activeSection === sectionKey ? 'active' : ''}`}
            onClick={() => handleSectionChange(sectionKey)}
            role="tab"
            aria-selected={activeSection === sectionKey}
            aria-controls={`${sectionKey}-panel`}
          >
            {sections[sectionKey].title}
          </button>
        ))}
      </div>

      <div className="content-section" role="tabpanel" id={`${activeSection}-panel`}>
        {sections[activeSection].content}
      </div>
    </div>
  );
};

export default CatalogPage;
