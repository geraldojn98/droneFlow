
import React from 'react';
import { X, CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Users } from 'lucide-react';
import { ServiceRecord, PartnerSummary } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface MonthClosingModalProps {
  onClose: () => void;
  onConfirm: () => void;
  data: {
    totalRev: number;
    totalExp: number;
    hectares: number;
    monthServices: ServiceRecord[];
    summaries: PartnerSummary[];
  };
}

const MonthClosingModal: React.FC<MonthClosingModalProps> = ({ onClose, onConfirm, data }) => {
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between text-white">
          <div>
            <h3 className="text-2xl font-bold">Fechamento Mensal</h3>
            <p className="text-slate-400 text-sm capitalize">{currentMonth}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Atenção</p>
              <p>O fechamento criará um registro permanente. Verifique se todos os serviços e custos foram lançados corretamente.</p>
            </div>
          </div>

          {/* Resumo Operacional */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Produção</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{data.hectares.toLocaleString()} ha</p>
              <p className="text-[10px] text-slate-400">{data.monthServices.length} serviços realizados</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Faturamento</span>
              </div>
              <p className="text-2xl font-black text-emerald-700">R$ {data.totalRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl text-white">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Lucro Líquido</span>
              </div>
              <p className="text-2xl font-black text-emerald-400">R$ {(data.totalRev - data.totalExp).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Crédito dos Sócios */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Crédito Individual dos Sócios
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.summaries.map((s, idx) => {
                const total = s.netProfit + (s.salary || 0);
                return (
                  <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{s.name}</p>
                      <p className={`text-lg font-black ${total < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {total < 0 && <span className="bg-red-100 text-red-700 text-[8px] font-black px-2 py-1 rounded">DÉBITO</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 px-6 border border-slate-300 rounded-2xl font-bold text-slate-600 hover:bg-white transition-colors"
          >
            Ainda não, revisar
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
          >
            Confirmar Fechamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthClosingModal;
