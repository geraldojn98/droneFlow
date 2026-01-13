import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Map, UserPlus, AlertCircle, Phone, Edit2, Shield, ChevronRight, Search } from 'lucide-react';
import { Client, Area } from '../types';

interface ClientManagerProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const ClientManager: React.FC<ClientManagerProps> = ({ clients, setClients }) => {
  // --- ESTADOS ---
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [isNewClientPartner, setIsNewClientPartner] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showAddArea, setShowAddArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaHectares, setNewAreaHectares] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // --- LÓGICA ---
  const formatPhone = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 3) return phoneNumber;
    if (phoneNumberLength < 8) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const filteredClients = useMemo(() => {
    return clients
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, searchTerm]);

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId), 
  [clients, selectedClientId]);

  // --- AÇÕES ---
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientContact.trim()) {
      setError("Nome e Contato são obrigatórios.");
      return;
    }
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClientName,
      contact: newClientContact,
      isPartner: isNewClientPartner,
      areas: []
    };
    setClients(prev => [...prev, newClient]);
    setNewClientName('');
    setNewClientContact('');
    setIsNewClientPartner(false);
    setError(null);
    setSelectedClientId(newClient.id); // Abre o novo cliente automaticamente
  };

  const handleEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setClients(prev => prev.map(c => c.id === editingClient.id ? editingClient : c));
    setEditingClient(null);
  };

  const handleAddArea = () => {
    if (!selectedClientId || !newAreaName.trim() || newAreaHectares <= 0) return;
    const newArea: Area = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAreaName,
      hectares: newAreaHectares
    };
    setClients(prev => prev.map(c => 
      c.id === selectedClientId ? { ...c, areas: [...c.areas, newArea] } : c
    ));
    setNewAreaName('');
    setNewAreaHectares(0);
    setShowAddArea(false);
  };

  const removeArea = (areaId: string) => {
    setClients(prev => prev.map(c => 
      c.id === selectedClientId ? { ...c, areas: c.areas.filter(a => a.id !== areaId) } : c
    ));
  };

  const removeClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setClientToDelete(null);
    setSelectedClientId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
      
      {/* COLUNA ESQUERDA: LISTA DE CLIENTES */}
      <div className="w-full lg:w-80 flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredClients.map(client => (
            <button
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                selectedClientId === client.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="text-left overflow-hidden">
                <p className={`font-black text-sm truncate ${selectedClientId === client.id ? 'text-white' : 'text-slate-800'}`}>
                  {client.name}
                </p>
                <p className={`text-[10px] font-bold opacity-70 ${selectedClientId === client.id ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {client.areas.length} talhões
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${selectedClientId === client.id ? 'text-white' : 'text-slate-300'}`} />
            </button>
          ))}
          
          {/* BOTÃO NOVO CLIENTE NA LISTA */}
          <button 
            onClick={() => { setSelectedClientId(null); setShowAddArea(false); }}
            className="w-full mt-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black uppercase hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        </div>
      </div>

      {/* COLUNA DIREITA: DETALHES OU CADASTRO */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-y-auto custom-scrollbar">
        {selectedClient ? (
          <div className="p-8">
            {/* Cabeçalho do Cliente Selecionado */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedClient.name}</h2>
                  {selectedClient.isPartner && (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Sócio
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-slate-500 font-bold">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-emerald-500" /> {selectedClient.contact}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingClient(selectedClient)} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => setClientToDelete(selectedClient.id)} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Listagem de Talhões */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Map className="w-4 h-4" /> Áreas & Talhões Cadastrados
                </h3>
                <button 
                  onClick={() => setShowAddArea(true)}
                  className="text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Adicionar Talhão
                </button>
              </div>

              {showAddArea && (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                  <input type="text" placeholder="Nome do Talhão" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} className="md:col-span-1 p-3 bg-white border border-emerald-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                  <input type="number" placeholder="Hectares (ha)" value={newAreaHectares || ''} onChange={e => setNewAreaHectares(Number(e.target.value))} className="p-3 bg-white border border-emerald-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                  <div className="flex gap-2">
                    <button onClick={handleAddArea} className="flex-1 bg-emerald-600 text-white font-black text-xs uppercase rounded-xl">Salvar</button>
                    <button onClick={() => setShowAddArea(false)} className="px-4 bg-white text-slate-400 font-black rounded-xl border border-emerald-200">X</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedClient.areas.map(area => (
                  <div key={area.id} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-emerald-200 transition-all">
                    <div>
                      <p className="font-black text-slate-800">{area.name}</p>
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{area.hectares} Hectares</p>
                    </div>
                    <button onClick={() => removeArea(area.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedClient.areas.length === 0 && !showAddArea && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-slate-400 font-bold text-sm">Nenhum talhão cadastrado para este cliente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* TELA DE NOVO CLIENTE (Quando nenhum está selecionado) */
          <div className="p-8 max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Novo Cliente</h2>
              <p className="text-slate-500 font-bold">Cadastre uma nova fazenda ou produtor na sua base.</p>
            </div>

            <form onSubmit={handleAddClient} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Cliente / Fazenda</label>
                  <input 
                    type="text" 
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    placeholder="Ex: Fazenda Santa Maria"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone de Contato</label>
                  <input 
                    type="text" 
                    value={newClientContact}
                    maxLength={15}
                    onChange={e => setNewClientContact(formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-800">Sócio DroneFlow?</p>
                  <p className="text-xs font-bold text-slate-500">Marque se este cliente tiver contrato de parceria.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isNewClientPartner} onChange={e => setIsNewClientPartner(e.target.checked)} className="sr-only peer" />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {error && <p className="text-red-600 text-[10px] font-black uppercase text-center flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}

              <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]">
                Cadastrar e Continuar
              </button>
            </form>
          </div>
        )}
      </div>

      {/* OVERLAY DE DELEÇÃO (CLIENTE) */}
      {clientToDelete && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">Excluir tudo?</h3>
            <p className="text-slate-500 font-bold text-sm mb-6">Isso apagará permanentemente o cliente e todos os seus talhões registrados.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => removeClient(clientToDelete)} className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Sim, Apagar Tudo</button>
              <button onClick={() => setClientToDelete(null)} className="py-4 text-slate-400 font-black uppercase tracking-widest text-xs">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {editingClient && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tighter">Editar Cadastro</h3>
              <button onClick={() => setEditingClient(null)} className="p-2 hover:bg-white/10 rounded-full">X</button>
            </div>
            <form onSubmit={handleEditClient} className="p-8 space-y-4">
              <input type="text" value={editingClient.name} onChange={e => setEditingClient({...editingClient, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              <input type="text" value={editingClient.contact} onChange={e => setEditingClient({...editingClient, contact: formatPhone(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                <input type="checkbox" checked={editingClient.isPartner} onChange={e => setEditingClient({...editingClient, isPartner: e.target.checked})} className="w-5 h-5 rounded text-emerald-600" />
                <span className="font-bold text-slate-700">Sócio DroneFlow</span>
              </label>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;