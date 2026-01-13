/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import './CatalogPage.css';
import urgencyInactiveIcon from '../../../src/components/Image/urgency-inactive.svg';
import urgencyActiveIcon from '../../../src/components/Image/urgency-active.svg';
import filterIcon from '../../../src/components/Image/filter.svg'
import { getQueues, createRecord, getMyRecords, deleteRecord, getMyQueues, getRecordsByQueue, createQueue } from "../../api";


function generateTimeSlots(start = '08:00', end = '16:00', intervalISO = 'PT30M') {
  const slots = [];
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);

  const match = intervalISO.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const intervalMinutes = hours * 60 + minutes;

  if (intervalMinutes === 0) return [];
  let current = new Date();
  current.setHours(startHours, startMinutes, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHours, endMinutes, 0, 0);

  while (current <= endTime) {
    const h = String(current.getHours()).padStart(2, '0');
    const m = String(current.getMinutes()).padStart(2, '0');
    slots.push(`${h}:${m}`);

    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return slots;
}



function AppointmentFormInline({
  selectedQueue,
  visitPurpose,
  setVisitPurpose,
  selectedTime,
  TIME_SLOTS,
  handleTimeSelect,
  urgencyLevel,
  renderUrgencyIcons,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  triggerFileInput,
  fileInputRef,
  handleFileChange,
  files,
  removeFile,
  handleCreateAppointment,
  setSelectedQueue
}) {
  return (
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
  );
}



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
  const [queues, setQueues] = useState([]);
  const [loadingQueues, setLoadingQueues] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateQueueModalOpen, setIsCreateQueueModalOpen] = useState(false);
  const [newQueueName, setNewQueueName] = useState('');
  const [queueDescription, setQueueDescription] = useState('');
  const [recordInterval, setRecordInterval] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myQueues, setMyQueues] = useState([]);
  const [selectedFilterQueue, setSelectedFilterQueue] = useState(null);
  const [filteredQueueRecords, setFilteredQueueRecords] = useState([]);


  
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        setLoadingQueues(true);
        const queuesData = await getQueues();
        setQueues(queuesData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки очередей:', err);
        setError('Не удалось загрузить очереди. Пожалуйста, попробуйте позже.');
      } finally {
        setLoadingQueues(false);
      }
    };

    fetchQueues();
  }, []);

  useEffect(() => {
    const fetchMyQueues = async () => {
      try {
        const queuesData = await getMyQueues();
        setMyQueues(queuesData);
      } catch (err) {
        console.error('Ошибка загрузки моих очередей:', err);
      }
    };

    fetchMyQueues();
  }, []);

  const handleFilterQueueChange = async (queueId) => {
    setSelectedFilterQueue(queueId);
    try {
      const records = await getRecordsByQueue(queueId);
      setFilteredQueueRecords(records);
    } catch (err) {
      console.error('Ошибка загрузки записей очереди:', err);
      setFilteredQueueRecords([]);
    }
  };

  const fetchMyAppointments = useCallback(async () => {
    try {
      const records = await getMyRecords();

      const mappedAppointments = records.map(record => {
        const date = new Date(record.meeting_datetime);

        return {
          id: record.record_id,
          queueOwner: record.queue_id,
          purpose: record.purpose,
          time: date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          date: date.toLocaleDateString('ru-RU'),
          urgency: record.urgency_level,
          status: record.status,
          managerComment: record.manager_comment,
          files: []
        };
      });

      setAppointments(mappedAppointments);
    } catch (err) {
      console.error('Ошибка загрузки моих записей:', err);
    }
  }, []);

  useEffect(() => {
    fetchMyAppointments();
  }, [fetchMyAppointments]);


  const formattedQueues = useMemo(() => {
    if (!queues || queues.length === 0) return [];
    
    return queues.map(queue => ({
      id: queue.queue_id,
      owner: queue.name,
      owner_id: queue.owner_id,
      status: 'свободен',
      cleanup_interval: queue.cleanup_interval,
      record_interval: queue.record_interval,
      rawData: queue
    }));
  }, [queues]);

  const TIME_SLOTS = useMemo(() => {
    if (!selectedQueue) return [];
    return generateTimeSlots('08:00', '16:00', selectedQueue.rawData.record_interval);
  }, [selectedQueue]);


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

  const handleCreateAppointment = useCallback(async () => {
    if (!selectedQueue || !selectedTime || !visitPurpose.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const meetingDateTime = new Date();
      const [hours, minutes] = selectedTime.split(':').map(Number);
      meetingDateTime.setHours(hours, minutes, 0, 0);

      const newRecord = await createRecord({
        queue_id: selectedQueue.id,
        purpose: visitPurpose,
        meeting_datetime: meetingDateTime.toISOString(),
        urgency_level: urgencyLevel || 'low'
      });

      const newAppointment = {
        id: newRecord.record_id,
        queueId: newRecord.queue_id,
        queueOwner: selectedQueue.owner,
        time: selectedTime,
        date: meetingDateTime.toLocaleDateString('ru-RU'),
        purpose: newRecord.purpose,
        urgency: newRecord.urgency_level,
        files: files.map(file => file.name)
      };

      setAppointments(prev => [...prev, newAppointment]);

      setSelectedQueue(null);
      setVisitPurpose('');
      setSelectedTime('');
      setUrgencyLevel('');
      setFiles([]);

      alert('Запись успешно создана!');

    } catch (err) {
      console.error('Ошибка при создании записи:', err);
      alert('Не удалось создать запись. Попробуйте еще раз.');
    }
  }, [selectedQueue, selectedTime, visitPurpose, urgencyLevel, files]);


  const handleCancelAppointment = useCallback(async (recordId) => {
    if (!window.confirm('Вы уверены, что хотите отменить запись?')) {
      return;
    }

    try {
      await deleteRecord(recordId);
      await fetchMyAppointments();
      alert('Запись отменена');
    } catch (err) {
      console.error('Ошибка при отмене записи:', err);
      alert('Не удалось отменить запись');
    }
  }, [fetchMyAppointments]);


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

  const handleCreateQueueClick = useCallback(() => {
    setIsCreateQueueModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateQueueModalOpen(false);
    setNewQueueName('');
    setQueueDescription('');
    setRecordInterval(30);
    setIsSubmitting(false);
    document.body.style.overflow = 'unset';
  }, []);

  const handleCreateQueueSubmit = useCallback(async () => {
  if (!newQueueName.trim()) {
    alert('Введите название очереди');
    return;
  }

  setIsSubmitting(true);

  try {
    const newQueue = await createQueue({
      name: newQueueName,
      cleanup_interval: 'P1D',
      record_interval: `PT${recordInterval}M`
    });

    alert(`Очередь "${newQueue.name}" успешно создана!`);

    setMyQueues(prev => [...prev, newQueue]);

    handleCloseModal();
  } catch (error) {
    console.error('Ошибка при создании очереди:', error);
    alert('Не удалось создать очередь. Проверьте данные и попробуйте снова.');
  } finally {
    setIsSubmitting(false);
  }
}, [newQueueName, recordInterval, handleCloseModal]);

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

  function MyAppointmentsBlock() {
    return (
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
    )
  }

  function IncomingRequestsList() {
    return (
      <div className="incoming-requests">
      <h2 className="text">Заявки</h2>
      <input
          type="text"
          className="search-input"
          //value={query}
          //onChange={handleChange}
          placeholder={"Поиск"}
        />
        <button 
          type="button"
          className="filter-btn"
          onClick={() => setSelectedRequest(null)}
          aria-label="Фильтр"
        >
          <img 
            src={filterIcon}
            alt="Фильтр"
            className="filter-icon"
          />
        </button>
        <div className='incoming-buttons'>
          <button 
          type="button"
          className="queue-btn"
          onClick={() => setSelectedRequest(null)}>
          Новые
          </button>

          <button 
          type="button"
          className="queue-btn"
          onClick={() => setSelectedRequest(null)}>
          Согласованные
          </button>

          <button 
          type="button"
          className="queue-btn"
          onClick={() => setSelectedRequest(null)}>
          Отклоненные
          </button>

          <button 
          type="button"
          className="queue-btn"
          onClick={() => setSelectedRequest(null)}>
          Лист ожидания
          </button>
        </div>

        <div className="queue-dropdown">
          <label htmlFor="queue-select">Выбор проекта:</label>
          <select
            id="queue-select"
            value={selectedFilterQueue || ''}
            onChange={(e) => handleFilterQueueChange(e.target.value)}
          >
            <option value="">-- Все мои очереди --</option>
            {myQueues.map(queue => (
              <option key={queue.queue_id} value={queue.queue_id}>
                {queue.name}
              </option>
            ))}
          </select>
        </div>
      {queueRequests.length === 0 ? (
        <div className="no-requests">
          <p>Заявок пока нет</p>
          <p className="requests-hint">Когда кто-то записывается к вам, заявки появятся здесь</p>
        </div>
      ) : (
        <div className="requests-list">
          {selectedFilterQueue && filteredQueueRecords.length > 0 && (
  <div className="filtered-records">
    <h3>Записи выбранной очереди</h3>
    {filteredQueueRecords.map(record => {
      const date = new Date(record.meeting_datetime);
      return (
        <div key={record.record_id} className="appointment-item">
          <div className="appointment-content">
            <div className="app-left">
              <div className="app-owner">{record.queue_id}</div>
              <div className="app-purpose">Цель: {record.purpose}</div>
            </div>
            <div className="app-right">
              <div className="app-time">{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}, {date.toLocaleDateString('ru-RU')}</div>
              <div className="app-urgency">Срочность: {getUrgencyLabel(record.urgency_level)}</div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}

        </div>
      )}
    {queueRequests.map(request => (
  <div
    key={request.id}
    className={`request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`}
    onClick={() => setSelectedRequest(request)}
  >
    <div className="request-user">{request.userName}</div>
    <div className="request-purpose">{request.purpose}</div>
    <div className="request-time">{request.time}</div>
    {request.files && request.files.length > 0 && (
      <div className="request-files">{request.files.join(', ')}</div>
    )}
  </div>
))}
    </div>
    )
  }

  function RequestEditForm({ selectedRequest, handleSaveRequest, handleDeleteRequest }) {
  const [newTime, setNewTime] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [status, setStatus] = useState('ожидает');
  const [comment, setComment] = useState('');

  // Обновляем локальный стейт при смене выбранной заявки
  useEffect(() => {
    if (selectedRequest) {
      setNewTime(selectedRequest.time || '');
      setNewPriority(selectedRequest.priority || 'medium');
      setStatus(selectedRequest.status || 'ожидает');
      setComment(selectedRequest.comment || '');
    }
  }, [selectedRequest]);

  const handleSave = () => {
    if (!selectedRequest) return;
    handleSaveRequest({
      ...selectedRequest,
      time: newTime,
      priority: newPriority,
      status,
      comment
    });
  };

  const handleDelete = () => {
    if (!selectedRequest) return;
    handleDeleteRequest(selectedRequest.id);
  };

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
        <h3 className="form-title">Заявка</h3>
        <button 
          type="button"
          className="close-form-btn"
          onClick={() => handleDeleteRequest(null)}
          aria-label="Закрыть форму"
        >
          ×
        </button>
      </div>
      {/* Здесь оставляем твой HTML для деталей заявки */}
      <div className="request-details">
        <div className="detail-value detail-purpose">{selectedRequest.purpose}</div>
        <div className='double-row'>
          <div className="priority-container">
            {selectedRequest.priority === 'high' ? (
              <div className="high-priority-group">
                <div className="images-row">
                  <img src={urgencyActiveIcon} alt="ср" />
                  <img src={urgencyActiveIcon} alt="ср" />
                  <img src={urgencyActiveIcon} alt="ср" />
                </div>
              </div>
            ) : selectedRequest.priority === 'medium' ? (
              <div className="medium-priority-group">
                <div className="images-row">
                  <img src={urgencyActiveIcon} alt="ср" />
                  <img src={urgencyActiveIcon} alt="ср" />
                  <img src={urgencyInactiveIcon} alt="ср" />
                </div>
              </div>
            ) : (
              <div className="low-priority-group">
                <div className="images-row">
                  <img src={urgencyActiveIcon} alt="ср" />
                  <img src={urgencyInactiveIcon} alt="ср" />
                  <img src={urgencyInactiveIcon} alt="ср" />
                </div>
              </div>
            )}
          </div>
          <div className="detail-value time-value">{selectedRequest.time}</div>
        </div>
        {selectedRequest.files && selectedRequest.files.length > 0 && (
          <div className="detail-value file-list">
            {selectedRequest.files.map((file, index) => (
              <div key={index} className="file-item">{file}</div>
            ))}
          </div>
        )}
        <div className="detail-value user-name">{selectedRequest.userName}</div>
      </div>

      <div className="edit-form"> 
        <div className="form-actions">
          <button type="button" className="save-btn" onClick={handleSave}>Согласовать</button>
          <button type="button" className="delete-btn" onClick={handleDelete}>Отклонить</button>
          <button type="button" className="change-btn">Перенос времени</button>
          <button type="button" className="change-btn">Изменить приоритет</button>
        </div>
      </div>
    </div>
  );
}


  function MyQueueManager({ selectedRequest, setSelectedRequest, handleSaveRequest, handleDeleteRequest }) {
  return (
    <div className="my-queue-manager">
      <IncomingRequestsList setSelectedRequest={setSelectedRequest} />
      <RequestEditForm 
        selectedRequest={selectedRequest} 
        handleSaveRequest={handleSaveRequest} 
        handleDeleteRequest={handleDeleteRequest} 
      />
    </div>
  );
}



  const QueuesListContent = useCallback(() => {
    if (loadingQueues) {
      return (
        <div className="queues-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка очередей...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="queues-error">
          <p className="error-text">{error}</p>
          <button 
            type="button"
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    if (formattedQueues.length === 0) {
      return (
        <div className="no-queues">
          <p>Нет доступных очередей</p>
          <p className="queues-hint">Создайте очередь или дождитесь, пока другие пользователи создадут свои очереди</p>
        </div>
      );
    }

    return (
      <div className="queues-list">
        {formattedQueues.map((queue) => (
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
    );
  }, [loadingQueues, error, formattedQueues, handleQueueClick]);

  const sections = {
    queueslist: {
      title: 'Просмотр',
      content: (
        <div className="view-section">
          <div className="frame">
            <div className="queues">
              <h2 className="text">Открытые очереди</h2>
              <QueuesListContent />
            </div>
            
            {selectedQueue ? (
                              <AppointmentFormInline
                                selectedQueue={selectedQueue}
                                visitPurpose={visitPurpose}
                                setVisitPurpose={setVisitPurpose}
                                selectedTime={selectedTime}
                                TIME_SLOTS={TIME_SLOTS}
                                handleTimeSelect={handleTimeSelect}
                                urgencyLevel={urgencyLevel}
                                renderUrgencyIcons={renderUrgencyIcons}
                                isDragging={isDragging}
                                handleDragOver={handleDragOver}
                                handleDragLeave={handleDragLeave}
                                handleDrop={handleDrop}
                                triggerFileInput={triggerFileInput}
                                fileInputRef={fileInputRef}
                                handleFileChange={handleFileChange}
                                files={files}
                                removeFile={removeFile}
                                handleCreateAppointment={handleCreateAppointment}
                                setSelectedQueue={setSelectedQueue}
                              />
                            ) : (
                              <MyAppointmentsBlock />
                            )}

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
      ),
      subMenu: true
    }
  };

  const [activeSubMenu, setActiveSubMenu] = useState('requests')

  const subMenuItems = {
    requests: 'Создать новую очередь',
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
      

      {activeSection === 'myqueueslist' && (
        <div className="new-queue-button">
          {Object.entries(subMenuItems).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`queue-button ${activeSubMenu === key ? 'active' : ''}`}
              onClick={handleCreateQueueClick}
            >
              {label}
            </button>
          ))}
        </div>
      )}


      <div className="content-section" role="tabpanel" id={`${activeSection}-panel`}>
        {sections[activeSection].content}
      </div>
      {isCreateQueueModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Создание очереди</h2>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Название очереди *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newQueueName}
                  onChange={(e) => setNewQueueName(e.target.value)}
                  placeholder="Название (3-100 символов)"
                  maxLength={100}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Интервал записи
                </label>
                <p className="form-hint">
                  Определяет длительность одного временного слота для записи
                </p>
                <select
                  className="form-select"
                  value={recordInterval}
                  onChange={(e) => setRecordInterval(Number(e.target.value))}
                >
                  <option value={15}>15 минут</option>
                  <option value={30}>30 минут</option>
                  <option value={45}>45 минут</option>
                  <option value={60}>60 минут</option>
                  <option value={90}>1 час 30 минут</option>
                  <option value={120}>2 часа</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="modal-submit-btn"
                onClick={handleCreateQueueSubmit}
                disabled={isSubmitting || !newQueueName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Создание...
                  </>
                ) : (
                  'Создать очередь'
                )}
              </button>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;