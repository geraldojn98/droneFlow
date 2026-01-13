
import React, { useState, useMemo } from 'react';
import { 
  format, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  addDays, 
  isWithinInterval
} from 'date-fns';
// Fix: Import failing functions from their specific subpaths to resolve exported member errors
import { startOfMonth } from 'date-fns/startOfMonth';
import { subMonths } from 'date-fns/subMonths';
import { startOfToday } from 'date-fns/startOfToday';
import { parseISO } from 'date-fns/parseISO';
import { ptBR } from 'date-fns/locale/pt-BR';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  MapPin, 
  Clock, 
  User, 
  ClipboardCheck, 
  Calendar as CalendarIcon,
  Trash2,
  CheckCircle2,
  Droplets,
  Wind
} from 'lucide-react';
import { AgendaItem, Client, ApplicationType, User as UserType } from '../types';

interface AgendaViewProps {
  agenda: AgendaItem[];
  setAgenda: React.Dispatch<React.SetStateAction<AgendaItem[]>>;
  clients: Client[];
  user: UserType;
  onEfetivar: (item: AgendaItem) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ agenda, setAgenda, clients, user, onEfetivar }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [hectares, setHectares] = useState(0);
  const [type, setType] = useState<ApplicationType>(ApplicationType.PULVERIZACAO);
  const [notes, setNotes] = useState('');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedArea = selectedClient?.areas.find(a => a.id === selectedAreaId);

  const getDayItems = (day: Date) => agenda.filter(item => isSameDay(parseISO(item.date), day));
  
  const upcomingItems = useMemo(() => {
    const today = startOfToday();
    const nextWeek = addDays(today, 7);
    return agenda
      .filter(item => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start: today, end: nextWeek });
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [agenda]);

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedArea) return;

    const newItem: AgendaItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: formDate,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      areaId: selectedArea.id,
      areaName: selectedArea.name,
      hectares,
      type,
      notes,
      createdBy: user.name,
      status: 'pending'
    };

    setAgenda(prev => [...prev, newItem]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedClientId('');
    setSelectedAreaId('');
    setHectares(0);
    setNotes('');
  };

  const removeAgendaItem = (id: string) => {
    setAgenda(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar: Upcoming & Legend */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-200" />
            <h3 className="font-black uppercase tracking-widest text-xs">Próximos 7 Dias</h3>
          </div>
          <div className="space-y-4">
            {upcomingItems.length > 0 ? upcomingItems.map(item => (
              <div key={item.id} className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-[10px] font-bold text-indigo-200 mb-1">
                  {format(parseISO(item.date), "dd 'de' MMM", { locale: ptBR })}
                </p>
                <div className="flex items-center justify-between gap-2">
                   <p className="text-sm font-bold truncate">{item.clientName}</p>
                   {item.type === ApplicationType.PULVERIZACAO ? <Droplets className="w-3 h-3 shrink-0" /> : <Wind className="w-3 h-3 shrink-0" />}
                </div>
                <p className="text-[10px] opacity-70 truncate">{item.areaName} - {item.hectares}ha</p>
              </div>
            )) : (
              <p className="text-xs opacity-50 italic">Nenhum serviço agendado para a próxima semana.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Coordenação</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-500" />
              <span className="text-xs font-bold text-slate-600">Serviço Planejado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-xs font-bold text-slate-600">Serviço Efetivado</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Agendamentos múltiplos em um único dia são listados individualmente para efetivação pontual de cada talhão.
            </p>
          </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-slate-800 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-slate-200 rounded-lg border border-slate-200"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-slate-200 rounded-lg border border-slate-200"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <button 
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-md hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Agendar Novo Serviço
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="bg-slate-50 p-3 text-center text-[10px] font-black text-slate-400 uppercase">
              {day}
            </div>
          ))}

          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50 min-h-[100px]" />
          ))}

          {days.map(day => {
            const dayItems = getDayItems(day);
            const isToday = isSameDay(day, startOfToday());
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <div 
                key={day.toString()} 
                onClick={() => setSelectedDay(day)}
                className={`bg-white min-h-[100px] p-2 transition-all cursor-pointer relative border-t border-l border-slate-100 hover:bg-indigo-50/30 ${isSelected ? 'ring-2 ring-inset ring-indigo-500 z-10' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayItems.slice(0, 3).map(item => (
                    <div key={item.id} className="text-[8px] p-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 font-black truncate uppercase leading-tight">
                      {item.clientName}
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <div className="text-[8px] text-center font-black text-indigo-400 bg-slate-50 rounded py-0.5 border border-slate-100">
                      + {dayItems.length - 3} SERVIÇOS
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Details Panel */}
        {selectedDay && (
          <div className="bg-white rounded-2xl border-2 border-indigo-500 p-6 animate-in slide-in-from-top-4 duration-300 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800">
                    Agenda: {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                  </h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{getDayItems(selectedDay).length} serviços planejados para este dia</p>
                </div>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getDayItems(selectedDay).map(item => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-300 transition-colors flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h5 className="font-black text-slate-800 text-lg leading-tight truncate">{item.clientName}</h5>
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1 uppercase mt-1">
                        <MapPin className="w-3 h-3" /> {item.areaName} ({item.hectares} ha)
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase border ${item.type === ApplicationType.PULVERIZACAO ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-100 mb-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Agendado por {item.createdBy}</span>
                    </div>
                    {item.notes ? (
                      <p className="text-xs text-slate-600 italic">"{item.notes}"</p>
                    ) : (
                      <p className="text-xs text-slate-300 italic">Sem observações adicionais.</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => onEfetivar(item)}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10 active:scale-95 group-hover:shadow-emerald-500/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Efetivar Item
                    </button>
                    <button 
                      onClick={() => removeAgendaItem(item.id)}
                      className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir Agendamento"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {getDayItems(selectedDay).length === 0 && (
                <div className="md:col-span-2 py-16 flex flex-col items-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                  <ClipboardCheck className="w-12 h-12 mb-3 opacity-10" />
                  <p className="font-bold text-sm">Não restam serviços para serem efetivados hoje.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Agenda Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-8 text-white relative">
              <h3 className="text-2xl font-black tracking-tight uppercase">Novo Planejamento</h3>
              <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest mt-1">Coordenação Operacional</p>
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleAddAgenda} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Prevista</label>
                  <input 
                    type="date" 
                    required 
                    value={formDate} 
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hectares</label>
                  <input 
                    type="number" 
                    required 
                    step="0.1"
                    value={hectares || ''} 
                    onChange={e => setHectares(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Produtor / Cliente</label>
                <select 
                  required 
                  value={selectedClientId} 
                  onChange={e => {
                    setSelectedClientId(e.target.value);
                    setSelectedAreaId('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Selecione o Produtor</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Talhão / Área</label>
                <select 
                  required 
                  disabled={!selectedClientId}
                  value={selectedAreaId} 
                  onChange={e => setSelectedAreaId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                >
                  <option value="">Selecione a Área</option>
                  {selectedClient?.areas.map(a => <option key={a.id} value={a.id}>{a.name} ({a.hectares}ha)</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Serviço</label>
                <select 
                  value={type}
                  onChange={e => setType(e.target.value as ApplicationType)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value={ApplicationType.PULVERIZACAO}>Pulverização</option>
                  <option value={ApplicationType.DISPERSAO}>Dispersão de Sólidos</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações Operacionais</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Solo úmido, requer atenção com vento..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98] mt-2"
              >
                Agendar na DroneFlow
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaView;
