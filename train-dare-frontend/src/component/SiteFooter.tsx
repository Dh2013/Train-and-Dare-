import React, { useState } from 'react';
import { Alert, Button, Form, Input, Typography } from 'antd';
import {
  ArrowRightOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  MailOutlined,
  ReadOutlined,
  RocketOutlined,
  SendOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { newsletterApi } from '../api/newsletter';
import { trackConversion } from '../lib/analytics';
import type { NewsletterFormValues } from '../types/forms';
import './SiteFooter.css';

const { Paragraph, Text, Title } = Typography;
const { Item } = Form;

interface SiteFooterProps {
  onSectionNavigate: (section: string) => void;
}

const sectionLinks = [
  { key: 'accueil', label: 'Accueil' },
  { key: 'apropos', label: 'À propos' },
  { key: 'programmes', label: 'Programmes' },
  { key: 'marketing-digital', label: 'Marketing' },
  { key: 'coaching', label: 'Coaching' },
  { key: 'avis-clients', label: 'Avis' },
  { key: 'blog', label: 'Blog' },
  { key: 'contact', label: 'Contact' },
];

const offerLinks = [
  { label: 'Éducation entrepreneuriale', path: '/programmes/education' },
  { label: 'Formation entrepreneuriale', path: '/programmes/formation' },
  { label: 'Espace Parent & Ado', path: '/programmes/parent-ado' },
  { label: 'Espace Enseignants', path: '/programmes/enseignants' },
  { label: 'S’inscrire', path: '/inscription' },
];

const SiteFooter: React.FC<SiteFooterProps> = ({ onSectionNavigate }) => {
  const navigate = useNavigate();
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const onFinishNewsletter = async (values: NewsletterFormValues) => {
    setNewsletterSuccess(false);
    setNewsletterError(false);
    setNewsletterLoading(true);
    try {
      await newsletterApi.subscribe({
        email: values.email.trim(),
        source: 'footer-newsletter',
        segments: ['all'],
        tags: ['footer', 'email-marketing'],
      });
      trackConversion('newsletter_signup', { location: 'footer' });
      setNewsletterSuccess(true);
      setTimeout(() => setNewsletterSuccess(false), 3000);
    } catch {
      setNewsletterError(true);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        <section className="site-footer__banner">
          <div>
            <span className="site-footer__kicker">Train & Dare Academy</span>
            <Title level={2} className="site-footer__banner-title">
              Un footer à la hauteur d’une marque qui inspire confiance, ambition et passage à l’action.
            </Title>
            <Paragraph className="site-footer__copy">
              Entrepreneuriat, mindset, développement jeunesse et transformation professionnelle : tout l’univers Train &
              Dare Academy se retrouve ici dans un espace plus premium, plus clair et plus rassurant.
            </Paragraph>
          </div>

          <div className="site-footer__banner-actions">
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={() => onSectionNavigate('contact')}
            >
              Demander un échange
            </Button>
            <Button size="large" onClick={() => navigate('/blog')}>
              Explorer le blog
            </Button>
          </div>
        </section>

        <section className="site-footer__grid">
          <div className="site-footer__brand">
            <div className="site-footer__brand-mark">
              <img src="/logo T&D.pdf (2).svg" alt="Logo Train and Dare Academy" />
            </div>
            <div>
              <Title level={4} className="site-footer__brand-title">
                Train & Dare Academy
              </Title>
              <Paragraph className="site-footer__copy">
                Une académie pensée pour faire grandir l’esprit d’initiative chez les jeunes et accompagner les adultes
                vers des projets plus clairs, plus crédibles et plus vivants.
              </Paragraph>
            </div>

            <div className="site-footer__chips">
              <span>Jeunes & familles</span>
              <span>Adultes & reconversion</span>
              <span>PNL & neurosciences</span>
            </div>
          </div>

          <div className="site-footer__column">
            <Text className="site-footer__label">Navigation</Text>
            <div className="site-footer__links">
              {sectionLinks.map((link) => (
                <button
                  key={link.key}
                  type="button"
                  className="site-footer__link"
                  onClick={() => onSectionNavigate(link.key)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="site-footer__column">
            <Text className="site-footer__label">Parcours</Text>
            <div className="site-footer__links">
              {offerLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  className="site-footer__link"
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="site-footer__column">
            <Text className="site-footer__label">Contact & Ressources</Text>
            <div className="site-footer__contact-list">
              <div>
                <EnvironmentOutlined />
                <span>Tunis, Tunisie</span>
              </div>
              <div>
                <MailOutlined />
                <span>contact@trainanddare.com</span>
              </div>
              <div>
                <TeamOutlined />
                <span>Jeunes, adultes, familles et partenaires éducatifs</span>
              </div>
              <div>
                <GlobalOutlined />
                <span>Présentiel, ateliers, accompagnements et ressources en ligne</span>
              </div>
            </div>

            <div className="site-footer__mini-links">
              <Button type="link" icon={<RocketOutlined />} onClick={() => navigate('/programmes/formation')}>
                Voir la formation adultes
              </Button>
              <Button type="link" icon={<ReadOutlined />} onClick={() => navigate('/blog')}>
                Lire les articles
              </Button>
            </div>
          </div>
        </section>

        <section className="site-footer__newsletter">
          <div>
            <Text className="site-footer__label">Newsletter</Text>
            <Title level={4} className="site-footer__newsletter-title">
              Recevez des idées, ressources et conseils autour de l’entrepreneuriat et du mindset.
            </Title>
            <Paragraph className="site-footer__copy" style={{ marginBottom: 0 }}>
              Un format simple pour garder le lien avec la communauté Train & Dare Academy.
            </Paragraph>
          </div>

          <div className="site-footer__newsletter-form">
            <Form name="newsletter" onFinish={onFinishNewsletter} layout="vertical">
              <div className="site-footer__newsletter-row">
                <Item
                  name="email"
                  style={{ marginBottom: 0, flex: 1 }}
                  rules={[
                    { required: true, message: 'Votre email est requis.' },
                    { type: 'email', message: 'Entrez un email valide.' },
                  ]}
                >
                  <Input placeholder="Votre email" size="large" />
                </Item>
                <Item style={{ marginBottom: 0 }}>
                  <Button htmlType="submit" type="primary" size="large" icon={<SendOutlined />} loading={newsletterLoading}>
                    S’abonner
                  </Button>
                </Item>
              </div>
            </Form>

            {newsletterSuccess && (
              <Alert message="Inscription réussie !" type="success" showIcon style={{ marginTop: 14 }} />
            )}
            {newsletterError && (
              <Alert
                message="Impossible d enregistrer l email pour le moment."
                type="error"
                showIcon
                style={{ marginTop: 14 }}
              />
            )}
          </div>
        </section>

        <section className="site-footer__bottom">
          <Text className="site-footer__bottom-copy">© 2025 Train & Dare Academy. Tous droits réservés.</Text>
          <Text className="site-footer__bottom-copy">
            Entrepreneuriat • Développement personnel • Leadership • Transformation
          </Text>
        </section>
      </div>
    </footer>
  );
};

export default SiteFooter;
