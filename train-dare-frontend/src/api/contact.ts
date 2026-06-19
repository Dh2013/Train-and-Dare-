import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/** Payload pour le formulaire de contact */
export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

/**
 * Envoie un message de contact au backend.
 * @returns Promise résolue en cas de succès, rejetée avec le message d'erreur sinon
 */
export const contactApi = {
  send: (data: ContactPayload) =>
    axios.post<{ status: string }>(`${API_BASE}/contact`, data),
};
