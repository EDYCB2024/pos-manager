import { useState, useEffect } from 'react';
import Modal from './ui/Modal';

export default function NotificationCreator({ isOpen, onClose }) {
  const [description, setDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('media');

  const DAYS = [
    { id: 1, label: 'Lunes' },
    { id: 2, label: 'Martes' },
    { id: 3, label: 'Miércoles' },
    { id: 4, label: 'Jueves' },
    { id: 5, label: 'Viernes' },
    { id: 6, label: 'Sábado' },
    { id: 0, label: 'Domingo' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setDescription('');
      setSelectedDays([]);
      setTime('');
      setPriority('media');
    }
  }, [isOpen]);

  const toggleDay = (dayId) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSave = () => {
    if (!description || !time || selectedDays.length === 0) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const notification = {
      description,
      days: selectedDays,
      time,
      priority,
      createdAt: new Date().toISOString()
    };

    console.log('Recordatorio Guardado:', notification);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={(
        <>
          <span className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center text-sm shadow-inner">📌</span>
          Nuevo Aviso
        </>
      )}
      maxWidth="max-w-sm"
      footer={(
        <>
          <button 
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="flex-[2] px-6 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-[2px] rounded-xl hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20 transition-all" 
            onClick={handleSave}
          >
            Guardar
          </button>
        </>
      )}
    >
      <div className="flex flex-col gap-5">
        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Revisar reportes ATC..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none text-sm font-medium"
            rows="2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Horario</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prioridad</label>
            <div className="relative group">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer pr-10 ${
                  priority === 'alta' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  priority === 'media' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full shadow-inner ${
                  priority === 'alta' ? 'bg-rose-500 shadow-rose-900/20' :
                  priority === 'media' ? 'bg-amber-400 shadow-amber-900/20' :
                  'bg-emerald-500 shadow-emerald-900/20'
                }`} />
                <svg className="w-3.5 h-3.5 text-slate-400/50 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Days selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Días activos</label>
          <div className="flex gap-1.5 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
            {DAYS.map(day => {
              const isActive = selectedDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all border ${isActive
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105 z-10'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                    }`}
                >
                  {day.label.slice(0, 3).toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
