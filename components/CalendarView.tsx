
import React, { useState, useMemo } from 'react';
// Fix: Import failing functions from their specific subpaths and update locale import path
import { format, endOfMonth, eachDayOfInterval, isSameDay, addMonths, isWithinInterval } from 'date-fns';
import { startOfMonth } from 'date-fns/startOfMonth';
import { subMonths } from 'date-fns/subMonths';
import { parseISO } from 'date-fns/parseISO';
import { ptBR } from 'date-fns/locale/pt-BR';
import { ChevronLeft, ChevronRight, MapPin, X, Info, Search, Ruler, History, Trash2, RotateCcw } from 'lucide-react';
import { ServiceRecord, ApplicationType } from '../types';

interface CalendarViewProps {
  services: ServiceRecord[];
  onOpenClosing?: () => void;
  onDeleteService?: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ services, onOpenClosing, onDeleteService }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filtragem dos serviços baseada no termo de busca
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

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Navegação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-slate-800 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <div className="flex gap-1 ml-2">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          
          {/* Botão de Fechamento do Mês no Calendário */}
          {onOpenClosing && (
            <button 
              onClick={onOpenClosing}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              <History className="w-3.5 h-3.5 text-emerald-400" />
              Fechar Mês
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
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-slate-50 p-3 text-center text-xs font-bold text-slate-500 uppercase">
            {day}
          </div>
        ))}

        {/* Preencher dias vazios antes do início do mês */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-slate-50 min-h-[100px] md:min-h-[120px]" />
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
                ${isSelected ? 'ring-2 ring-inset ring-emerald-500 z-10' : 'hover:bg-slate-50'}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`
                  text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-emerald-500 text-white' : isSelected ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'}
                `}>
                  {format(day, 'd')}
                </span>
                {dayServices.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {dayServices.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayServices.slice(0, 3).map(service => (
                  <div key={service.id} className="text-[10px] p-1 bg-slate-100 rounded text-slate-700 truncate font-medium">
                    {service.clientName}
                  </div>
                ))}
                {dayServices.length > 3 && (
                  <div className="text-[10px] text-slate-400 italic text-center">
                    + {dayServices.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalhes do Dia Selecionado */}
      {selectedDay && (
        <div className="bg-white rounded-xl border-2 border-emerald-500 p-6 mt-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800">
                  Serviços de {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                </h4>
                <p className="text-sm text-slate-500">{selectedDayServices.length} lançamento(s) {searchTerm ? 'filtrado(s)' : 'encontrado(s)'}</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedDay(null); setServiceToDelete(null); }}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {selectedDayServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDayServices.map(service => (
                <div key={service.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group/card">
                  
                  {/* Overlay de Confirmação de Exclusão */}
                  {serviceToDelete === service.id && (
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-200">
                      <p className="text-white font-bold text-sm mb-3">Excluir este lançamento?</p>
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={() => handleConfirmDelete(service.id)}
                          className="flex-1 bg-red-600 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Confirmar
                        </button>
                        <button 
                          onClick={() => setServiceToDelete(null)}
                          className="flex-1 bg-white/10 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-white/20 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-slate-800 text-lg">{service.clientName}</h5>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {service.areaName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${service.type === ApplicationType.PULVERIZACAO ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}
                      `}>
                        {service.type}
                      </span>
                      {onDeleteService && (
                        <button 
                          onClick={() => setServiceToDelete(service.id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Revisar / Excluir Serviço"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Área</p>
                      <p className="font-bold text-slate-700 flex items-center justify-center gap-1">
                        <Ruler className="w-3 h-3 text-slate-400" />
                        {service.hectares} ha
                      </p>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Valor UN</p>
                      <p className="font-bold text-slate-700">R$ {service.unitPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                      <p className="font-bold text-emerald-600">R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Info className="w-8 h-8 opacity-20" />
              <p>{searchTerm ? 'Nenhum serviço correspondente ao filtro para este dia.' : 'Nenhum serviço registrado para este dia.'}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <h4 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            Histórico {searchTerm ? 'Filtrado' : 'Completo'} do Mês
          </h4>
          {searchTerm && (
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              Mostrando resultados para: <strong>{searchTerm}</strong>
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-semibold">Data</th>
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Área</th>
                <th className="pb-3 font-semibold text-right">Hectares</th>
                <th className="pb-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices
                .filter(s => isWithinInterval(parseISO(s.date), { start: monthStart, end: monthEnd }))
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-slate-600">{format(parseISO(s.date), 'dd/MM')}</td>
                  <td className="py-3 font-medium text-slate-800">{s.clientName}</td>
                  <td className="py-3 text-slate-500">{s.areaName}</td>
                  <td className="py-3 text-right font-mono">{s.hectares.toFixed(1)} ha</td>
                  <td className="py-3 text-right font-bold text-emerald-600">R$ {s.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Nenhum serviço encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Re-using icon component since CalendarIcon name conflict
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default CalendarView;
