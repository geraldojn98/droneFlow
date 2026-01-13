
import React, { useState } from 'react';
import { ClosedMonth } from '../types';
import { ChevronDown, ChevronUp, FileText, Calendar, TrendingUp, DollarSign, Ruler, Users, Info, X, RotateCcw, AlertTriangle } from 'lucide-react';
// Fix: Import parseISO from its specific subpath to resolve "no exported member" error
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { ptBR } from 'date-fns/locale/pt-BR';

interface HistoryViewProps {
  closedMonths: ClosedMonth[];
  onReopenMonth?: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ closedMonths, onReopenMonth }) => {
  const [selectedMonth, setSelectedMonth] = useState<ClosedMonth | null>(null);
  const [isConfirmingReopen, setIsConfirmingReopen] = useState(false);

  const handleReopen = () => {
    if (selectedMonth && onReopenMonth) {
      onReopenMonth(selectedMonth.id);
      setSelectedMonth(null);
      setIsConfirmingReopen(false);
    }
  };

  if (closedMonths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-400">
        <HistoryIcon className="w-16 h-16 mb-4 opacity-10" />
        <p className="text-lg font-medium">Nenhum mês fechado no histórico.</p>
        <p className="text-sm">Os fechamentos realizados aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {closedMonths.map(month => (
          <div 
            key={month.id}
            onClick={() => setSelectedMonth(month)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-900 text-white p-2 rounded-lg group-hover:bg-emerald-600 transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">
                Fechado em {format(parseISO(month.closedAt), 'dd/MM/yy')}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 capitalize mb-4">{month.label}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hectares</p>
                <p className="font-bold text-slate-700 flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> {month.hectares.toLocaleString()} ha
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo</p>
                <p className={`font-bold ${month.netProfit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  R$ {month.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              VER DETALHES COMPLETOS
              <ChevronUp className="w-4 h-4 rotate-90" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes do Histórico */}
      {selectedMonth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="bg-slate-900 px-8 py-6 flex items-center justify-between text-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-600 p-2 rounded-xl"><FileText className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-2xl font-bold capitalize">Relatório: {selectedMonth.label}</h3>
                  <p className="text-slate-400 text-xs">ID do Fechamento: {selectedMonth.id}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedMonth(null); setIsConfirmingReopen(false); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-10 flex-1">
              {/* Resumo Financeiro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Hectares</p>
                  <p className="text-2xl font-black text-slate-800">{selectedMonth.hectares.toLocaleString()} ha</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Faturamento</p>
                  <p className="text-2xl font-black text-emerald-700">R$ {selectedMonth.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-600 uppercase mb-1">Custos Totais</p>
                  <p className="text-2xl font-black text-red-700">R$ {selectedMonth.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-5 bg-slate-900 rounded-2xl text-white">
                  <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Resultado Líquido</p>
                  <p className="text-2xl font-black text-emerald-400">R$ {selectedMonth.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Sócios */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  Divisão de Lucros Consolidada
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMonth.partnerSummaries.map((s, idx) => {
                    const total = s.netProfit + (s.salary || 0);
                    return (
                      <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.name}</p>
                          <p className={`text-2xl font-black ${total < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <div className="mt-1 flex gap-2">
                            {s.salary && <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">SALÁRIO INCLUSO</span>}
                            {s.deductions > 0 && <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">DEDUÇÃO DE {s.deductions.toLocaleString('pt-BR')}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lista de Serviços do Mês */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Serviços Executados no Período
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-3 text-left">Data</th>
                        <th className="px-6 py-3 text-left">Cliente/Área</th>
                        <th className="px-6 py-3 text-right">Hectares</th>
                        <th className="px-6 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedMonth.services.map(service => (
                        <tr key={service.id}>
                          <td className="px-6 py-4 text-slate-500">{format(parseISO(service.date), 'dd/MM')}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{service.clientName}</p>
                            <p className="text-xs text-slate-400">{service.areaName}</p>
                          </td>
                          <td className="px-6 py-4 text-right font-medium">{service.hectares} ha</td>
                          <td className="px-6 py-4 text-right font-black text-emerald-600">R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Rodapé com Botão de Reabertura */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400"> droneflow agriculture systems &copy; 2024</p>
              
              {!isConfirmingReopen ? (
                <button 
                  onClick={() => setIsConfirmingReopen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Revisar Mês
                </button>
              ) : (
                <div className="flex items-center gap-3 animate-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 text-amber-600 text-xs font-bold mr-2">
                    <AlertTriangle className="w-4 h-4" />
                    Abrir mês para edição?
                  </div>
                  <button 
                    onClick={handleReopen}
                    className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    Sim, Reabrir
                  </button>
                  <button 
                    onClick={() => setIsConfirmingReopen(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

export default HistoryView;
