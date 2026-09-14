import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import SiteFooter from './SiteFooter';
import { sanitizeHtml } from '../lib/sanitizeHtml';

vi.mock('../context/useAuth', () => ({ useAuth: () => ({ login: vi.fn() }) }));
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('associates visible login labels with the username and password fields', () => {
  render(<MemoryRouter><LoginPage /></MemoryRouter>);
  expect(screen.getByLabelText('Identifiant')).toHaveAttribute('autocomplete', 'username');
  expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
});
it('associates the newsletter label with its email field', () => {
  render(<MemoryRouter><SiteFooter onSectionNavigate={() => {}} /></MemoryRouter>);
  expect(screen.getByLabelText('Adresse e-mail').tagName).toBe('INPUT');
});
it('retains editorial markup while stripping executable HTML after the sanitizer update', () => {
  const html = sanitizeHtml('<h2>Titre</h2><p><strong>Texte</strong><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">Lien</a><script>alert(1)</script></p>');
  expect(html).toContain('<h2>Titre</h2>');
  expect(html).toContain('<strong>Texte</strong>');
  expect(html).not.toMatch(/onerror|javascript:|<script/i);
});
