import React, { useState, useMemo } from 'react';
import { format, endOfMonth, eachDayOfInterval, isSameDay, addMonths, isWithinInterval, startOfMonth, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { ChevronLeft, ChevronRight, MapPin, X, Info, Search, Ruler, History, Trash2, Lock } from 'lucide-react';
import { ServiceRecord, ApplicationType, ClosedMonth } from '../types';

interface CalendarViewProps {
  services: ServiceRecord[];
  closedMonths: ClosedMonth[]; // Nova prop
  onOpenClosing?: (monthData: { month: number; year: number; isClosed: boolean }) => void; // Prop atualizada
  onDeleteService?: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ services, closedMonths, onOpenClosing, onDeleteService }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Verifica se o mês visualizado já está fechado
  const isMonthClosed = useMemo(() => {
    return closedMonths.some(cm => 
      cm.month === currentDate.getMonth() + 1 && 
      cm.year === currentDate.getFullYear()
    );
  }, [closedMonths, currentDate]);

  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;
    const term = searchTerm.toLowerCase();
    return services.filter(s => 
      s.clientName.toLowerCase().includes(term) || 
      s.areaName.toLowerCase().includes(term)
    );
  }, [services, searchTerm]);

  const getDayServices = (day: Date) => {
    return filteredServices.filter(s => isSameDay(parseISO(s.date), day));
  };

  const selectedDayServices = selectedDay ? getDayServices(selectedDay) : [];

  const handleConfirmDelete = (id: string) => {
    if (onDeleteService) {
      onDeleteService(id);
      setServiceToDelete(null);
    }
  };

  const handleClosingClick = () => {
    if (onOpenClosing) {
      onOpenClosing({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        isClosed: isMonthClosed
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-black text-slate-800 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <div className="flex gap-1 ml-2">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          
          {/* BOTÃO DE FECHAMENTO DINÂMICO */}
          {onOpenClosing && (
            <button 
              onClick={handleClosingClick}
              className={`
                ml-2 flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95
                ${isMonthClosed 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'}
              `}
            >
              {isMonthClosed ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Fechado
                </>
              ) : (
                <>
                  <History className="w-3.5 h-3.5 text-emerald-400" />
                  Fechar Mês
                </>
              )}
            </button>
          )}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou fazenda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-slate-50 p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}

        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[100px] md:min-h-[120px]" />
        ))}

        {days.map(day => {
          const dayServices = getDayServices(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={day.toString()} 
              onClick={() => setSelectedDay(day)}
              className={`
                bg-white min-h-[100px] md:min-h-[120px] p-2 transition-all cursor-pointer border-t border-l border-slate-100 relative
                ${isSelected ? 'bg-emerald-50/50 ring-2 ring-inset ring-emerald-500 z-10' : 'hover:bg-slate-50'}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`
                  text-sm font-black w-7 h-7 flex items-center justify-center rounded-xl
                  ${isToday ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : isSelected ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'}
                `}>
                  {format(day, 'd')}
                </span>
                {dayServices.length > 0 && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    {dayServices.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayServices.slice(0, 3).map(service => (
                  <div key={service.id} className="text-[9px] p-1.5 bg-slate-100 rounded-lg text-slate-700 truncate font-bold border border-slate-200/50">
                    {service.clientName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalhes do Dia Selecionado */}
      {selectedDay && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 mt-4 animate-in slide-in-from-top-4 duration-300 shadow-xl relative overflow-hidden">
          {isMonthClosed && (
             <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
               <Lock className="w-3 h-3" /> Este mês está fechado
             </div>
          )}
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                  {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                </h4>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedDayServices.length} Lançamentos</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedDay(null); setServiceToDelete(null); }}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {selectedDayServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDayServices.map(service => (
                <div key={service.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden group">
                  {/* Bloqueio visual se fechado */}
                  {isMonthClosed && <div className="absolute inset-0 bg-white/40 pointer-events-none" />}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="font-black text-slate-800 text-lg leading-tight">{service.clientName}</h5>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mt-1">
                        <MapPin className="w-3 h-3 text-emerald-500" /> {service.areaName}
                      </p>
                    </div>
                    {!isMonthClosed && onDeleteService && (
                      <button 
                        onClick={() => setServiceToDelete(service.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Área</p>
                      <p className="font-black text-slate-700 text-sm">{service.hectares} ha</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Preço</p>
                      <p className="font-black text-slate-700 text-sm">R$ {service.unitPrice}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Total</p>
                      <p className="font-black text-emerald-600 text-sm">R$ {service.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 font-bold">Nenhum serviço para este dia.</div>
          )}
        </div>
      )}
    </div>
  );
};

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default CalendarView;