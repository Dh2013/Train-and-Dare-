import { useMemo, useState } from 'react';
import { Alert, Button, Form, Input, Typography, message } from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  MailOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { contactApi } from '../api/contact';
import { trackConversion, trackEvent } from '../lib/analytics';
import Seo from './Seo';
import SocialShareButtons from './SocialShareButtons';
import { ClientReviewsSection, EmailMarketingSection } from './MarketingSections';
import './LandingPage.css';

const { Paragraph, Title } = Typography;
const { TextArea } = Input;

const landingPages = {
  education: {
    label: 'Education entrepreneuriale',
    title: 'Ateliers entrepreneuriat pour jeunes qui veulent oser, creer et presenter leurs idees.',
    description:
      'Une landing page dediee aux campagnes SEA pour attirer parents, jeunes et etablissements interesses par les ateliers Train & Dare.',
    audience: 'Parents, adolescents, etablissements scolaires',
    offer: 'Demander un diagnostic jeunesse',
    bullets: [
      'Developper confiance, creativite et leadership',
      'Ateliers concrets avec projets, pitch et defis',
      'Approche pedagogique active et motivante',
    ],
    programmePath: '/programmes/education',
  },
  formation: {
    label: 'Formation adultes',
    title: 'Formation entrepreneuriat pour transformer une idee en projet clair et credible.',
    description:
      'Une landing page pour convertir le trafic issu des campagnes Google Ads, Meta Ads ou LinkedIn Ads vers une demande de contact.',
    audience: 'Adultes, porteurs de projet, reconversion',
    offer: 'Recevoir un appel de qualification',
    bullets: [
      'Clarifier le positionnement et la proposition de valeur',
      'Travailler le mindset entrepreneurial et le passage a l action',
      'Structurer les prochaines etapes du projet',
    ],
    programmePath: '/programmes/formation',
  },
  coaching: {
    label: 'Coaching transformationnel',
    title: 'Coaching mindset et passage a l action pour avancer avec clarte.',
    description:
      'Une landing page courte pour convertir les personnes qui cherchent un accompagnement individuel ou un workshop cible.',
    audience: 'Jeunes, adultes, equipes et institutions',
    offer: 'Planifier un premier echange',
    bullets: [
      'Identifier les blocages et objectifs prioritaires',
      'Construire une feuille de route simple et actionnable',
      'Gagner en confiance, communication et decision',
    ],
    programmePath: '/#coaching',
  },
};

type LandingKey = keyof typeof landingPages;

function getLandingKey(value?: string): LandingKey {
  if (value === 'education' || value === 'formation' || value === 'coaching') {
    return value;
  }
  return 'formation';
}

export default function LandingPage() {
  const { campaign } = useParams<{ campaign: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<{ name: string; email: string; phone?: string; message?: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const landingKey = getLandingKey(campaign);
  const page = useMemo(() => landingPages[landingKey], [landingKey]);

  const onFinish = async (values: { name: string; email: string; phone?: string; message?: string }) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      await contactApi.send({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        subject: `Landing page ${page.label}`,
        sourcePage: `/landing/${landingKey}`,
        newsletterOptIn: true,
        consentAccepted: true,
        message:
          values.message?.trim() ||
          `Lead depuis la landing page ${page.label}. Audience: ${page.audience}.`,
      });
      trackConversion('landing_page_lead', {
        campaign: landingKey,
        location: `/landing/${landingKey}`,
      });
      setFeedback('Votre demande est envoyee. Train & Dare vous recontactera rapidement.');
      message.success('Demande envoyee.');
      form.resetFields();
    } catch {
      message.error('Impossible d envoyer la demande pour le moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing-shell">
      <Seo
        title={`${page.label} - Landing page`}
        description={page.description}
        path={`/landing/${landingKey}`}
        type="website"
        keywords={[
          'formation entrepreneuriat',
          'coaching mindset',
          'education entrepreneuriale',
          'Train and Dare Academy',
        ]}
      />

      <section className="landing-hero">
        <div className="home-container landing-hero-grid">
          <div className="landing-copy">
            <span className="landing-kicker">{page.label}</span>
            <Title className="landing-title">{page.title}</Title>
            <Paragraph className="landing-lead">{page.description}</Paragraph>

            <div className="landing-bullets">
              {page.bullets.map((bullet) => (
                <span key={bullet}>
                  <CheckCircleFilled /> {bullet}
                </span>
              ))}
            </div>

            <div className="landing-actions">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  trackEvent('landing_cta_click', { campaign: landingKey, action: 'form' });
                  document.getElementById('landing-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {page.offer}
              </Button>
              <Button size="large" onClick={() => navigate(page.programmePath)}>
                Voir le programme
              </Button>
            </div>

            <SocialShareButtons
              className="landing-share"
              title={page.label}
              text={page.title}
            />
          </div>

          <div id="landing-form" className="landing-form-card">
            <div className="landing-form-head">
              <RocketOutlined />
              <div>
                <strong>{page.offer}</strong>
                <span>{page.audience}</span>
              </div>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Votre nom est requis.' }]}>
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
              <Form.Item name="phone" label="Telephone">
                <Input size="large" placeholder="Optionnel" />
              </Form.Item>
              <Form.Item name="message" label="Votre objectif">
                <TextArea rows={4} placeholder="Decrivez votre besoin, public ou projet." />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<MailOutlined />}
                loading={submitting}
                block
              >
                Envoyer ma demande
              </Button>
            </Form>

            {feedback && <Alert type="success" showIcon message={feedback} style={{ marginTop: 16 }} />}
          </div>
        </div>
      </section>

      <section className="landing-proof">
        <div className="home-container landing-proof-grid">
          <div>
            <SafetyCertificateOutlined />
            <strong>Preuve sociale</strong>
            <span>Avis, temoignages et messages de confiance pour rassurer les visiteurs.</span>
          </div>
          <div>
            <StarFilled />
            <strong>Conversion</strong>
            <span>CTA clair, formulaire court et tracking des leads.</span>
          </div>
          <div>
            <RocketOutlined />
            <strong>Campagnes SEA</strong>
            <span>Pages dediees pour tester vos annonces et vos audiences.</span>
          </div>
        </div>
      </section>

      <ClientReviewsSection />
      <EmailMarketingSection />
    </div>
  );
}
