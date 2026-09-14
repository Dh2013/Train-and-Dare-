import React, { useState } from 'react';
import { Alert, Button, Form, Input, Typography } from 'antd';
import {
  ArrowRightOutlined,
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
  { key: 'coaching', label: 'Coaching' },
  { key: 'blog', label: 'Blog' },
  { key: 'faq', label: 'FAQ' },
  { key: 'carriere', label: 'Carrière' },
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
  const [newsletterForm] = Form.useForm<NewsletterFormValues>();
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  const scrollTopSoon = () => {
    window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }), 0);
  };

  const goToRoute = (path: string) => {
    navigate(path);
    scrollTopSoon();
  };

  const goToSection = (section: string) => {
    onSectionNavigate(section);
    if (section === 'blog') {
      scrollTopSoon();
    }
  };

  const onFinishNewsletter = async (values: NewsletterFormValues) => {
    setNewsletterSuccess(false);
    setNewsletterError(false);
    setNewsletterLoading(true);
    try {
      await newsletterApi.subscribe({
        email: values.email.trim(),
        source: 'footer-newsletter',
        segments: ['all'],
        tags: ['footer', 'newsletter'],
      });
      trackConversion('newsletter_signup', { location: 'footer' });
      newsletterForm.resetFields();
      setNewsletterSuccess(true);
      setTimeout(() => setNewsletterSuccess(false), 3000);
    } catch {
      setNewsletterError(true);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer id="site-footer" className="site-footer">
      <div className="site-footer__container">
        <section className="site-footer__banner">
          <div>
            <span className="site-footer__kicker">Train & Dare Academy</span>
            <Title level={2} className="site-footer__banner-title">
              Prêt à construire un parcours qui donne envie d’oser ?
            </Title>
            <Paragraph className="site-footer__copy">
              Retrouvez les accès essentiels pour découvrir les programmes, demander un échange ou rejoindre la
              communauté Train & Dare Academy.
            </Paragraph>
          </div>

          <div className="site-footer__banner-actions">
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={() => goToSection('contact')}
            >
              Demander un échange
            </Button>
            <Button size="large" onClick={() => goToRoute('/blog')}>
              Explorer le blog
            </Button>
          </div>
        </section>

        <section className="site-footer__grid">
          <div className="site-footer__brand">
            <button
              type="button"
              className="site-footer__brand-mark"
              onClick={() => goToSection('accueil')}
              aria-label="Retour à l’accueil"
            >
              <img src="/logo T&D.pdf (2).svg" alt="Logo Train and Dare Academy" />
            </button>
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
                  onClick={() => goToSection(link.key)}
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
                  onClick={() => goToRoute(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="site-footer__column">
            <Text className="site-footer__label">Contact & Ressources</Text>
            <div className="site-footer__contact-list">
              <a className="site-footer__contact-link" href="mailto:trainanddareacademy@gmail.com">
                <MailOutlined />
                <span>trainanddareacademy@gmail.com</span>
              </a>
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
              <Button type="link" icon={<RocketOutlined />} onClick={() => goToRoute('/programmes/formation')}>
                Voir la formation adultes
              </Button>
              <Button type="link" icon={<ReadOutlined />} onClick={() => goToRoute('/blog')}>
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
            <Form form={newsletterForm} name="newsletter" onFinish={onFinishNewsletter} layout="vertical">
              <div className="site-footer__newsletter-row">
                <Item
                  name="email"
                  label="Adresse e-mail"
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
                message="Impossible d’enregistrer l’email pour le moment."
                type="error"
                showIcon
                style={{ marginTop: 14 }}
              />
            )}
          </div>
        </section>

        <section className="site-footer__bottom">
          <Text className="site-footer__bottom-copy">© {currentYear} Train & Dare Academy. Tous droits réservés.</Text>
          <Text className="site-footer__bottom-copy">
            Entrepreneuriat • Développement personnel • Leadership • Transformation
          </Text>
        </section>
      </div>
    </footer>
  );
};

export default SiteFooter;
