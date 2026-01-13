import React from 'react';
import { X, CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Users, Lock, RotateCcw } from 'lucide-react';
import { ServiceRecord, PartnerSummary, ClosedMonth } from '../types';

interface MonthClosingModalProps {
  onClose: () => void;
  onConfirm: () => void;
  onReopen?: (monthYear: string) => void;
  isAlreadyClosed: boolean;
  closedMonthData?: ClosedMonth;
  data: {
    totalRev: number;
    totalExp: number;
    hectares: number;
    monthServices: ServiceRecord[];
    summaries: PartnerSummary[];
    label: string;
    monthYear: string;
  };
}

const MonthClosingModal: React.FC<MonthClosingModalProps> = ({ onClose, onConfirm, onReopen, isAlreadyClosed, closedMonthData, data }) => {
  const displayData = isAlreadyClosed && closedMonthData ? {
    totalRev: closedMonthData.totalRevenue,
    totalExp: closedMonthData.totalExpenses,
    hectares: closedMonthData.hectares,
    summaries: closedMonthData.partnerSummaries,
    label: closedMonthData.label,
    servicesCount: closedMonthData.services.length
  } : {
    totalRev: data.totalRev,
    totalExp: data.totalExp,
    hectares: data.hectares,
    summaries: data.summaries,
    label: data.label,
    servicesCount: data.monthServices.length
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`${isAlreadyClosed ? 'bg-red-600' : 'bg-slate-900'} px-8 py-6 flex items-center justify-between text-white`}>
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {isAlreadyClosed ? <Lock className="w-6 h-6" /> : 'Fechamento Mensal'}
            </h3>
            <p className="text-white/60 text-sm capitalize">{displayData.label}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          <div className={`${isAlreadyClosed ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-amber-50 border-amber-200 text-amber-800'} p-4 rounded-xl flex gap-3`}>
            {isAlreadyClosed ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            <div className="text-sm">
              <p className="font-bold">{isAlreadyClosed ? 'Mês Consolidado' : 'Atenção'}</p>
              <p>{isAlreadyClosed ? `Este mês foi fechado em ${new Date(closedMonthData?.closedAt || '').toLocaleDateString()}.` : 'O fechamento criará um registro permanente. Verifique todos os lançamentos.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <TrendingUp className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Produção</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{displayData.hectares.toLocaleString()} ha</p>
              <p className="text-[10px] text-slate-400">{displayData.servicesCount} serviços</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <DollarSign className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Faturamento</span>
              </div>
              <p className="text-2xl font-black text-emerald-700">R$ {displayData.totalRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className={`p-4 rounded-2xl text-white ${isAlreadyClosed ? 'bg-red-600' : 'bg-slate-900'}`}>
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Lucro Líquido</span>
              </div>
              <p className="text-2xl font-black text-emerald-400">R$ {(displayData.totalRev - displayData.totalExp).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-500" /> Crédito dos Sócios</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayData.summaries.map((s, idx) => {
                const total = s.netProfit + (s.salary || 0);
                return (
                  <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{s.name}</p>
                      <p className={`text-lg font-black ${total < 0 ? 'text-red-600' : 'text-emerald-700'}`}>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
          {isAlreadyClosed ? (
            <button 
              onClick={() => onReopen && onReopen(data.monthYear)}
              className="flex-1 py-4 px-6 bg-white border-2 border-red-600 text-red-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
            >
              <RotateCcw className="w-5 h-5" /> Reabrir Mês para Edição
            </button>
          ) : (
            <>
              <button onClick={onClose} className="flex-1 py-4 px-6 border border-slate-300 rounded-2xl font-bold text-slate-600">Revisar</button>
              <button onClick={onConfirm} className="flex-1 py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all">Confirmar Fechamento</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthClosingModal;