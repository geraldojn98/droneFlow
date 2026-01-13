
import { Client } from './types';

export const PARTNERS = [
  { name: 'Geraldo', fullName: 'Geraldo Júnior', role: 'Responsável Técnico' },
  { name: 'Kaká', fullName: 'Kaká Cardoso', role: 'Sócio/Cliente' },
  { name: 'Patrick', fullName: 'Patrick Brauner', role: 'Sócio/Cliente' },
  { name: 'Reserva', fullName: 'Fundo de Reserva', role: 'Institucional' }
];

export const PARTNER_SERVICE_RATE = 100; // R$ per hectare
export const GERALDO_SALARY = 5000; // R$ fixo mensal

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'p1',
    name: 'Kaká Cardoso',
    contact: '(64) 99999-1111',
    isPartner: true,
    partnerName: 'Kaká',
    areas: [{ id: 'a1', name: 'Fazenda Santa Luzia', hectares: 50 }]
  },
  {
    id: 'p2',
    name: 'Patrick Brauner',
    contact: '(64) 99999-2222',
    isPartner: true,
    partnerName: 'Patrick',
    areas: [{ id: 'a2', name: 'Sítio Novo Horizonte', hectares: 30 }]
  }
];
