import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Menu, Layout } from 'antd';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import './SiteLayout.css';

import { SECTION_IDS, NAV_SECTION_IDS, SECTION_LABELS } from './constants/navigation';
import AdultPlusInfo from './component/AdultPlusInfo';
import EducationPage from './component/EducationPage';
import FormationPage from './component/FormationPage';
import Blog from './component/Blog';
import BlogPost from './component/BlogPost';
import BlogEditor from './component/BlogEditor';
import LoginPage from './component/LoginPage';
import ProtectedRoute from './component/ProtectedRoute';
import EspaceParentAdo from './component/EspaceParentAdo';
import EspaceEnseignants from './component/EspaceEnseignants';
import InscriptionPage from './component/InscriptionPage';
import HomePage from './component/HomePage';
import SiteFooter from './component/SiteFooter';
import LandingPage from './component/LandingPage';
import AnalyticsTracker from './component/AnalyticsTracker';
import NotFoundPage from './component/NotFoundPage';

const { Header, Content, Footer } = Layout;

const HEADER_OFFSET = 64;

/** Redirige vers la page d'accueil avec ancre contact (pour les liens "Contact" depuis d'autres pages). */
function NavigateToHomeContact() {
  return <Navigate to="/#contact" replace />;
}

/** Libellé d'une section pour le menu / footer */
function getSectionLabel(section: string): string {
  return SECTION_LABELS[section] ?? section;
}

function getSectionHref(section: string): string {
  return section === 'blog' ? '/blog' : section === 'accueil' ? '/' : `/#${section}`;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('accueil');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.key]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 1100px)');
    const closeOnDesktop = () => { if (desktop.matches) setIsMobileMenuOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== '/') return;
      const scrollPos = window.scrollY + window.innerHeight / 3;
      for (const section of SECTION_IDS) {
        const el = document.getElementById(section);
        if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/') return;
    if (location.pathname.startsWith('/blog')) {
      setActiveSection('blog');
      return;
    }
    if (location.pathname.startsWith('/programmes') || location.pathname.startsWith('/adult-plus-info') || location.pathname.startsWith('/inscription')) {
      setActiveSection('programmes');
      return;
    }
    if (location.pathname.startsWith('/contact')) {
      setActiveSection('contact');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) window.scrollTo({ top: el.offsetTop - HEADER_OFFSET, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search, location.hash]);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      window.scrollTo({ top: el.offsetTop - HEADER_OFFSET, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  }, []);

  const handleNavClick = useCallback(
    (section: string) => {
      setIsMobileMenuOpen(false);
      if (section === 'blog') navigate('/blog');
      else if (location.pathname !== '/') navigate(section === 'accueil' ? '/' : `/#${section}`);
      else scrollToSection(section);
    },
    [location.pathname, navigate, scrollToSection]
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
        <AnalyticsTracker />
        {/* Fixed Header */}
        <Header className="site-header">
          <button
            type="button"
            className="site-header__brand"
            aria-label="Train and Dare Academy — Accueil"
            onClick={() => handleNavClick('accueil')}
          >
            <img 
            src='/logo T&D.pdf (2).svg'
            alt=''
            />
            <span className="site-header__wordmark">
    <span className="site-header__name">
      <span style={{ color: '#14532d' }}>Train</span>
      <span style={{ color: '#ff6b3d' }}>&nbsp;&amp;&nbsp;</span>
      <span style={{ color: '#14532d' }}>Dare</span>
      <span style={{ color: '#c47b16' }}> Academy</span>
    </span>
    <small>Entrepreneuriat • Mindset • Transformation</small>
  </span>
          </button>
          
          {/* Desktop Menu */}
          <Menu
            className="site-header__desktop-menu"
            theme="light"
            mode="horizontal"
            selectedKeys={[activeSection]}
            onClick={({ key }) => handleNavClick(String(key))}
            items={NAV_SECTION_IDS.map((section) => ({
              key: section,
              label: <a href={getSectionHref(section)} onClick={(event) => event.preventDefault()}>{getSectionLabel(section)}</a>,
            }))}
          />

          {/* Mobile Menu Button */}
          <Button
            ref={menuButtonRef}
            className="site-header__menu-toggle"
            type="text"
            icon={isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="site-mobile-menu"
            onClick={() => setIsMobileMenuOpen(open => !open)}
          />
        </Header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <nav id="site-mobile-menu" className="site-mobile-menu" aria-label="Navigation principale">
            {NAV_SECTION_IDS.map((section) => (
              <a
                key={section}
                href={getSectionHref(section)}
                onClick={(event) => { event.preventDefault(); handleNavClick(section); }}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  background: activeSection === section ? '#f0f0f0' : 'transparent',
                  fontWeight: activeSection === section ? 'bold' : 'normal',
                  color: activeSection === section ? '#14532d' : '#102218',
                }}
              >
                {getSectionLabel(section)}
              </a>
            ))}
          </nav>
        )}

        <Content style={{ marginTop: 64 }}>
          <Routes>
            {/* Main Home Page with all sections */}
            <Route 
              path="/" 
              element={<HomePage />} 
            />
            <Route path="/apropos" element={<Navigate to="/#apropos" replace />} />

            {/* Separate Pages for Programs */}
            <Route path="/programmes" element={<Navigate to="/#programmes" replace />} />
            <Route path="/programmes/education" element={<EducationPage />} />
            <Route path="/programmes/formation" element={<FormationPage />} />
            <Route path="/programmes/parent-ado" element={<EspaceParentAdo />} />
            <Route path="/programmes/enseignants" element={<EspaceEnseignants />} />
            <Route path="/inscription" element={<InscriptionPage />} />
            <Route path="/inscription/:programmeSlug" element={<InscriptionPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/landing/:campaign" element={<LandingPage />} />

            {/* Detail pages for "Plus d'info" buttons */}
            <Route path="/adult-plus-info" element={<AdultPlusInfo />} />

            {/* Blog routes */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/administrateur" element={<LoginPage />} />
            <Route path="/login" element={<Navigate to="/administrateur" replace />} />
            <Route path="/editeur" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
            <Route path="/blog/admin" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
            <Route path="/contact" element={<NavigateToHomeContact />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Content>

        {/* Footer */}
        <Footer style={{ 
          padding: 0,
          background: 'transparent',
        }}>
          <SiteFooter onSectionNavigate={handleNavClick} />
        </Footer>
    </Layout>
  );
};

export default App;
