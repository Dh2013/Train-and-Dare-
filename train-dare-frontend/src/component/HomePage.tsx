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
import { pageSeo } from '../seo/pages';
import badge from '../assets/badge  najla formatrice. (1).jpg';
import heroAdult from '../assets/IMG_20240228_150738 (3).jpg';
import homeHeroBackground from '../assets/TRAIN&DARE ACADEMY 2.jpg';
import heroWorkshop from '../assets/lyvee.jpg';
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

const academyValues = [
  {
    icon: <HeartOutlined />,
    title: 'Bienveillance',
    body: 'Nous croyons qu’un jeune progresse mieux lorsqu’il se sent écouté, respecté et encouragé.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Confiance',
    body: 'Nous aidons chaque apprenant à reconnaître sa valeur, ses forces et son potentiel.',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Créativité',
    body: 'Nous encourageons les jeunes à imaginer, proposer, créer et penser différemment.',
  },
  {
    icon: <CompassOutlined />,
    title: 'Responsabilité',
    body: 'Nous accompagnons les jeunes pour qu’ils deviennent acteurs de leurs choix et de leur avenir.',
  },
  {
    icon: <StarFilled />,
    title: 'Excellence humaine',
    body: 'Nous visons le développement global de la personne : savoir, savoir-faire et savoir-être.',
  },
];

const partnerLogos = [
  { initials: 'EDU', name: 'Écoles partenaires', meta: 'Ateliers & projets' },
  { initials: 'INST', name: 'Institutions éducatives', meta: 'Programmes jeunesse' },
  { initials: 'ASSO', name: 'Associations jeunesse', meta: 'Impact local' },
  { initials: 'ENT', name: 'Entreprises engagées', meta: 'Mentorat & terrain' },
  { initials: 'EXP', name: 'Experts & coachs', meta: 'Soft skills' },
  { initials: 'FORM', name: 'Centres de formation', meta: 'Parcours structurés' },
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

interface CareerFormValues {
  name: string;
  email: string;
  phone?: string;
  profile: string;
  portfolio?: string;
  message: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<ContactFormValues>();
  const [careerForm] = Form.useForm<CareerFormValues>();
  const [sending, setSending] = useState(false);
  const [careerSending, setCareerSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [careerFeedback, setCareerFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const onCareerFinish = async (values: CareerFormValues) => {
    setCareerFeedback(null);
    setCareerSending(true);
    try {
      await contactApi.send({
        name: values.name,
        email: values.email,
        phone: values.phone,
        subject: `Candidature carrière - ${values.profile}`,
        sourcePage: 'homepage_carriere',
        message: [
          `Profil recherché : ${values.profile}`,
          `Téléphone : ${values.phone || 'Non renseigné'}`,
          `Lien CV / portfolio : ${values.portfolio || 'Non renseigné'}`,
          '',
          'Motivation :',
          values.message,
        ].join('\n'),
      });
      trackConversion('career_application', {
        location: 'homepage_carriere',
        profile: values.profile,
      });
      setCareerFeedback({
        type: 'success',
        text: 'Votre candidature a bien été envoyée. L’équipe Train & Dare vous répondra rapidement.',
      });
      message.success('Candidature envoyée.');
      careerForm.resetFields();
    } catch {
      setCareerFeedback({
        type: 'error',
        text: 'Impossible d’envoyer la candidature pour le moment. Merci de réessayer ou d’écrire directement par email.',
      });
      message.error('Échec de l’envoi de la candidature.');
    } finally {
      setCareerSending(false);
    }
  };

  return (
    <div className="home-shell">
      <Seo {...pageSeo('/')} />

      <section
        id="accueil"
        className="home-hero"
        style={{
          '--home-hero-bg': `url("${heroAdult}")`,
          '--home-hero-bg-secondary': `url("${homeHeroBackground}")`,
          '--home-hero-bg-third': `url("${heroWorkshop}")`,
        } as React.CSSProperties}
      >
        <div className="home-hero-photo home-hero-photo--primary" aria-hidden="true" />
        <div className="home-hero-photo home-hero-photo--secondary" aria-hidden="true" />
        <div className="home-hero-photo home-hero-photo--third" aria-hidden="true" />
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
              <Title level={1} className="home-display">
                Une académie qui fait grandir l’audace, la vision et la capacité d’entreprendre.
              </Title>
              <Paragraph className="home-welcome hero-desc">
                Bienvenue à Train and Dare Academy, un centre innovant d’éducation et de formation en entrepreneuriat et développement personnel.
              </Paragraph>
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
              </div>
            </motion.div>

          </motion.div>
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
                Oser apprendre. Oser grandir. Oser construire son avenir.
              </Title>
              <Paragraph className="home-section-text">
                Train&amp;Dare Academy est une académie dédiée au développement personnel, professionnel
                et entrepreneurial des adolescents, des jeunes et de toute personne souhaitant révéler son
                potentiel.
              </Paragraph>
              <Paragraph className="home-section-text">
                Notre mission est d’accompagner chaque apprenant à mieux se connaître, à développer ses
                compétences, à renforcer son estime et sa confiance en soi, et à devenir acteur de son avenir.
              </Paragraph>
              <Paragraph className="home-section-text">
                Dans un monde en constante évolution, les connaissances scolaires ne suffisent plus. Les
                jeunes ont aujourd’hui besoin de développer des compétences humaines essentielles : la
                communication, la créativité, l’intelligence émotionnelle, l’esprit d’initiative, la confiance en
                soi et la capacité à entreprendre.
              </Paragraph>
              <Paragraph className="home-section-text">
                C’est dans cette vision que Train&amp;Dare Academy a été créée.
              </Paragraph>

              <div className="home-founder-section">
                <span className="home-mini-kicker">Notre fondatrice</span>
                <Title level={3} className="home-founder-title">
                  Najla Ben Haj Maouia
                </Title>
                <Paragraph className="home-section-text">
                  Train&amp;Dare Academy a été fondée par Najla Ben Haj Maouia, professeure d’économie,
                  chercheuse en éducation entrepreneuriale, coach personnelle et professionnelle,
                  coach d’adolescents certifiée par la Haute École de
                  Coaching de Paris – RNCP niveau 7 Européen.
                </Paragraph>
                <Text className="home-founder-list-label">Elle est également :</Text>
                <div className="home-proof-list home-proof-list--founder">
                  <span><SafetyCertificateOutlined /> Praticienne certifiée en PNL</span>
                  <span><GlobalOutlined /> Praticienne certifiée en neurosciences cognitives et comportementales</span>
                  <span><ReadOutlined /> Formatrice et facilitatrice en communication, soft skills et entrepreneuriat</span>
                  <span><TeamOutlined /> Formatrice CNFCPP – Centre National de Formation Continue et de Promotion Professionnelle</span>
                </div>
                <Paragraph className="home-section-text">
                  Afin de valoriser son parcours professionnel et son engagement dans la formation, Najla Ben
                  Haj Maouia dispose également du badge Formatrice CNFCPP, qui témoigne de son appartenance
                  au domaine de la formation continue et de la promotion professionnelle.
                </Paragraph>

                <div className="home-founder-origin">
                  <Title level={3} className="home-founder-title home-founder-title--origin">
                    L’origine de Train&amp;Dare Academy
                  </Title>
                  <Paragraph className="home-section-text">
                    Train &amp; Dare Academy est née d’une conviction :
                  </Paragraph>
                  <blockquote className="home-founder-quote">
                    On ne naît pas entrepreneur, on le devient. Et tout commence par un voyage intérieur.
                  </blockquote>
                  <Paragraph className="home-section-text">
                    Nous croyons que chaque personne, quel que soit son âge, peut développer son potentiel
                    entrepreneurial.
                  </Paragraph>
                  <Paragraph className="home-section-text">
                    L’idée de Train&amp;Dare Academy est née d’une réalité observée sur le terrain. En tant que
                    professeure proche des adolescents, Najla Ben Haj Maouia a constaté que beaucoup de jeunes
                    possèdent un potentiel énorme, mais manquent parfois de confiance, d’orientation, de motivation
                    ou d’outils pour s’exprimer et se projeter dans l’avenir.
                  </Paragraph>
                  <Paragraph className="home-section-text">
                    Certains jeunes ont des idées, mais n’osent pas les partager. D’autres ont des talents, mais ne
                    savent pas encore comment les développer. Beaucoup veulent réussir, mais ont besoin d’un
                    accompagnement adapté à leur âge, à leur personnalité et à leurs ambitions.
                  </Paragraph>
                  <Paragraph className="home-section-text">
                    Train&amp;Dare Academy est née de cette conviction forte : chaque adolescent peut apprendre à croire
                    en lui, à développer ses compétences, à libérer sa créativité et à devenir une force positive pour
                    lui-même, sa famille et son pays.
                  </Paragraph>
                </div>
              </div>

              <div className="home-value-grid">
                <div className="home-value-card">
                  <CompassOutlined />
                  <div>
                    <strong>Notre vision</strong>
                    <p>
                      Nous croyons que l’éducation de demain doit former des jeunes confiants, créatifs,
                      responsables et capables d’agir.
                    </p>
                    <p>
                      Notre vision est de contribuer à l’émergence d’une nouvelle génération de jeunes leaders,
                      entrepreneurs, créateurs et citoyens engagés, capables de construire leur avenir et de participer
                      activement au progrès de leur pays.
                    </p>
                    <p>
                      Train&amp;Dare Academy ne se limite pas à transmettre des connaissances. Elle aide les jeunes à
                      développer une posture, une mentalité et des compétences utiles dans la vie réelle.
                    </p>
                  </div>
                </div>
                <div className="home-value-card">
                  <HeartOutlined />
                  <div>
                    <strong>Notre approche</strong>
                    <p>
                      Notre accompagnement repose sur une méthode à la fois pédagogique, pratique et humaine.
                    </p>
                    <p>
                      Nous combinons le coaching, la PNL, les neurosciences cognitives et comportementales, les
                      soft skills et l’entrepreneuriat pour proposer une expérience d’apprentissage complète.
                    </p>
                    <p>Nos formations permettent aux jeunes de :</p>
                    <ul className="home-value-list">
                      <li>renforcer leur confiance en eux</li>
                      <li>mieux communiquer</li>
                      <li>développer leur créativité</li>
                      <li>gérer leurs émotions</li>
                      <li>prendre des décisions</li>
                      <li>travailler en équipe</li>
                      <li>transformer leurs idées en projets concrets</li>
                    </ul>
                    <p>
                      Chaque formation est pensée pour être interactive, dynamique et adaptée aux besoins des
                      apprenants.
                    </p>
                  </div>
                </div>
              </div>

              <div className="home-values-showcase">
                <div className="home-values-head">
                  <span className="home-mini-kicker">Nos valeurs</span>
                  <Title level={3} className="home-founder-title home-founder-title--origin">
                    Les repères qui guident chaque accompagnement.
                  </Title>
                </div>
                <div className="home-values-grid">
                  {academyValues.map((value) => (
                    <article className="home-principle-card" key={value.title}>
                      <div className="home-principle-icon">{value.icon}</div>
                      <div>
                        <strong>{value.title}</strong>
                        <p>{value.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="home-choice-panel">
                <div className="home-choice-icon">
                  <RocketOutlined />
                </div>
                <div>
                  <Title level={3} className="home-founder-title home-founder-title--origin">
                    Pourquoi choisir Train&amp;Dare Academy ?
                  </Title>
                  <Paragraph className="home-section-text">
                    Choisir Train&amp;Dare Academy, c’est choisir un espace d’apprentissage moderne, rassurant et
                    motivant.
                  </Paragraph>
                  <Paragraph className="home-section-text">
                    C’est bénéficier d’un accompagnement assuré par une fondatrice expérimentée, certifiée et
                    engagée dans le développement des jeunes.
                  </Paragraph>
                  <Paragraph className="home-section-text">
                    Grâce à son parcours en enseignement, coaching, PNL, neurosciences, communication, soft
                    skills, entrepreneuriat et formation CNFCPP, Najla Ben Haj Maouia propose une approche
                    complète, sérieuse et humaine.
                  </Paragraph>
                  <Paragraph className="home-section-text">
                    Notre objectif est d’aider chaque jeune à apprendre, oser, créer et réussir.
                  </Paragraph>
                </div>
              </div>

              <div className="home-commitment-panel">
                <Title level={3} className="home-founder-title home-founder-title--origin">
                  Notre engagement
                </Title>
                <Paragraph className="home-section-text">
                  Chez Train&amp;Dare Academy, nous croyons que chaque jeune porte en lui une capacité
                  unique à apprendre, évoluer et réussir.
                </Paragraph>
                <Paragraph className="home-section-text">
                  Notre rôle est de l’aider à découvrir cette capacité, à la développer et à la transformer en
                  actions concrètes.
                </Paragraph>
                <strong>Train&amp;Dare Academy : apprendre, oser, réussir.</strong>
              </div>

              <div className="home-partner-panel">
                <div className="home-partner-head">
                  <span className="home-mini-kicker">Notre Partenaire</span>
                  <Title level={3} className="home-founder-title home-founder-title--origin">
                    Des collaborations construites autour de l’impact éducatif.
                  </Title>
                </div>
                <Paragraph className="home-section-text">
                  Train&amp;Dare Academy s’entoure de partenaires éducatifs, institutionnels et professionnels
                  qui partagent la même ambition : accompagner les jeunes vers plus de confiance, de créativité
                  et d’autonomie.
                </Paragraph>
                <Paragraph className="home-section-text">
                  Ensemble, nous construisons des ateliers, programmes et projets adaptés aux besoins réels des
                  apprenants, avec une approche sérieuse, humaine et orientée résultats.
                </Paragraph>
                <div className="home-partner-marquee" aria-label="Logos partenaires">
                  <div className="home-partner-track">
                    {[...partnerLogos, ...partnerLogos].map((partner, index) => (
                      <div
                        className="home-partner-logo"
                        key={`${partner.name}-${index}`}
                        aria-hidden={index >= partnerLogos.length}
                      >
                        <span>{partner.initials}</span>
                        <strong>{partner.name}</strong>
                        <small>{partner.meta}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="home-founder-card home-founder-card--badge" variants={sectionVariant}>
              <div className="home-founder-media home-founder-media--discreet">
                <img src={badge} alt="Badge formatrice Train and Dare Academy" />
              </div>
              <div className="home-founder-body home-founder-body--compact">
                <span className="home-mini-kicker">Badge professionnel</span>
                <Text className="home-founder-badge-caption">Formatrice CNFCPP</Text>
                <Text className="home-founder-badge-caption home-founder-badge-caption--muted">
                  Centre National de Formation Continue et de Promotion Professionnelle
                </Text>
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

      <section id="carriere" className="home-section home-career">
        <div className="home-container">
          <div className="home-career-grid">
            <motion.div
              className="home-career-copy"
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
              <span className="home-section-kicker">Carrière</span>
              <Title level={2} className="home-section-title">
                Rejoindre une académie qui aide les jeunes à apprendre, oser et réussir.
              </Title>
              <Paragraph className="home-section-text">
                Train&amp;Dare Academy recherche des profils engagés, pédagogues et humains pour contribuer à des
                parcours autour du développement personnel, des soft skills, du coaching et de l’entrepreneuriat.
              </Paragraph>

              <div className="home-career-points">
                <div>
                  <TeamOutlined />
                  <span>Formateurs, coachs, facilitateurs et intervenants spécialisés</span>
                </div>
                <div>
                  <SafetyCertificateOutlined />
                  <span>Une posture sérieuse, bienveillante et adaptée aux jeunes</span>
                </div>
                <div>
                  <RocketOutlined />
                  <span>Des missions orientées impact, créativité et passage à l’action</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="home-career-form-card"
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
              <Form form={careerForm} layout="vertical" onFinish={onCareerFinish}>
                <Form.Item name="name" label="Nom complet" rules={[{ required: true, message: 'Votre nom est requis.' }]}>
                  <Input size="large" placeholder="Votre nom complet" />
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
                <Form.Item name="phone" label="Téléphone">
                  <Input size="large" placeholder="+216 ..." />
                </Form.Item>
                <Form.Item
                  name="profile"
                  label="Profil / domaine"
                  rules={[{ required: true, message: 'Indiquez votre profil ou domaine.' }]}
                >
                  <Input size="large" placeholder="Coach, formateur, communication, entrepreneuriat..." />
                </Form.Item>
                <Form.Item name="portfolio" label="Lien CV ou portfolio">
                  <Input size="large" placeholder="Lien LinkedIn, Drive, portfolio..." />
                </Form.Item>
                <Form.Item
                  name="message"
                  label="Motivation"
                  rules={[{ required: true, message: 'Présentez brièvement votre motivation.' }]}
                >
                  <TextArea
                    rows={5}
                    placeholder="Présentez votre expérience, vos compétences et le type de collaboration souhaité."
                  />
                </Form.Item>
                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  loading={careerSending}
                  block
                >
                  Envoyer la candidature
                </Button>
              </Form>

              {careerFeedback && (
                <Alert
                  style={{ marginTop: 16 }}
                  type={careerFeedback.type}
                  message={careerFeedback.text}
                  showIcon
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

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
              <Title level={2} className="home-section-title">Parlons de votre projet</Title>
              <div className="home-contact-points">
                <a className="home-contact-link" href="mailto:trainanddareacademy@gmail.com">
                  <MailOutlined />
                  <span>trainanddareacademy@gmail.com</span>
                </a>
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
