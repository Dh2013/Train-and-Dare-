import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Programme {
  id: string;
  slug: string;
  titre: string;
  public: string;
  duree: string;
  objectifs: string[];
  lienInscription: string;
}

export interface Univers {
  id: string;
  slug: string;
  titre: string;
  sousTitre: string;
  description: string;
  programmes: Programme[];
}

export const programsApi = {
  /** Liste tous les univers (et leurs programmes) ou un seul si univers=slug */
  list: (universSlug?: string) =>
    axios.get<Univers[]>(`${API_BASE}/programs`, universSlug ? { params: { univers: universSlug } } : undefined),
  /** Détail d'un univers ou d'un programme par id/slug */
  get: (idOrSlug: string) => axios.get<Univers | (Programme & { univers?: { id: string; slug: string; titre: string } })>(`${API_BASE}/programs/${idOrSlug}`),
};
