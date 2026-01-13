import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Users, DollarSign, Plus, 
  TrendingUp, Droplets, History, Menu, X, LogOut, AlertCircle, 
  ClipboardList, User as UserIcon
} from 'lucide-react';
import { format, endOfMonth, isWithinInterval, endOfYear, differenceInMonths } from 'date-fns';
import { startOfMonth } from 'date-fns/startOfMonth';
import { parseISO } from 'date-fns/parseISO';
import { startOfYear } from 'date-fns/startOfYear';
import { ptBR } from 'date-fns/locale/pt-BR';

// Importação da conexão
import { supabase } from './lib/supabase';

import { 
  Client, ServiceRecord, Expense, PartnerSummary, DashboardStats, 
  ClosedMonth, User, AgendaItem
} from './types';
import { INITIAL_CLIENTS, PARTNER_SERVICE_RATE, PARTNERS, GERALDO_SALARY } from './constants';

// Seus Componentes Originais
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import ClientManager from './components/ClientManager';
import ExpenseManager from './components/ExpenseManager';
import ServiceForm from './components/ServiceForm';
import PartnerBalance from './components/PartnerBalance';
import HistoryView from './components/HistoryView';
import MonthClosingModal from './components/MonthClosingModal';
import AuthScreen from './components/AuthScreen';
import AgendaView from './components/AgendaView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('df_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'calendar' | 'clients' | 'expenses' | 'partners' | 'history'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [prefilledServiceData, setPrefilledServiceData] = useState<Partial<ServiceRecord> | null>(null);
  const [sourceAgendaId, setSourceAgendaId] = useState<string | null>(null);

  // Estados dos Dados
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [closedMonths, setClosedMonths] = useState<ClosedMonth[]>([]);

  // CARREGAR DADOS DO SUPABASE
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const { data: s } = await supabase.from('services').select('*');
        const { data: e } = await supabase.from('expenses').select('*');
        const { data: a } = await supabase.from('agenda').select('*');
        const { data: c } = await supabase.from('clients').select('*');

        if (s) setServices(s);
        if (e) setExpenses(e);
        if (a) setAgenda(a);
        if (c && c.length > 0) setClients(c);
      };
      fetchData();
    }
  }, [user]);

  // FUNÇÕES DE SALVAMENTO AUTOMÁTICO
  const handleSetClients = async (updater: any) => {
    const nextValue = typeof updater === 'function' ? updater(clients) : updater;
    setClients(nextValue);
    await supabase.from('clients').upsert(nextValue);
  };

  const handleSetExpenses = async (updater: any) => {
    const nextValue = typeof updater === 'function' ? updater(expenses) : updater;
    setExpenses(nextValue);
    await supabase.from('expenses').upsert(nextValue);
  };

  const handleSetAgenda = async (updater: any) => {
    const nextValue = typeof updater === 'function' ? updater(agenda) : updater;
    setAgenda(nextValue);
    await supabase.from('agenda').upsert(nextValue);
  };

  // LOGICA DE CALCULO
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);
    
    const monthServices = services.filter(s => !s.closed && isWithinInterval(parseISO(s.date), { start: mStart, end: mEnd }));
    const monthExpenses = expenses.filter(e => !e.closed && isWithinInterval(parseISO(e.date), { start: mStart, end: mEnd }));
    
    const totalRev = monthServices.reduce((acc, s) => acc + s.totalValue, 0);
    const totalExp = monthExpenses.reduce((acc, e) => acc + e.amount, 0) + GERALDO_SALARY;
    const hectares = monthServices.reduce((acc, s) => acc + s.hectares, 0);

    const summaries: PartnerSummary[] = PARTNERS.map(p => {
      let deductions = 0;
      if (p.name === 'Kaká' || p.name === 'Patrick') {
        const partnerClient = clients.find(c => c.partnerName === p.name);
        if (partnerClient) {
          const pServices = monthServices.filter(s => s.clientId === partnerClient.id);
          deductions = pServices.reduce((acc, s) => acc + (s.hectares * PARTNER_SERVICE_RATE), 0);
        }
      }
      const netProfit = (totalRev - totalExp) / 4;
      return {
        name: p.fullName,
        grossProfit: (totalRev - totalExp) / 4,
        deductions: deductions,
        netProfit: netProfit - deductions,
        salary: p.name === 'Geraldo' ? GERALDO_SALARY : undefined
      };
    });

    return { totalRev, totalExp, hectares, monthServices, monthExpenses, summaries };
  }, [services, expenses, clients]);

  const stats = useMemo((): DashboardStats => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearServices = services.filter(s => isWithinInterval(parseISO(s.date), { start: yearStart, end: endOfYear(now) }));
    const yearExpenses = expenses.filter(e => isWithinInterval(parseISO(e.date), { start: yearStart, end: endOfYear(now) }));
    const monthsPassed = differenceInMonths(now, yearStart) + 1;
    
    return {
      hectaresMonth: currentMonthData.hectares,
      hectaresYear: yearServices.reduce((acc, s) => acc + s.hectares, 0),
      balanceMonth: currentMonthData.totalRev - currentMonthData.totalExp,
      balanceYear: yearServices.reduce((acc, s) => acc + s.totalValue, 0) - (yearExpenses.reduce((acc, e) => acc + e.amount, 0) + (GERALDO_SALARY * monthsPassed)),
      bankBalance: 0 
    };
  }, [services, expenses, currentMonthData]);

  // FUNÇÕES DE MANIPULAÇÃO
  const handleServiceSubmit = async (data: Omit<ServiceRecord, 'id'>) => {
    const newService = { ...data, id: Math.random().toString(36).substr(2, 9) };
    const { error } = await supabase.from('services').insert([newService]);
    
    if (!error) {
      setServices(prev => [...prev, newService]);
      if (sourceAgendaId) {
        await supabase.from('agenda').delete().eq('id', sourceAgendaId);
        setAgenda(prev => prev.filter(item => item.id !== sourceAgendaId));
      }
      setIsServiceFormOpen(false);
    } else {
      alert("Erro ao salvar serviço: " + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('df_user');
    setUser(null);
    setIsLogoutConfirmOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda de Campo', icon: ClipboardList },
    { id: 'calendar', label: 'Calendário de Serviços', icon: CalendarIcon },
    { id: 'clients', label: 'Clientes & Áreas', icon: Users },
    { id: 'expenses', label: 'Custos/Gastos', icon: DollarSign },
    { id: 'partners', label: 'Sócios & Lucros', icon: TrendingUp },
    { id: 'history', label: 'Histórico Mensal', icon: History },
  ];

  if (!user) return <AuthScreen onLogin={(u) => { localStorage.setItem('df_user', JSON.stringify(u)); setUser(u); }} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}/>}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500 p-2 rounded-lg"><Droplets className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-black tracking-tight uppercase">DroneFlow</h1>
          </div>
          
          <nav className="space-y-1 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6">
            <div className="p-4 bg-slate-800 rounded-2xl flex items-center gap-3 mb-2">
              <UserIcon className="w-6 h-6 text-emerald-500" />
              <div className="overflow-hidden"><p className="text-sm font-black truncate">{user.name}</p></div>
            </div>
            <button onClick={() => setIsLogoutConfirmOpen(true)} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 font-bold text-sm">
              <LogOut className="w-5 h-5" /> Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600"><Menu className="w-6 h-6" /></button>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          <button onClick={() => setIsServiceFormOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-black shadow-md text-sm">
            <Plus className="w-5 h-5" /><span>Lançar Serviço</span>
          </button>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && <Dashboard stats={stats} services={services} expenses={expenses} />}
          {activeTab === 'agenda' && <AgendaView agenda={agenda} setAgenda={handleSetAgenda} clients={clients} user={user} onEfetivar={(item) => { setSourceAgendaId(item.id); setPrefilledServiceData(item); setIsServiceFormOpen(true); }} />}
          {activeTab === 'calendar' && <CalendarView services={services} onOpenClosing={() => setIsClosingModalOpen(true)} onDeleteService={(id) => setServices(services.filter(s => s.id !== id))} />}
          {activeTab === 'clients' && <ClientManager clients={clients} setClients={handleSetClients} />}
          {activeTab === 'expenses' && <ExpenseManager expenses={expenses} setExpenses={handleSetExpenses} />}
          {activeTab === 'partners' && <PartnerBalance summaries={currentMonthData.summaries} />}
          {activeTab === 'history' && <HistoryView closedMonths={closedMonths} onReopenMonth={() => {}} />}
        </div>
      </main>

      {isServiceFormOpen && (
        <ServiceForm 
          onClose={() => setIsServiceFormOpen(false)} 
          onSubmit={handleServiceSubmit} 
          clients={clients} 
          initialData={prefilledServiceData || undefined}
        />
      )}

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-black mb-4">Sair agora?</h3>
              <button onClick={handleLogout} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black mb-2">Sim, Sair</button>
              <button onClick={() => setIsLogoutConfirmOpen(false)} className="w-full py-2 text-slate-500 font-bold">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;