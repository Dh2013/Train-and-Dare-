import React, { useState } from 'react';
import {
  Alert,
  Button,
  Collapse,
  Form,
  Input,
  Typography,
  message,
} from 'antd';
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HeartOutlined,
  MailOutlined,
  PlayCircleOutlined,
  ReadOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  StarFilled,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { contactApi } from '../api/contact';
import type { ContactFormValues } from '../types/forms';
import { trackConversion, trackEvent } from '../lib/analytics';
import Seo from './Seo';
import {
  ClientReviewsSection,
  ConversionHighlights,
  DigitalMarketingSection,
  EmailMarketingSection,
} from './MarketingSections';
import badge from '../assets/badge  najla formatrice. (1).jpg';
import cvPDF from '../assets/cv najla ben haj maouia formatrice CNFCPP.pdf';
import heroAdult from '../assets/IMG_20240228_150738 (3).jpg';
import heroYouth from '../assets/IMG_20220812_093123 (2).jpg';
import heroWorkshop from '../assets/IMG_20231125_134053.jpg';
import gallery1 from '../assets/IMG_20220720_100200.jpg';
import gallery2 from '../assets/IMG_20220812_115832 (1).jpg';
import gallery3 from '../assets/IMG_20240228_144718.jpg';
import './HomePage.css';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

const trustHighlights = [
  'Entrepreneuriat & innovation',
  'PNL et neurosciences',
  'Pédagogie active',
  'Coaching transformationnel',
];

const audienceCards = [
  {
    title: 'Jeunes & adolescents',
    subtitle: 'Éveiller l’initiative, la confiance et le sens du projet',
    tone: 'youth',
    bullets: [
      'Ateliers ludiques et projets concrets',
      'Accompagnement parent-ado et espaces enseignants',
      'Leadership, créativité et autonomie',
    ],
    ctaLabel: 'Explorer le parcours jeunesse',
    ctaPath: '/programmes/education',
  },
  {
    title: 'Adultes & porteurs de projet',
    subtitle: 'Passer de l’idée à une trajectoire entrepreneuriale crédible',
    tone: 'adult',
    bullets: [
      'Mindset, business model et stratégie',
      'Coaching pour reconversion, structuration et passage à l’action',
      'Approche concrète, humaine et orientée résultats',
    ],
    ctaLabel: 'Découvrir la formation adultes',
    ctaPath: '/programmes/formation',
  },
];

const methodPillars = [
  {
    icon: <RocketOutlined />,
    title: 'Apprendre en faisant',
    body: 'Les participants avancent grâce à des défis, projets, ateliers et mises en situation qui développent l’autonomie.',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Renforcer le mindset',
    body: 'La PNL et les neurosciences aident à travailler la confiance, la clarté, la communication et la prise de décision.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Accompagner humainement',
    body: 'Le cadre est exigeant mais bienveillant, pour sécuriser le passage à l’action chez les jeunes comme chez les adultes.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Construire la crédibilité',
    body: 'Chaque parcours vise des résultats visibles : posture, pitch, structure de projet, vision et capacité à convaincre.',
  },
];

const coachingTracks = [
  {
    title: 'Coaching jeunes',
    accent: 'youth',
    description:
      'Pour l’estime de soi, l’orientation, l’organisation mentale et l’esprit d’initiative.',
    bullets: ['Séances individuelles', 'Ateliers collectifs', 'Approche parent-enfant'],
  },
  {
    title: 'Coaching adultes',
    accent: 'adult',
    description:
      'Pour clarifier un projet, dépasser les blocages, retrouver une direction et sécuriser les premiers pas.',
    bullets: ['Mindset entrepreneurial', 'Structuration de projet', 'Décisions et priorités'],
  },
  {
    title: 'Workshops intensifs',
    accent: 'neutral',
    description:
      'Des formats courts et puissants pour travailler un sujet ciblé : pitch, créativité, leadership, communication.',
    bullets: ['Sessions thématiques', 'Format dynamique', 'Très bon levier pour entreprises et écoles'],
  },
];

const testimonials = [
  {
    quote:
      'Train & Dare Academy crée un cadre rare : ambitieux, concret et profondément humain.',
    author: 'Accompagnement adultes',
  },
  {
    quote:
      'Les jeunes n’écoutent pas un discours abstrait. Ici, ils vivent une expérience qui leur donne envie d’oser.',
    author: 'Parcours jeunesse',
  },
  {
    quote:
      'La force de l’approche vient du mélange entre posture mentale, méthode pédagogique et vision entrepreneuriale.',
    author: 'Partenaires & familles',
  },
];

const faqs = [
  {
    key: '1',
    label: 'À qui s’adressent les programmes Train & Dare Academy ?',
    children:
      'L’académie accompagne deux grands publics : les jeunes et adolescents qui développent leur esprit d’initiative, et les adultes ou porteurs de projet qui veulent structurer une trajectoire entrepreneuriale ou professionnelle.',
  },
  {
    key: '2',
    label: 'Qu’est-ce qui rend l’approche différente ?',
    children:
      'Train & Dare Academy croise entrepreneuriat, pédagogie active, PNL, neurosciences et coaching. L’objectif n’est pas seulement d’apprendre un contenu, mais de transformer la posture et la capacité à agir.',
  },
  {
    key: '3',
    label: 'Le site parle-t-il autant aux jeunes qu’aux adultes ?',
    children:
      'Oui. Le positionnement distingue clairement les besoins des jeunes et des adultes, tout en gardant une identité cohérente, sérieuse et inspirante pour la marque dans son ensemble.',
  },
  {
    key: '4',
    label: 'Comment démarrer un accompagnement ?',
    children:
      'Le plus simple est de remplir le formulaire de contact ou de demander un échange exploratoire. L’équipe pourra ensuite orienter vers le bon programme, le bon format et le bon niveau d’accompagnement.',
  },
];

const sectionVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<ContactFormValues>();
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }
    window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
  };

  const onFinish = async (values: ContactFormValues) => {
    setFeedback(null);
    setSending(true);
    try {
      await contactApi.send(values);
      trackConversion('contact_request', {
        location: 'homepage_contact',
      });
      setFeedback({
        type: 'success',
        text: 'Votre message a bien été envoyé. L’équipe Train & Dare vous répondra rapidement.',
      });
      message.success('Message envoyé.');
      form.resetFields();
    } catch {
      setFeedback({
        type: 'error',
        text: 'Impossible d’envoyer le message pour le moment. Merci de réessayer ou d’écrire directement par email.',
      });
      message.error('Échec de l’envoi du message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="home-shell">
      <Seo
        title="Train & Dare Academy"
        description="Académie d’entrepreneuriat et de développement personnel pour jeunes, adultes et porteurs de projets."
        path="/"
        type="website"
        keywords={[
          'formation entrepreneuriat',
          'coaching mindset',
          'education entrepreneuriale',
          'PNL',
          'developpement personnel',
          'Train and Dare Academy',
        ]}
      />

      <section id="accueil" className="home-hero">
        <div className="home-container">
          <motion.div
            className="home-hero-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
          >
            <motion.div className="home-hero-copy" variants={sectionVariant}>
              <span className="home-kicker">Train & Dare Academy</span>
              <Title className="home-display">
                Une académie qui fait grandir l’audace, la vision et la capacité d’entreprendre.
              </Title>
              <Paragraph className="home-lead">
                Train & Dare Academy accompagne les jeunes dans leur éveil entrepreneurial et les adultes dans la
                concrétisation de leurs projets, avec une approche qui relie pédagogie active, PNL, neurosciences et
                développement personnel.
              </Paragraph>

              <div className="home-hero-actions">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  onClick={() => {
                    trackEvent('cta_click', { location: 'home_hero', action: 'programmes' });
                    scrollToSection('programmes');
                  }}
                >
                  Découvrir les parcours
                </Button>
                <Button
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={() => {
                    trackEvent('cta_click', { location: 'home_hero', action: 'contact' });
                    scrollToSection('contact');
                  }}
                >
                  Demander un échange
                </Button>
              </div>

              <div className="home-highlight-row">
                {trustHighlights.map((item) => (
                  <span key={item} className="home-highlight-pill">
                    {item}
                  </span>
                ))}
              </div>

              <div className="home-metric-grid">
                <div className="home-metric-card">
                  <Text className="home-metric-label">2 parcours</Text>
                  <strong>Jeunesse & adultes</strong>
                </div>
                <div className="home-metric-card">
                  <Text className="home-metric-label">3 espaces dédiés</Text>
                  <strong>Jeunes, parents, enseignants</strong>
                </div>
                <div className="home-metric-card">
                  <Text className="home-metric-label">Approche premium</Text>
                  <strong>Mindset, méthode et action</strong>
                </div>
              </div>
              <ConversionHighlights />
            </motion.div>

            <motion.div className="home-hero-visual" variants={sectionVariant}>
              <div className="home-visual-stack">
                <div className="home-visual-card home-visual-card--primary">
                  <img src={heroAdult} alt="Adultes accompagnés par Train and Dare Academy" />
                </div>
                <div className="home-visual-card home-visual-card--secondary">
                  <img src={heroYouth} alt="Jeunes en atelier entrepreneurial" />
                </div>
                <div className="home-floating-note">
                  <StarFilled />
                  <span>Une marque qui inspire confiance et passage à l’action</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="home-gallery-band" aria-label="Moments de formation et d’accompagnement">
        <div className="home-container">
          <div className="home-gallery-grid">
            {[gallery1, gallery2, gallery3, heroWorkshop].map((image, index) => (
              <motion.div
                key={image}
                className={`home-gallery-card home-gallery-card--${index + 1}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <img src={image} alt="Séquence Train and Dare Academy" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="apropos" className="home-section">
        <div className="home-container">
          <motion.div
            className="home-about-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
          >
            <motion.div className="home-section-copy" variants={sectionVariant}>
              <span className="home-section-kicker">À propos</span>
              <Title level={2} className="home-section-title">
                Une vision ambitieuse de l’éducation entrepreneuriale et de la transformation personnelle.
              </Title>
              <Paragraph className="home-section-text">
                Fondée par Najla Ben Haj Maouia, Train & Dare Academy défend une conviction simple : l’esprit
                entrepreneurial s’éveille, se travaille et se transmet. L’académie aide chaque participant à relier
                potentiel intérieur, méthodes concrètes et passage à l’action.
              </Paragraph>

              <div className="home-value-grid">
                <div className="home-value-card">
                  <CompassOutlined />
                  <div>
                    <strong>Notre vision</strong>
                    <p>Un monde où jeunes et adultes osent entreprendre leur vie avec sens, courage et responsabilité.</p>
                  </div>
                </div>
                <div className="home-value-card">
                  <HeartOutlined />
                  <div>
                    <strong>Notre mission</strong>
                    <p>Développer le potentiel entrepreneurial par le coaching, l’éducation active et le travail sur la posture mentale.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="home-founder-card" variants={sectionVariant}>
              <div className="home-founder-media">
                <img src={badge} alt="Badge formatrice Train and Dare Academy" />
              </div>
              <div className="home-founder-body">
                <span className="home-mini-kicker">Leadership pédagogique</span>
                <Title level={3} className="home-section-title">
                  Najla Ben Haj Maouia
                </Title>
                <Paragraph className="home-section-text">
                  Une posture d’accompagnement qui croise entrepreneuriat, neurosciences, PNL et pédagogie
                  transformationnelle pour bâtir des parcours crédibles et humains.
                </Paragraph>
                <div className="home-proof-list">
                  <span><SafetyCertificateOutlined /> Approche professionnelle et structurée</span>
                  <span><GlobalOutlined /> Positionnement clair pour institutions, familles et adultes</span>
                  <span><ReadOutlined /> Contenu transmissible, actionnable et différenciant</span>
                </div>
                <Button
                  icon={<FileTextOutlined />}
                  href={cvPDF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir le CV
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="programmes" className="home-section home-section--soft">
        <div className="home-container">
          <div className="home-section-head">
            <span className="home-section-kicker">Programmes</span>
            <Title level={2} className="home-section-title">
              Deux univers d’accompagnement, un même niveau d’exigence.
            </Title>
            <Paragraph className="home-section-text home-section-text--center">
              La marque parle avec clarté aux jeunes, aux familles, aux enseignants, aux adultes et aux porteurs de projet,
              sans perdre en cohérence ni en crédibilité.
            </Paragraph>
          </div>

          <div className="home-audience-grid">
            {audienceCards.map((card) => (
              <motion.article
                key={card.title}
                className={`home-audience-card home-audience-card--${card.tone}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55 }}
              >
                <div className="home-audience-eyebrow">
                  {card.tone === 'youth' ? 'Éducation entrepreneuriale' : 'Formation entrepreneuriale'}
                </div>
                <Title level={3} className="home-section-title">
                  {card.title}
                </Title>
                <Paragraph className="home-section-text">{card.subtitle}</Paragraph>
                <ul className="home-audience-list">
                  {card.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Button type="primary" size="large" onClick={() => navigate(card.ctaPath)}>
                  {card.ctaLabel}
                </Button>
              </motion.article>
            ))}
          </div>

          <div className="home-support-strip">
            <div className="home-support-card">
              <TeamOutlined />
              <div>
                <strong>Parents & ados</strong>
                <p>Un espace pour mieux comprendre, soutenir et orienter le potentiel des jeunes.</p>
              </div>
              <Button type="link" onClick={() => navigate('/programmes/parent-ado')}>
                Voir l’espace
              </Button>
            </div>
            <div className="home-support-card">
              <ReadOutlined />
              <div>
                <strong>Enseignants</strong>
                <p>Des ressources et ateliers pour intégrer l’initiative, la créativité et l’esprit de projet.</p>
              </div>
              <Button type="link" onClick={() => navigate('/programmes/enseignants')}>
                Découvrir
              </Button>
            </div>
            <div className="home-support-card">
              <PlayCircleOutlined />
              <div>
                <strong>Inscription</strong>
                <p>Un parcours simple pour rejoindre un programme, un accompagnement ou un workshop.</p>
              </div>
              <Button type="link" onClick={() => navigate('/inscription')}>
                Commencer
              </Button>
            </div>
          </div>
        </div>
      </section>

      <DigitalMarketingSection />

      <section id="coaching" className="home-section">
        <div className="home-container">
          <div className="home-section-head">
            <span className="home-section-kicker">Méthode & coaching</span>
            <Title level={2} className="home-section-title">
              Une expérience premium pensée pour transformer la posture autant que les compétences.
            </Title>
          </div>

          <div className="home-method-grid">
            <div className="home-method-column">
              {methodPillars.map((pillar) => (
                <motion.div
                  key={pillar.title}
                  className="home-method-card"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="home-method-icon">{pillar.icon}</div>
                  <div>
                    <strong>{pillar.title}</strong>
                    <p>{pillar.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="home-coaching-column">
              {coachingTracks.map((track) => (
                <motion.div
                  key={track.title}
                  className={`home-coaching-card home-coaching-card--${track.accent}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45 }}
                >
                  <strong>{track.title}</strong>
                  <p>{track.description}</p>
                  <ul>
                    {track.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ClientReviewsSection />

      <section id="temoignages" className="home-section home-section--dark">
        <div className="home-container">
          <div className="home-section-head">
            <span className="home-section-kicker home-section-kicker--light">Crédibilité & impact</span>
            <Title level={2} className="home-section-title home-section-title--light">
              Un site qui inspire confiance parce qu’il rend la proposition de valeur immédiatement lisible.
            </Title>
          </div>

          <div className="home-trust-grid">
            <div className="home-proof-panel">
              <div className="home-proof-stat">
                <span>Jeunes</span>
                <strong>12 à 25 ans</strong>
              </div>
              <div className="home-proof-stat">
                <span>Adultes</span>
                <strong>Porteurs de projet & reconversion</strong>
              </div>
              <div className="home-proof-stat">
                <span>Promesse</span>
                <strong>Oser, structurer, concrétiser</strong>
              </div>
            </div>

            <div className="home-testimonial-grid">
              {testimonials.map((testimonial) => (
                <motion.blockquote
                  key={testimonial.author}
                  className="home-testimonial-card"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45 }}
                >
                  <p>“{testimonial.quote}”</p>
                  <span>{testimonial.author}</span>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <div className="home-insight-card">
            <div>
              <span className="home-section-kicker">SEO & contenu</span>
              <Title level={3} className="home-section-title">
                Le blog renforce l’expertise perçue et soutient la visibilité de la marque.
              </Title>
              <Paragraph className="home-section-text">
                Articles sur l’entrepreneuriat, le mindset, la PNL et le développement personnel : un levier puissant pour
                attirer les bons publics et nourrir la confiance avant la prise de contact.
              </Paragraph>
            </div>
            <Button size="large" onClick={() => navigate('/blog')}>
              Explorer le blog
            </Button>
          </div>
        </div>
      </section>

      <section id="faq" className="home-section home-section--soft">
        <div className="home-container">
          <div className="home-section-head">
            <span className="home-section-kicker">FAQ</span>
            <Title level={2} className="home-section-title">
              Les questions que se posent souvent les familles, partenaires et futurs participants.
            </Title>
          </div>

          <Collapse
            className="home-faq"
            ghost
            items={faqs}
          />
        </div>
      </section>

      <EmailMarketingSection />

      <section id="contact" className="home-section home-contact">
        <div className="home-container">
          <div className="home-contact-grid">
            <motion.div
              className="home-contact-copy"
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
              <span className="home-section-kicker">Contact</span>
              <Title level={2} className="home-section-title">
                Construisons un parcours qui donne envie d’oser et les moyens de réussir.
              </Title>
              <Paragraph className="home-section-text">
                Que vous soyez une famille, un adulte en transition, une école ou une institution, Train & Dare Academy
                peut construire une expérience claire, motivante et crédible autour de vos objectifs.
              </Paragraph>

              <div className="home-contact-points">
                <div>
                  <EnvironmentOutlined />
                  <span>Tunis, Tunisie</span>
                </div>
                <div>
                  <MailOutlined />
                  <span>contact@trainanddare.com</span>
                </div>
                <div>
                  <CalendarOutlined />
                  <span>Échanges exploratoires et accompagnements sur mesure</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="home-contact-form-card"
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
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
                <Form.Item
                  name="message"
                  label="Votre besoin"
                  rules={[{ required: true, message: 'Merci de décrire votre besoin.' }]}
                >
                  <TextArea
                    rows={5}
                    placeholder="Décrivez votre public, votre objectif ou le type d’accompagnement recherché."
                  />
                </Form.Item>
                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  loading={sending}
                  block
                >
                  Envoyer la demande
                </Button>
              </Form>

              {feedback && (
                <Alert
                  style={{ marginTop: 16 }}
                  type={feedback.type}
                  message={feedback.text}
                  showIcon
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
