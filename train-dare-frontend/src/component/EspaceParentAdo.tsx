import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Skeleton, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  HeartOutlined,
  MailOutlined,
  ReadOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { programsApi, type Programme, type Univers } from '../api/programs';
import Seo from './Seo';
import { pageSeo } from '../seo/pages';
import familyHero from '../assets/IMG_20220812_093123 (2).jpg';
import youthWorkshop from '../assets/TRAIN&DARE ACADEMY 2.jpg';
import parentWorkshop from '../assets/IMG_20240228_144718.jpg';
import './EspaceParentAdo.css';

const { Paragraph, Text, Title } = Typography;

const FALLBACK_UNIVERS: Univers = {
  id: 'univers-parent-ado',
  slug: 'parent-ado',
  titre: 'Espace Parent & Ado',
  sousTitre: "Impliquer les parents dans l'aventure entrepreneuriale de leurs enfants",
  description:
    "Un espace pour aider les parents à soutenir l'autonomie, la confiance et l'esprit d'initiative de leurs adolescents sans pression inutile.",
  programmes: [
    {
      id: 'prog-edu-famille',
      slug: 'education-entrepreneuriale-familiale',
      titre: "Programme d'éducation entrepreneuriale familiale",
      public: "Parents d'ados",
      duree: 'Sur mesure',
      objectifs: [
        "Comprendre les enjeux de l'éducation entrepreneuriale",
        'Créer un dialogue constructif autour des aspirations',
        "Soutenir l'autonomie sans imposer le parcours",
      ],
      lienInscription: 'education-entrepreneuriale-familiale',
    },
    {
      id: 'prog-softskills-parents',
      slug: 'softskills-pour-parents',
      titre: 'Softskills pour parents',
      public: 'Parents',
      duree: 'Ateliers',
      objectifs: [
        'Adopter une posture de coach sans pression ni jugement',
        'Encourager, questionner et écouter avec plus de clarté',
        "Mieux accompagner les choix d'orientation et de projet",
      ],
      lienInscription: 'softskills-pour-parents',
    },
    {
      id: 'prog-pnl-parents',
      slug: 'pnl-au-service-des-parents',
      titre: 'PNL au service des parents',
      public: 'Parents',
      duree: 'Modules dédiés',
      objectifs: [
        'Mieux communiquer avec son ado',
        'Comprendre les blocages, émotions et motivations',
        'Accompagner le parcours entrepreneurial avec bienveillance',
      ],
      lienInscription: 'pnl-au-service-des-parents',
    },
  ],
};

const proofItems = [
  { label: 'Public', value: 'Parents & adolescents' },
  { label: 'Format', value: 'Ateliers, échanges, outils' },
  { label: 'Objectif', value: 'Confiance et dialogue' },
];

const pillars = [
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Un cadre rassurant',
    body: "Les parents comprennent le parcours, les objectifs et la posture attendue pour accompagner l'ado sans le freiner.",
  },
  {
    icon: <HeartOutlined />,
    title: 'Une relation plus claire',
    body: "La communication devient plus simple : écouter, questionner, encourager et poser un cadre qui aide l'ado à avancer.",
  },
  {
    icon: <RocketOutlined />,
    title: "Un passage à l'action",
    body: "Les familles repartent avec des outils concrets pour soutenir les projets, les choix et l'esprit d'initiative au quotidien.",
  },
];

const journey = [
  {
    step: '01',
    title: 'Comprendre',
    body: "Identifier les besoins de l'ado, ses forces, ses doutes et son rapport à l'avenir.",
  },
  {
    step: '02',
    title: 'Dialoguer',
    body: 'Installer une communication constructive pour parler orientation, projet et confiance.',
  },
  {
    step: '03',
    title: 'Soutenir',
    body: "Encourager l'autonomie, la créativité et la responsabilité sans transformer le projet en pression.",
  },
  {
    step: '04',
    title: 'Avancer',
    body: "Construire une dynamique familiale qui aide l'ado à oser, tester, apprendre et présenter ses idées.",
  },
];

const outcomes = [
  'Une meilleure compréhension du fonctionnement adolescent',
  'Des outils de communication et de feedback utilisables à la maison',
  'Une posture parentale plus encourageante et moins directive',
  "Un lien naturel avec les programmes jeunes de Train & Dare Academy",
];

const EspaceParentAdo: React.FC = () => {
  const navigate = useNavigate();
  const [univers, setUnivers] = useState<Univers | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApiFallback, setHasApiFallback] = useState(false);

  useEffect(() => {
    let mounted = true;

    programsApi
      .list('parent-ado')
      .then(({ data }) => {
        if (!mounted) {
          return;
        }

        const nextUnivers = Array.isArray(data) && data.length ? data[0] : null;
        setUnivers(nextUnivers as Univers | null);
        setHasApiFallback(!nextUnivers);
      })
      .catch(() => {
        if (mounted) {
          setUnivers(null);
          setHasApiFallback(true);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeUnivers = univers ?? FALLBACK_UNIVERS;
  const programmes = useMemo(
    () => (activeUnivers.programmes?.length ? activeUnivers.programmes : FALLBACK_UNIVERS.programmes),
    [activeUnivers.programmes],
  );
  const featuredProgram = programmes[0] ?? FALLBACK_UNIVERS.programmes[0];

  const openInscription = (program: Programme = featuredProgram) => {
    navigate(`/inscription/${program.lienInscription || program.slug}`);
  };

  return (
    <div className="parentado-shell">
      <Seo {...pageSeo('/programmes/parent-ado')} />

      <main className="parentado-container">
        <Button
          type="text"
          className="parentado-back"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/#programmes')}
        >
          Retour aux programmes
        </Button>

        <section className="parentado-hero">
          <motion.div
            className="parentado-hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="parentado-kicker">
              <TeamOutlined /> Parents & ados
            </span>
            <Title level={1} className="parentado-display">
              Aider les parents à accompagner leurs ados sans pression, avec méthode et confiance.
            </Title>
            <Paragraph className="parentado-lead">{activeUnivers.description || FALLBACK_UNIVERS.description}</Paragraph>

            <div className="parentado-action-row">
              <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => openInscription()}>
                Demander une inscription
              </Button>
              <Button size="large" icon={<CompassOutlined />} onClick={() => navigate('/programmes/education')}>
                Voir le parcours jeunes
              </Button>
              <Button size="large" icon={<MailOutlined />} href="mailto:trainanddareacademy@gmail.com">
                Envoyer un email
              </Button>
            </div>

            <div className="parentado-proof-grid">
              {proofItems.map((item) => (
                <div className="parentado-proof-card" key={item.label}>
                  <Text className="parentado-proof-label">{item.label}</Text>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="parentado-visual"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <div className="parentado-image-grid">
              <img className="parentado-image parentado-image--main" src={familyHero} alt="Atelier Train and Dare Academy" />
              <img className="parentado-image parentado-image--side" src={youthWorkshop} alt="Jeunes en atelier Train and Dare Academy" />
              <div className="parentado-floating-note">
                <CheckCircleOutlined />
                <span>Un espace pour relier famille, confiance et passage à l'action.</span>
              </div>
            </div>
          </motion.div>
        </section>

        {hasApiFallback && (
          <Alert
            className="parentado-alert"
            type="info"
            showIcon
            message="La page utilise le contenu local Train & Dare Academy pour rester disponible."
          />
        )}

        <section className="parentado-section">
          <div className="parentado-section-head">
            <span className="parentado-section-kicker">Accompagnement</span>
            <Title level={2} className="parentado-section-title">
              Une page pensée pour les familles qui veulent soutenir sans contrôler.
            </Title>
          </div>

          <div className="parentado-pillar-grid">
            {pillars.map((pillar, index) => (
              <motion.article
                className="parentado-pillar-card"
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="parentado-icon">{pillar.icon}</div>
                <strong>{pillar.title}</strong>
                <p>{pillar.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="parentado-section parentado-section--split">
          <div className="parentado-media-panel">
            <img src={parentWorkshop} alt="Accompagnement Train and Dare Academy" />
          </div>

          <div className="parentado-content-panel">
            <span className="parentado-section-kicker">Parcours familial</span>
            <Title level={2} className="parentado-section-title">
              Le parent devient un repère : clair, encourageant et réaliste.
            </Title>
            <Paragraph className="parentado-section-text">
              L'espace Parent & Ado complète les programmes jeunesse avec une dimension familiale. Il aide à transformer
              les conversations difficiles en échanges utiles autour du potentiel, de l'orientation et des projets.
            </Paragraph>

            <div className="parentado-outcome-list">
              {outcomes.map((outcome) => (
                <span key={outcome}>
                  <CheckCircleOutlined /> {outcome}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="parentado-section parentado-section--soft">
          <div className="parentado-section-head">
            <span className="parentado-section-kicker">Méthode</span>
            <Title level={2} className="parentado-section-title">
              Quatre étapes simples pour retrouver un dialogue qui avance.
            </Title>
          </div>

          <div className="parentado-journey-grid">
            {journey.map((step) => (
              <article className="parentado-journey-card" key={step.step}>
                <span>{step.step}</span>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="parentado-section" id="parentado-programmes">
          <div className="parentado-section-head parentado-section-head--row">
            <div>
              <span className="parentado-section-kicker">
                <ReadOutlined /> Programmes
              </span>
              <Title level={2} className="parentado-section-title">
                Choisir le programme Parent & Ado
              </Title>
              <Paragraph className="parentado-section-text">
                Chaque proposition peut être adaptée au contexte familial, au niveau de l'ado et au besoin du moment.
              </Paragraph>
            </div>
            <Button size="large" icon={<CalendarOutlined />} onClick={() => navigate('/#contact')}>
              Demander un échange
            </Button>
          </div>

          {loading ? (
            <div className="parentado-program-grid">
              {[0, 1, 2].map((item) => (
                <div className="parentado-program-card" key={item}>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="parentado-program-grid">
              {programmes.map((program, index) => (
                <motion.article
                  className="parentado-program-card"
                  key={program.id || program.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                >
                  <div className="parentado-program-top">
                    <span className="parentado-program-number">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <Tag color="gold">{program.public}</Tag>
                      <Tag>{program.duree}</Tag>
                    </div>
                  </div>

                  <Title level={3} className="parentado-card-title">
                    {program.titre}
                  </Title>

                  <div className="parentado-objectives">
                    {(program.objectifs ?? []).slice(0, 4).map((objective) => (
                      <span key={objective}>
                        <CheckCircleOutlined /> {objective}
                      </span>
                    ))}
                  </div>

                  <div className="parentado-card-actions">
                    <Button type="primary" onClick={() => openInscription(program)}>
                      S'inscrire
                    </Button>
                    <Button onClick={() => navigate('/programmes/education')}>Voir le parcours ado</Button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        <section className="parentado-cta">
          <div>
            <span className="parentado-section-kicker parentado-section-kicker--light">Prochaine étape</span>
            <Title level={2} className="parentado-cta-title">
              Construire un cadre familial qui donne envie d'oser.
            </Title>
            <Paragraph className="parentado-cta-copy">
              Train & Dare Academy peut orienter la famille vers un atelier parent, un parcours ado ou un accompagnement
              plus personnalisé selon le besoin.
            </Paragraph>
          </div>
          <div className="parentado-cta-actions">
            <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => openInscription()}>
              Commencer
            </Button>
            <Button size="large" onClick={() => navigate('/#contact')}>
              Contacter l'équipe
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EspaceParentAdo;
