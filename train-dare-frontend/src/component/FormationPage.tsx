import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Tag, Typography } from 'antd';
import { motion } from 'framer-motion';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CompassOutlined,
  FundProjectionScreenOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import Seo from './Seo';
import heroAdult from '../assets/IMG_20240228_150738 (3).jpg';
import heroWorkshop from '../assets/IMG_20231125_134053.jpg';
import supportImage from '../assets/IMG_20240228_144718.jpg';
import './FormationPage.css';

const { Paragraph, Text, Title } = Typography;

const targetProfiles = [
  {
    title: 'Adultes en transition',
    body: 'Pour clarifier une nouvelle direction, retrouver de l’élan et transformer une envie diffuse en projet structuré.',
  },
  {
    title: 'Porteurs de projet',
    body: 'Pour passer de l’idée à un modèle plus crédible, mieux présenté et mieux positionné face au marché.',
  },
  {
    title: 'Jeunes diplômés',
    body: 'Pour construire une trajectoire professionnelle plus active, autonome et alignée avec ses forces.',
  },
  {
    title: 'Chercheurs d’emploi & reconversion',
    body: 'Pour reprendre la main sur son avenir, développer sa posture et se remettre en mouvement avec méthode.',
  },
];

const methodPillars = [
  {
    icon: <RocketOutlined />,
    title: 'Idéation & opportunité',
    body: 'Identifier des besoins réels, reconnaître des opportunités et faire émerger une proposition qui tient la route.',
  },
  {
    icon: <FundProjectionScreenOutlined />,
    title: 'Business model & plan',
    body: 'Structurer un modèle économique solide, un plan d’action réaliste et une vision compréhensible par d’autres.',
  },
  {
    icon: <MessageOutlined />,
    title: 'Marketing & négociation',
    body: 'Apprendre à parler du projet avec clarté, construire son message et renforcer sa capacité à convaincre.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Accompagnement personnalisé',
    body: 'Faire progresser la personne autant que le projet, avec du coaching, des cas pratiques et un cadre motivant.',
  },
];

const modules = [
  {
    step: 'M1',
    title: 'Se connaître',
    subtitle: 'PNL & neurosciences',
    bullets: [
      'Comprendre ses modes de fonctionnement, ses talents, ses moteurs et ses freins',
      'Identifier croyances limitantes, biais et posture actuelle',
      'Développer conscience de soi et énergie d’action',
    ],
  },
  {
    step: 'M2',
    title: 'De l’idée à l’opportunité',
    subtitle: 'Créativité & reconnaissance d’opportunité',
    bullets: [
      'Explorer des idées avec design thinking',
      'Observer des besoins réels et sélectionner les plus prometteurs',
      'Transformer une intuition en opportunité structurée',
    ],
  },
  {
    step: 'M3',
    title: 'Business model solide',
    subtitle: 'Clarté et structure',
    bullets: [
      'Bâtir un Business Model Canvas cohérent',
      'Poser la proposition de valeur, les clients et les ressources clés',
      'Relier le projet à une stratégie réaliste',
    ],
  },
  {
    step: 'M4',
    title: 'Plan d’affaires',
    subtitle: 'Viabilité & projection',
    bullets: [
      'Étude de marché, logique financière et scénarios',
      'Planifier les premières étapes de mise en œuvre',
      'Préparer une base crédible pour financement ou lancement',
    ],
  },
  {
    step: 'M5',
    title: 'Posture entrepreneuriale',
    subtitle: 'Coaching & mindset',
    bullets: [
      'Travail sur la confiance, la décision, la persévérance et la gestion de l’incertitude',
      'Transformer le stress et les blocages en mouvement',
      'Renforcer l’alignement entre identité, ambition et action',
    ],
  },
  {
    step: 'M6',
    title: 'Pitcher & passer à l’action',
    subtitle: 'Communication & lancement',
    bullets: [
      'Construire un pitch clair et impactant',
      'Prendre la parole avec plus de présence et de conviction',
      'Sortir avec un plan d’action concret et activable',
    ],
  },
];

const pnlBenefits = [
  'Comprendre le cerveau pour apprendre, décider et agir avec plus de lucidité',
  'Renforcer la communication interne et externe grâce à l’intelligence émotionnelle',
  'Dépasser croyances limitantes, auto-sabotage et hésitation chronique',
  'Mieux gérer stress, incertitude, échec et fatigue mentale',
  'Développer motivation, créativité, concentration et discipline',
];

const outcomes = [
  {
    icon: <BankOutlined />,
    title: 'Un projet plus crédible',
    body: 'Vous repartez avec une idée mieux structurée, un cadre stratégique plus lisible et des prochaines étapes plus claires.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Une posture plus solide',
    body: 'Vous gagnez en confiance, en communication, en vision et en capacité à porter votre projet face aux autres.',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Plus de passage à l’action',
    body: 'Le programme réduit le flou, fait tomber plusieurs blocages et aide à ancrer une dynamique durable.',
  },
];

const bonuses = [
  'Cas pratiques et ateliers appliqués',
  'Accompagnement personnalisé',
  'Communauté et ressources utiles',
  'Fiches outils pour continuer après la formation',
];

const FormationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="formation-shell">
      <Seo
        title="Formation Entrepreneuriale"
        description="Une page premium pour présenter l’offre Train & Dare Academy destinée aux adultes, porteurs de projet et reconversions."
        path="/programmes/formation"
        type="website"
      />

      <div className="formation-container">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/#programmes')}>
          Retour au site
        </Button>

        <section className="formation-hero">
          <div className="formation-hero-grid">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
            >
              <span className="formation-kicker">Formation en entrepreneuriat</span>
              <Title className="formation-display">
                Transformer ses idées en projet. Devenir acteur de sa vie professionnelle.
              </Title>
              <Paragraph className="formation-lead">
                Une landing page premium pensée pour les adultes, jeunes diplômés, personnes en reconversion et
                porteurs de projet qui veulent avancer avec plus de méthode, de confiance et de clarté.
              </Paragraph>

              <div className="formation-action-row">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  onClick={() => navigate('/inscription')}
                >
                  Demander une inscription
                </Button>
                <Button size="large" onClick={() => navigate('/blog')}>
                  Explorer le blog
                </Button>
              </div>

              <div className="formation-pill-row">
                <span className="formation-pill">Adultes & porteurs de projets</span>
                <span className="formation-pill">PNL & neurosciences</span>
                <span className="formation-pill">6 modules</span>
                <span className="formation-pill">Ateliers & coaching</span>
              </div>

              <div className="formation-stat-grid">
                <div className="formation-stat-card">
                  <Text className="formation-stat-label">Parcours</Text>
                  <strong>6 modules</strong>
                </div>
                <div className="formation-stat-card">
                  <Text className="formation-stat-label">Focus</Text>
                  <strong>Projet + mindset</strong>
                </div>
                <div className="formation-stat-card">
                  <Text className="formation-stat-label">Cible</Text>
                  <strong>Reconversion & action</strong>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="formation-hero-visual"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="formation-image-stack">
                <div className="formation-image formation-image--main">
                  <img src={heroAdult} alt="Adultes accompagnés dans un parcours entrepreneurial" />
                </div>
                <div className="formation-image formation-image--secondary">
                  <img src={heroWorkshop} alt="Atelier de formation Train and Dare Academy" />
                </div>
                <div className="formation-floating-card">
                  <StarFilled />
                  <span>Une page plus crédible, plus premium et plus orientée conversion</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="formation-section">
          <div className="formation-section-head">
            <span className="formation-section-kicker">Pour qui</span>
            <Title level={2} className="formation-section-title">
              Un cadre qui parle autant au projet qu’à la personne qui le porte.
            </Title>
            <Paragraph className="formation-section-text formation-section-text--center">
              La page clarifie immédiatement les publics visés, ce qui renforce la confiance et réduit le flou au moment
              de la prise de décision.
            </Paragraph>
          </div>

          <Row gutter={[18, 18]}>
            {targetProfiles.map((profile) => (
              <Col xs={24} md={12} key={profile.title}>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="formation-profile-card">
                    <strong>{profile.title}</strong>
                    <p>{profile.body}</p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </section>

        <section className="formation-section formation-section--soft">
          <div className="formation-section-head">
            <span className="formation-section-kicker">Méthode</span>
            <Title level={2} className="formation-section-title">
              Une formation qui relie stratégie entrepreneuriale, posture mentale et mise en mouvement.
            </Title>
          </div>

          <Row gutter={[18, 18]}>
            {methodPillars.map((pillar) => (
              <Col xs={24} md={12} key={pillar.title}>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="formation-impact-card">
                    <div className="formation-impact-icon">{pillar.icon}</div>
                    <div>
                      <strong>{pillar.title}</strong>
                      <p>{pillar.body}</p>
                    </div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </section>

        <section className="formation-section">
          <div className="formation-section-head">
            <span className="formation-section-kicker">Parcours détaillé</span>
            <Title level={2} className="formation-section-title">
              Six modules pour faire mûrir l’idée, structurer le projet et renforcer la posture entrepreneuriale.
            </Title>
          </div>

          <Row gutter={[20, 20]}>
            {modules.map((module) => (
              <Col xs={24} md={12} lg={8} key={module.step}>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45 }}
                >
                  <Card className="formation-module-card" bordered={false}>
                    <div className="formation-module-top">
                      <span className="formation-module-step">{module.step}</span>
                      <Tag color="orange">{module.subtitle}</Tag>
                    </div>
                    <Title level={4} className="formation-card-title">
                      {module.title}
                    </Title>
                    <div className="formation-bullet-list">
                      {module.bullets.map((bullet) => (
                        <div key={bullet} className="formation-bullet-item">
                          <PlayCircleOutlined />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </section>

        <section className="formation-section">
          <div className="formation-grid-two">
            <div className="formation-mindset-card">
              <span className="formation-section-kicker">PNL & mindset</span>
              <Title level={2} className="formation-section-title">
                Travailler le cerveau entrepreneurial pour apprendre, décider et agir avec plus de solidité.
              </Title>
              <Paragraph className="formation-section-text">
                La dimension PNL et neurosciences n’est pas un supplément décoratif. Elle permet de mieux gérer la peur,
                le doute, l’échec, la communication, la créativité et la prise de décision.
              </Paragraph>

              <div className="formation-benefit-list">
                {pnlBenefits.map((benefit) => (
                  <div key={benefit} className="formation-benefit-item">
                    <CompassOutlined />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="formation-proof-card">
              <img src={supportImage} alt="Accompagnement professionnel Train and Dare Academy" />
              <div className="formation-proof-body">
                <span className="formation-mini-kicker">Pourquoi cette page rassure davantage</span>
                <Title level={3} className="formation-section-title">
                  Une image plus premium pour mieux refléter la valeur de l’offre adultes.
                </Title>
                <Paragraph className="formation-section-text">
                  Le design et le discours renforcent la perception de sérieux, de clarté et de niveau d’accompagnement.
                  La page aide l’utilisateur à comprendre rapidement à quoi sert la formation et ce qu’il peut en attendre.
                </Paragraph>
                <div className="formation-proof-points">
                  <span><SafetyCertificateOutlined /> Positionnement crédible pour reconversion, projet ou reprise en main</span>
                  <span><RocketOutlined /> Discours orienté transformation et concrétisation</span>
                  <span><FundProjectionScreenOutlined /> Parcours lisible, modules clairs et CTA sans friction</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="formation-section formation-section--dark">
          <div className="formation-section-head">
            <span className="formation-section-kicker formation-section-kicker--light">Résultats & bonus</span>
            <Title level={2} className="formation-section-title formation-section-title--light">
              Ce que la personne gagne à la fin du parcours, au-delà des contenus.
            </Title>
          </div>

          <Row gutter={[18, 18]} style={{ marginBottom: 18 }}>
            {outcomes.map((outcome) => (
              <Col xs={24} md={8} key={outcome.title}>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="formation-outcome-card">
                    <div className="formation-outcome-icon">{outcome.icon}</div>
                    <strong>{outcome.title}</strong>
                    <p>{outcome.body}</p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>

          <div className="formation-bonus-strip">
            {bonuses.map((bonus) => (
              <span key={bonus} className="formation-bonus-pill">
                {bonus}
              </span>
            ))}
          </div>
        </section>

        <section className="formation-section">
          <div className="formation-cta-card">
            <div>
              <span className="formation-section-kicker">Passage à l’action</span>
              <Title level={2} className="formation-section-title">
                Quand la vision devient plus claire, l’action devient plus possible.
              </Title>
              <Paragraph className="formation-section-text">
                Cette page est pensée pour aider les futurs participants à se projeter rapidement, comprendre la valeur
                de la formation et passer naturellement vers une inscription, un échange ou une lecture complémentaire.
              </Paragraph>
            </div>

            <div className="formation-cta-actions">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                onClick={() => navigate('/inscription')}
              >
                Commencer une demande
              </Button>
              <Button size="large" onClick={() => navigate('/contact')}>
                Parler à l’équipe
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FormationPage;
