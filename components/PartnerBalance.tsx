
import React from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, ShieldCheck, Briefcase } from 'lucide-react';
import { PartnerSummary } from '../types';

interface PartnerBalanceProps {
  summaries: PartnerSummary[];
}

const PartnerBalance: React.FC<PartnerBalanceProps> = ({ summaries }) => {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold opacity-80 mb-2">Partilha Mensal de Lucros</h3>
          <p className="text-3xl font-black mb-6">Regra de Divisão: 25% por cota</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <p className="text-xs font-bold uppercase opacity-60 mb-1">Cota Geraldo</p>
              <p className="text-lg font-bold">25,0%</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <p className="text-xs font-bold uppercase opacity-60 mb-1">Cota Kaká</p>
              <p className="text-lg font-bold">25,0%</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <p className="text-xs font-bold uppercase opacity-60 mb-1">Cota Patrick</p>
              <p className="text-lg font-bold">25,0%</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <p className="text-xs font-bold uppercase opacity-60 mb-1">Fundo Reserva</p>
              <p className="text-lg font-bold">25,0%</p>
            </div>
          </div>
        </div>
        <ShieldCheck className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summaries.map((s, idx) => {
          const totalToReceive = s.netProfit + (s.salary || 0);
          
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${s.name.includes('Reserva') ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">{s.name}</h4>
                </div>
                <span className="text-xs font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">Cota 25%</span>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
                    Participação nos Lucros (25%)
                  </span>
                  <span className="font-bold text-slate-700">R$ {s.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                {s.salary && (
                  <div className="flex justify-between items-center text-sm bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <span className="text-emerald-700 flex items-center gap-2 font-medium">
                      <Briefcase className="w-4 h-4" />
                      Salário Fixo (Resp. Técnico)
                    </span>
                    <span className="font-bold text-emerald-700">R$ {s.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {s.deductions > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4 text-red-500" />
                      Dedução Serviços (R$ 100/ha)
                    </span>
                    <span className="font-bold text-red-600">- R$ {s.deductions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {s.salary ? 'Total Geral a Receber' : 'Saldo Líquido a Receber'}
                    </p>
                    <p className={`text-2xl font-black ${totalToReceive < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      R$ {totalToReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {totalToReceive < 0 && (
                    <div className="bg-red-50 text-red-700 text-[10px] font-black px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-1">
                      APORTE NECESSÁRIO
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerBalance;
