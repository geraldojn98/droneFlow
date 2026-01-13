
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Map, UserPlus, XCircle, AlertCircle, Check, X, Phone, Edit2, Shield } from 'lucide-react';
import { Client, Area } from '../types';

interface ClientManagerProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const ClientManager: React.FC<ClientManagerProps> = ({ clients, setClients }) => {
  // Máscara de Telefone
  const formatPhone = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 3) return phoneNumber;
    if (phoneNumberLength < 8) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  // Estados para novo cliente
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [isNewClientPartner, setIsNewClientPartner] = useState(false);

  // Estados para edição
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Estados para áreas e deleção
  const [showAddArea, setShowAddArea] = useState<string | null>(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaHectares, setNewAreaHectares] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);

  // Ordenação Alfabética
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

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
  };

  const handleEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    if (!editingClient.name.trim() || !editingClient.contact.trim()) {
      setError("Nome e Contato são obrigatórios.");
      return;
    }

    setClients(prev => prev.map(c => 
      c.id === editingClient.id ? editingClient : c
    ));
    setEditingClient(null);
    setError(null);
  };

  const handleAddArea = (clientId: string) => {
    if (!newAreaName.trim()) {
      setError("Dê um nome para a área.");
      return;
    }
    if (newAreaHectares <= 0) {
      setError("Informe o número de hectares.");
      return;
    }

    const newArea: Area = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAreaName,
      hectares: newAreaHectares
    };

    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, areas: [...c.areas, newArea] } : c
    ));

    setNewAreaName('');
    setNewAreaHectares(0);
    setShowAddArea(null);
    setError(null);
  };

  const confirmRemoveClient = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setClients(prev => prev.filter(c => c.id !== id));
    setClientToDelete(null);
  };

  const confirmRemoveArea = (e: React.MouseEvent, clientId: string, areaId: string) => {
    e.stopPropagation();
    setClients(prev => prev.map(c => 
      c.id === clientId 
        ? { ...c, areas: c.areas.filter(a => a.id !== areaId) } 
        : c
    ));
    setAreaToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Cadastro de Novo Cliente */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-emerald-500" />
          Novo Registro de Cliente
        </h3>
        <form onSubmit={handleAddClient} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Cliente</label>
              <input 
                type="text" 
                placeholder="Ex: Fazenda Boa Esperança"
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contato / Telefone</label>
              <input 
                type="text" 
                placeholder="(00) 00000-0000"
                value={newClientContact}
                maxLength={15}
                onChange={e => setNewClientContact(formatPhone(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vínculo</label>
                <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={isNewClientPartner}
                    onChange={e => setIsNewClientPartner(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-sm font-bold text-slate-700">Sócio DroneFlow</span>
                </label>
              </div>
              <button 
                type="submit"
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 mt-5"
              >
                Cadastrar
              </button>
            </div>
          </div>
          {error && !editingClient && (
            <p className="text-red-600 text-[10px] font-black uppercase flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </p>
          )}
        </form>
      </div>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedClients.map(client => (
          <div key={client.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-full min-h-[200px] hover:border-emerald-300 transition-colors">
            
            {/* Overlay de Confirmação de Exclusão */}
            {clientToDelete === client.id && (
              <div className="absolute inset-0 z-20 bg-red-600/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in duration-200">
                <AlertCircle className="w-12 h-12 mb-2" />
                <h4 className="text-xl font-black mb-1">Excluir Cliente?</h4>
                <p className="text-sm font-medium opacity-90 mb-6">Toda a base de áreas de {client.name} será apagada.</p>
                <div className="flex gap-3 w-full max-w-xs">
                  <button onClick={(e) => confirmRemoveClient(e, client.id)} className="flex-1 bg-white text-red-600 py-3 rounded-xl font-black text-xs uppercase">Sim, Excluir</button>
                  <button onClick={() => setClientToDelete(null)} className="flex-1 bg-red-800 text-white py-3 rounded-xl font-black text-xs uppercase">Cancelar</button>
                </div>
              </div>
            )}

            {client.isPartner && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-xl z-10 uppercase tracking-widest flex items-center gap-1">
                <Shield className="w-3 h-3" /> Sócio
              </div>
            )}
            
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="pr-20">
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{client.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <p className="text-xs font-bold text-slate-500">{client.contact}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingClient(client)} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Editar Cliente">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setClientToDelete(client.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Excluir Cliente">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Áreas do Cliente */}
              <div className="space-y-2 mb-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Map className="w-3 h-3" /> Talhões ({client.areas.length})
                </h4>
                {client.areas.map(area => (
                  <div key={area.id} className="group relative flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:bg-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{area.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{area.hectares} ha</p>
                    </div>

                    {areaToDelete === area.id ? (
                      <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                        <button onClick={(e) => confirmRemoveArea(e, client.id, area.id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">Confirmar</button>
                        <button onClick={() => setAreaToDelete(null)} className="bg-slate-200 text-slate-600 p-1.5 rounded-lg"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setAreaToDelete(area.id)} className="p-1.5 text-slate-300 hover:text-red-600 transition-all"><XCircle className="w-5 h-5" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Adicionar Nova Área */}
            <div className="mt-auto p-6 pt-0">
              {showAddArea === client.id ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Novo Talhão</h5>
                    <button onClick={() => setShowAddArea(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3">
                    <input type="text" placeholder="Nome do Talhão" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                    <div className="flex gap-2">
                      <input type="number" step="0.01" placeholder="ha" value={newAreaHectares || ''} onChange={e => setNewAreaHectares(Number(e.target.value))} className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                      <button onClick={() => handleAddArea(client.id)} className="flex-1 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase hover:bg-emerald-700 transition-all">Salvar</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setShowAddArea(client.id); setError(null); }} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black uppercase hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 group tracking-widest">
                  <Plus className="w-4 h-4" /> Cadastrar Talhão
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição de Cliente */}
      {editingClient && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-8 text-white relative">
              <h3 className="text-2xl font-black tracking-tight uppercase">Editar Cliente</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Atualização Cadastral</p>
              <button onClick={() => setEditingClient(null)} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleEditClient} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  value={editingClient.name} 
                  onChange={e => setEditingClient({...editingClient, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contato / Telefone</label>
                <input 
                  type="text" 
                  required 
                  value={editingClient.contact} 
                  maxLength={15}
                  onChange={e => setEditingClient({...editingClient, contact: formatPhone(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vínculo de Negócio</label>
                <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={editingClient.isPartner}
                    onChange={e => setEditingClient({...editingClient, isPartner: e.target.checked})}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-sm font-bold text-slate-700">Sócio DroneFlow</span>
                </label>
              </div>

              {error && editingClient && (
                <p className="text-red-600 text-[10px] font-black uppercase text-center">{error}</p>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98] mt-2"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
