import React, { useState, useEffect, useCallback } from 'react';
import { Button, Menu, Layout } from 'antd';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';

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

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('accueil');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      window.scrollTo({ top: el.offsetTop - HEADER_OFFSET, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  }, []);

  const handleNavClick = useCallback(
    (section: string) => {
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
        <Header
          style={{
            position: 'fixed',
            zIndex: 1000,
            width: '100%',
            background: 'rgba(255,252,247,0.88)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            boxShadow: '0 10px 34px rgba(16,34,24,0.08)',
            
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
            onClick={() => handleNavClick('accueil')}
            >
            <img 
            src='/logo T&D.pdf (2).svg'
            alt='Train and Dare '
            style={{ width: 44, height: 44, objectFit: 'contain'}}
            />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
    <span style={{ fontWeight: 700, fontSize: '1.5rem', display: 'flex', gap: 4, alignItems: 'center' }}>
      <span style={{ color: '#14532d' }}>Train</span>
      <span style={{ color: '#ff6b3d' }}>&nbsp;&amp;&nbsp;</span>
      <span style={{ color: '#14532d' }}>Dare</span>
      <span style={{ color: '#c47b16' }}> Academy</span>
    </span>
    <small style={{ fontSize: 11, color: '#5f6d64' }}>Entrepreneuriat • Mindset • Transformation</small>
  </div>
          </div>
          
          {/* Desktop Menu */}
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[activeSection]}
            style={{ 
              flex: 1, 
              justifyContent: 'flex-end',
              border: 'none',
              background: 'transparent',
              display: window.innerWidth > 768 ? 'flex' : 'none'
            }}
            items={NAV_SECTION_IDS.map((section) => ({
              key: section,
              label: (
                <span onClick={() => handleNavClick(section)} style={{ cursor: 'pointer' }}>
                  {getSectionLabel(section)}
                </span>
              ),
            }))}
          />

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ 
              display: window.innerWidth <= 768 ? 'block' : 'none',
              fontSize: '1.5rem'
            }}
          />
        </Header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              background: 'white',
              zIndex: 999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '1rem',
            }}
          >
            {NAV_SECTION_IDS.map((section) => (
              <div
                key={section}
                onClick={() => handleNavClick(section)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  background: activeSection === section ? '#f0f0f0' : 'transparent',
                  fontWeight: activeSection === section ? 'bold' : 'normal',
                  color: activeSection === section ? '#14532d' : '#102218',
                }}
              >
                {getSectionLabel(section)}
              </div>
            ))}
          </div>
        )}

        <Content style={{ marginTop: 64 }}>
          <Routes>
            {/* Main Home Page with all sections */}
            <Route 
              path="/" 
              element={<HomePage />} 
            />

            {/* Separate Pages for Programs */}
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/editeur" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
            <Route path="/blog/admin" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
            <Route path="/contact" element={<NavigateToHomeContact />} />
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
