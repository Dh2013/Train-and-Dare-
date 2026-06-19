import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface InscriptionPayload {
  programmeId: string;
  programmeSlug?: string;
  nom: string;
  email: string;
  trancheAge?: string;
  telephone?: string;
  message?: string;
}

export const inscriptionsApi = {
  submit: (data: InscriptionPayload) =>
    axios.post<{ status: string; id?: string }>(`${API_BASE}/inscriptions`, data),
};
