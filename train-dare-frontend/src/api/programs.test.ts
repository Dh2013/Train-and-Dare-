import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { programsApi } from './programs';

vi.mock('axios');

describe('programsApi', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
  });

  it('list() calls GET /api/programs', async () => {
    await programsApi.list();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/programs$/),
      undefined
    );
  });

  it('list(universSlug) calls GET with univers query', async () => {
    await programsApi.list('ado-preneur');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/programs'),
      { params: { univers: 'ado-preneur' } }
    );
  });

  it('get(id) calls GET /api/programs/:id', async () => {
    await programsApi.get('education-entrepreneuriat');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/programs\/education-entrepreneuriat$/)
    );
  });
});
