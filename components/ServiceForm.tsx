
import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { Client, ApplicationType, ServiceRecord } from '../types';
import { PARTNER_SERVICE_RATE } from '../constants';

interface ServiceFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<ServiceRecord, 'id'>) => void;
  clients: Client[];
  initialData?: Partial<ServiceRecord>;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onClose, onSubmit, clients, initialData }) => {
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [selectedClientId, setSelectedClientId] = useState(initialData?.clientId || '');
  const [selectedAreaId, setSelectedAreaId] = useState(initialData?.areaId || '');
  const [hectares, setHectares] = useState(initialData?.hectares || 0);
  const [type, setType] = useState<ApplicationType>(initialData?.type || ApplicationType.PULVERIZACAO);
  const [unitPrice, setUnitPrice] = useState<number>(initialData?.unitPrice || 0);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedArea = selectedClient?.areas.find(a => a.id === selectedAreaId);

  // Updates hectares when area changes, but respect initialData if provided
  useEffect(() => {
    if (selectedArea && !initialData?.hectares) {
      setHectares(selectedArea.hectares);
    }
  }, [selectedArea, initialData]);

  // Identifies partner and sets rate, but respect initialData if provided
  useEffect(() => {
    if (selectedClient?.isPartner && !initialData?.unitPrice) {
      setUnitPrice(PARTNER_SERVICE_RATE);
    }
  }, [selectedClientId, selectedClient, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedArea) return;

    onSubmit({
      date,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      areaId: selectedArea.id,
      areaName: selectedArea.name,
      hectares,
      type,
      unitPrice,
      totalValue: hectares * unitPrice
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
          <h3 className="text-xl font-bold">
            {initialData ? 'Efetivar Planejamento' : 'Lançar Novo Serviço'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-emerald-500 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Data</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Tipo de Aplicação</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value as ApplicationType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={ApplicationType.PULVERIZACAO}>Pulverização</option>
                <option value={ApplicationType.DISPERSAO}>Dispersão de Sólidos</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Cliente</label>
            <select 
              required
              value={selectedClientId}
              onChange={e => {
                setSelectedClientId(e.target.value);
                setSelectedAreaId('');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Selecione o Cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.isPartner ? '(Sócio)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Área / Fazenda</label>
            <select 
              required
              disabled={!selectedClientId}
              value={selectedAreaId}
              onChange={e => setSelectedAreaId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
            >
              <option value="">Selecione a Área</option>
              {selectedClient?.areas.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.hectares} ha)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Hectares</label>
              <input 
                type="number" 
                step="0.1"
                required
                value={hectares || ''}
                onChange={e => setHectares(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Valor Unitário (R$/ha)</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={unitPrice || ''}
                onChange={e => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700" 
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Calculator className="w-5 h-5" />
              <span className="text-sm font-medium">Total Calculado:</span>
            </div>
            <span className="text-xl font-bold text-slate-800">
              R$ {(hectares * unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg active:scale-[0.98]"
            >
              {initialData ? 'Confirmar Execução' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
