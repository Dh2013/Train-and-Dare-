import { useState } from 'react';
import { Alert, Button, Form, Input, Select, Typography, message } from 'antd';
import {
  BarChartOutlined,
  BulbOutlined,
  CheckCircleFilled,
  ExperimentOutlined,
  LineChartOutlined,
  MailOutlined,
  SearchOutlined,
  ShareAltOutlined,
  StarFilled,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { newsletterApi } from '../api/newsletter';
import { trackConversion, trackEvent } from '../lib/analytics';
import SocialShareButtons from './SocialShareButtons';
import './MarketingSections.css';

const { Paragraph, Title } = Typography;

const marketingLevers = [
  {
    icon: <SearchOutlined />,
    title: 'Referencement SEO',
    body: 'Pages structurees, titres clairs, meta descriptions, blog thematique et donnees structurees pour aider Google a comprendre la marque.',
  },
  {
    icon: <BarChartOutlined />,
    title: 'Google Analytics & Web Analytics',
    body: 'Suivi des pages vues, clics importants, inscriptions, demandes de contact et abonnements newsletter via GA4.',
  },
  {
    icon: <LineChartOutlined />,
    title: 'Conversion & Lead Generation',
    body: 'Appels a l action, formulaires, offres de diagnostic et pages dediees pour transformer les visiteurs en prospects.',
  },
  {
    icon: <ShareAltOutlined />,
    title: 'Contenu & Social Media',
    body: 'Blog, sujets partageables, boutons sociaux et angles editoriaux pour nourrir LinkedIn, Facebook, WhatsApp et les campagnes.',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Landing Pages SEA',
    body: 'Pages de destination pour accueillir le trafic publicitaire avec une promesse claire, des preuves et un formulaire court.',
  },
  {
    icon: <MailOutlined />,
    title: 'Email Marketing',
    body: 'Capture email et segmentation pour relancer les prospects, partager les contenus et annoncer les prochains ateliers.',
  },
];

const reviews = [
  {
    name: 'Parent participant',
    role: 'Parcours jeunes',
    quote:
      'L approche donne aux jeunes un cadre concret pour croire en leurs idees et apprendre a les presenter avec confiance.',
  },
  {
    name: 'Porteuse de projet',
    role: 'Formation adultes',
    quote:
      'Le programme m a aidee a clarifier mon positionnement, structurer mon projet et passer a l action sans rester bloquee.',
  },
  {
    name: 'Partenaire educatif',
    role: 'Atelier entrepreneuriat',
    quote:
      'Train & Dare combine pedagogie active, energie et rigueur. Les participants repartent avec des outils utilisables.',
  },
];

export function DigitalMarketingSection() {
  const navigate = useNavigate();

  return (
    <section id="marketing-digital" className="marketing-section marketing-section--soft">
      <div className="home-container">
        <div className="marketing-head">
          <span className="home-section-kicker">Digital marketing</span>
          <Title level={2} className="home-section-title">
            Un site prepare pour attirer, mesurer, convertir et fideliser.
          </Title>
          <Paragraph className="home-section-text home-section-text--center">
            Le site devient un support commercial complet : SEO, analytics, contenu, social media,
            publicite ciblee, generation de leads et email marketing.
          </Paragraph>
        </div>

        <div className="marketing-grid">
          {marketingLevers.map((item) => (
            <article key={item.title} className="marketing-card">
              <div className="marketing-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <div className="marketing-cta-strip">
          <div>
            <strong>Publicite ciblee SEA</strong>
            <p>
              Utilisez des landing pages dediees pour vos campagnes Google Ads, Meta Ads ou
              LinkedIn Ads.
            </p>
          </div>
          <div className="marketing-cta-actions">
            <Button type="primary" onClick={() => navigate('/landing/formation')}>
              Landing adultes
            </Button>
            <Button onClick={() => navigate('/landing/education')}>
              Landing jeunes
            </Button>
            <Button onClick={() => navigate('/landing/coaching')}>
              Landing coaching
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ClientReviewsSection() {
  return (
    <section id="avis-clients" className="marketing-section">
      <div className="home-container">
        <div className="marketing-head">
          <span className="home-section-kicker">Avis & preuve sociale</span>
          <Title level={2} className="home-section-title">
            Des avis clients pour renforcer la confiance avant la prise de contact.
          </Title>
        </div>

        <div className="reviews-grid">
          {reviews.map((review) => (
            <blockquote key={review.name} className="review-card">
              <div className="review-stars" aria-label="5 etoiles">
                {[1, 2, 3, 4, 5].map((item) => (
                  <StarFilled key={item} />
                ))}
              </div>
              <p>{review.quote}</p>
              <footer>
                <strong>{review.name}</strong>
                <span>{review.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="share-panel">
          <div>
            <strong>Partager Train & Dare Academy</strong>
            <p>
              Encouragez les visiteurs, parents, partenaires et apprenants a partager le site avec
              leur reseau.
            </p>
          </div>
          <SocialShareButtons
            title="Train & Dare Academy"
            text="Decouvrez Train & Dare Academy, une academie pour l entrepreneuriat, le mindset et le passage a l action."
          />
        </div>
      </div>
    </section>
  );
}

export function EmailMarketingSection() {
  const [form] = Form.useForm<{ fullName?: string; email: string; segment?: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const onFinish = async (values: { fullName?: string; email: string; segment?: string }) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      await newsletterApi.subscribe({
        email: values.email.trim(),
        fullName: values.fullName?.trim() || undefined,
        source: 'homepage-email-marketing',
        segments: values.segment ? [values.segment] : ['all'],
        tags: ['lead-generation', 'website'],
      });
      trackConversion('newsletter_signup', {
        location: 'homepage',
        segment: values.segment || 'all',
      });
      setFeedback('Inscription confirmee. Vous recevrez les contenus Train & Dare.');
      message.success('Inscription newsletter enregistree.');
      form.resetFields();
    } catch {
      message.error('Impossible d enregistrer l email pour le moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="email-marketing" className="marketing-section marketing-section--dark">
      <div className="home-container email-grid">
        <div>
          <span className="home-section-kicker home-section-kicker--light">Email marketing</span>
          <Title level={2} className="home-section-title home-section-title--light">
            Transformez les visiteurs interesses en audience qualifiee.
          </Title>
          <Paragraph className="marketing-light-copy">
            Capturez les emails pour envoyer des contenus utiles, annoncer les ateliers, relancer les
            prospects et nourrir la relation avant une inscription.
          </Paragraph>

          <div className="email-benefits">
            {['Conseils entrepreneuriat', 'Invitations ateliers', 'Ressources mindset'].map((item) => (
              <span key={item}>
                <CheckCircleFilled /> {item}
              </span>
            ))}
          </div>
        </div>

        <div className="email-card">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="fullName" label="Nom">
              <Input size="large" placeholder="Votre nom" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Votre email est requis.' },
                { type: 'email', message: 'Entrez un email valide.' },
              ]}
            >
              <Input size="large" placeholder="vous@exemple.com" />
            </Form.Item>
            <Form.Item name="segment" label="Votre interet principal">
              <Select
                size="large"
                placeholder="Choisir un sujet"
                options={[
                  { value: 'jeunes', label: 'Programmes jeunes' },
                  { value: 'adultes', label: 'Formation adultes' },
                  { value: 'coaching', label: 'Coaching & mindset' },
                  { value: 'partenariats', label: 'Ecoles et partenaires' },
                ]}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<MailOutlined />}
              loading={submitting}
              block
              onClick={() => trackEvent('newsletter_form_click', { location: 'homepage' })}
            >
              Recevoir les ressources
            </Button>
          </Form>

          {feedback && <Alert type="success" showIcon message={feedback} style={{ marginTop: 16 }} />}
        </div>
      </div>
    </section>
  );
}

export function ConversionHighlights() {
  return (
    <div className="conversion-strip" aria-label="Conversion et generation de leads">
      <div>
        <ExperimentOutlined />
        <strong>Diagnostic gratuit</strong>
        <span>Un premier echange pour qualifier le besoin.</span>
      </div>
      <div>
        <BulbOutlined />
        <strong>Offres claires</strong>
        <span>Jeunes, adultes, coaching, enseignants.</span>
      </div>
      <div>
        <LineChartOutlined />
        <strong>Suivi des conversions</strong>
        <span>Contact, inscription, newsletter et clics CTA.</span>
      </div>
    </div>
  );
}
