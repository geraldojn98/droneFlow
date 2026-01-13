
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Receipt, Search, ShieldCheck, Info, ArrowDownCircle, TrendingDown } from 'lucide-react';
// Fix: Import parseISO from its specific subpaths
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { startOfMonth } from 'date-fns/startOfMonth';
import { endOfMonth } from 'date-fns/endOfMonth';
import { isWithinInterval } from 'date-fns';
import { Expense } from '../types';
import { GERALDO_SALARY } from '../constants';

interface ExpenseManagerProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ expenses, setExpenses }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [cat, setCat] = useState('Combustível');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const activeExpenses = useMemo(() => {
    return expenses.filter(e => !e.closed);
  }, [expenses]);

  const totalActiveExpenses = useMemo(() => {
    return activeExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [activeExpenses]);

  const filteredExpenses = useMemo(() => {
    if (!searchTerm.trim()) return expenses;
    const term = searchTerm.toLowerCase();
    return expenses.filter(e => 
      e.description.toLowerCase().includes(term) || 
      e.category.toLowerCase().includes(term)
    );
  }, [expenses, searchTerm]);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || amount <= 0) return;

    const newExp: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: desc,
      amount,
      category: cat,
      date,
      closed: false
    };

    setExpenses([newExp, ...expenses]);
    setDesc('');
    setAmount(0);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const categories = ['Combustível', 'Manutenção Drone', 'Produtos', 'Logística', 'Marketing', 'Impostos', 'Diversos'];

  return (
    <div className="space-y-6">
      {/* Resumo de Custos do Ciclo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Compromisso Mensal Fixo</span>
              </div>
              <h3 className="text-2xl font-bold">Salário Geraldo Júnior</h3>
              <p className="text-slate-400 text-sm mt-1">Remuneração do Responsável Técnico (Operacional/Financeiro)</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center md:text-right">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Valor Mensal</p>
              <p className="text-3xl font-black text-emerald-400">R$ {GERALDO_SALARY.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 font-bold bg-white/5 p-2 rounded-lg inline-flex">
            <Info className="w-3 h-3" />
            ESTE VALOR É DEDUZIDO AUTOMATICAMENTE DO SALDO DA EMPRESA TODOS OS MESES.
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <TrendingDown className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Variáveis do Ciclo</span>
            </div>
            <p className="text-sm text-slate-500">Total acumulado de gastos variáveis em aberto no mês.</p>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-red-600">R$ {totalActiveExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{activeExpenses.length} Lançamentos pendentes</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-500" />
          Novo Gasto Variável
        </h3>
        <form onSubmit={addExpense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Óleo motor caminhonete"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
            <select 
              value={cat}
              onChange={e => setCat(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Valor do Gasto (R$)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={amount || ''}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-red-600 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button 
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold h-[38px] flex items-center gap-2 hover:bg-red-700 transition-colors shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Lançar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h4 className="font-bold text-slate-800 hidden sm:block">Histórico de Gastos</h4>
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar gasto ou categoria..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-full text-xs outline-none focus:ring-1 focus:ring-emerald-500 w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Data</th>
                <th className="px-6 py-3 font-semibold">Descrição</th>
                <th className="px-6 py-3 font-semibold">Categoria</th>
                <th className="px-6 py-3 font-semibold text-right">Valor do Gasto</th>
                <th className="px-6 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className={`hover:bg-slate-50 transition-colors ${exp.closed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {format(parseISO(exp.date), 'dd/MM/yyyy')}
                    {exp.closed && <span className="ml-2 text-[8px] font-bold bg-slate-200 text-slate-600 px-1 py-0.5 rounded uppercase">Fechado</span>}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{exp.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase whitespace-nowrap">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-red-600">
                    - R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!exp.closed && (
                      <button 
                        onClick={() => removeExpense(exp.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Remover Gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    {searchTerm ? 'Nenhum gasto correspondente à busca.' : 'Nenhum custo variável registrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;
