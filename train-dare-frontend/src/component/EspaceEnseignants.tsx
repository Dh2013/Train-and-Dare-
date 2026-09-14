import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Skeleton, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  ExperimentOutlined,
  MailOutlined,
  ProjectOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { programsApi, type Programme, type Univers } from '../api/programs';
import Seo from './Seo';
import { pageSeo } from '../seo/pages';
import teacherHero from '../assets/IMG_20231125_134053.jpg';
import workshopHero from '../assets/IMG_20240228_150738 (3).jpg';
import classroomHero from '../assets/IMG_20220720_100200.jpg';
import './EspaceEnseignants.css';

const { Paragraph, Text, Title } = Typography;

const FALLBACK_UNIVERS: Univers = {
  id: 'univers-enseignants',
  slug: 'enseignants',
  titre: 'Espace Enseignants',
  sousTitre: 'Former les guides de demain',
  description:
    "Formations pratiques, ressources clés en main et accompagnement pour intégrer l'esprit d'entreprendre dans le quotidien scolaire.",
  programmes: [
    {
      id: 'prog-pedago-entrepreneuriale',
      slug: 'formation-pedagogie-entrepreneuriale',
      titre: 'Formation en pédagogie entrepreneuriale',
      public: 'Enseignants, éducateurs',
      duree: 'Formation pratique',
      objectifs: [
        'Construire une pédagogie entrepreneuriale vivante en classe',
        'Utiliser des ressources clés en main',
        'Animer des clubs, défis et mini-projets',
      ],
      lienInscription: 'formation-pedagogie-entrepreneuriale',
    },
    {
      id: 'prog-softskills-enseignants',
      slug: 'softskills-pour-enseignant',
      titre: 'Softskills pour enseignant',
      public: 'Enseignants',
      duree: 'Ateliers',
      objectifs: [
        "Devenir passeur d'initiatives",
        "Intégrer l'esprit d'entreprendre au quotidien scolaire",
        'Développer communication, coopération et leadership de classe',
      ],
      lienInscription: 'softskills-pour-enseignant',
    },
    {
      id: 'prog-pnl-enseignants',
      slug: 'pnl-pour-enseignant',
      titre: 'PNL pour enseignant',
      public: 'Enseignants',
      duree: 'Modules dédiés',
      objectifs: [
        "Mieux accompagner les initiatives entrepreneuriales",
        'Comprendre motivation, confiance et blocages chez les jeunes',
        'Adapter sa communication aux profils des apprenants',
      ],
      lienInscription: 'pnl-pour-enseignant',
    },
  ],
};

const heroStats = [
  { label: 'Public', value: 'Enseignants & éducateurs' },
  { label: 'Terrain', value: 'Classe, clubs, ateliers' },
  { label: 'Finalité', value: 'Initiative & autonomie' },
];

const pillars = [
  {
    icon: <BulbOutlined />,
    title: 'Pédagogie active',
    body: "Transformer les apprentissages en défis, projets, pitchs et situations réelles qui donnent envie d'agir.",
  },
  {
    icon: <SolutionOutlined />,
    title: 'Ressources prêtes à utiliser',
    body: 'Structurer des séances, supports et activités que les enseignants peuvent intégrer sans repartir de zéro.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Posture facilitatrice',
    body: 'Accompagner les jeunes avec écoute, cadre, feedback et confiance, tout en gardant une dynamique de groupe claire.',
  },
];

const methodSteps = [
  {
    step: '01',
    title: 'Installer le cadre',
    body: 'Définir les objectifs, les rôles et les règles de coopération pour sécuriser le groupe.',
  },
  {
    step: '02',
    title: 'Lancer un défi',
    body: "Faire émerger des idées, des besoins et des solutions avec une pédagogie orientée action.",
  },
  {
    step: '03',
    title: 'Accompagner le projet',
    body: 'Aider les élèves à structurer, tester, communiquer et améliorer leurs propositions.',
  },
  {
    step: '04',
    title: 'Valoriser les acquis',
    body: "Relier le projet aux compétences : confiance, créativité, initiative, esprit critique et oralité.",
  },
];

const outcomes = [
  "Des ateliers plus dynamiques autour de l'entrepreneuriat",
  'Une meilleure posture de facilitation et de feedback',
  'Des ressources concrètes pour clubs et mini-projets',
  'Un pont naturel entre école, jeunes, parents et partenaires',
];

const EspaceEnseignants: React.FC = () => {
  const navigate = useNavigate();
  const [univers, setUnivers] = useState<Univers | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApiFallback, setHasApiFallback] = useState(false);

  useEffect(() => {
    let mounted = true;

    programsApi
      .list('enseignants')
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
    <div className="teachers-shell">
      <Seo {...pageSeo('/programmes/enseignants')} />

      <main className="teachers-container">
        <Button
          type="text"
          className="teachers-back"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/#programmes')}
        >
          Retour aux programmes
        </Button>

        <section className="teachers-hero">
          <motion.div
            className="teachers-hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="teachers-kicker">
              <ReadOutlined /> Espace enseignants
            </span>
            <Title level={1} className="teachers-display">
              Former des enseignants capables de faire naître l'initiative en classe.
            </Title>
            <Paragraph className="teachers-lead">{activeUnivers.description || FALLBACK_UNIVERS.description}</Paragraph>

            <div className="teachers-action-row">
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

            <div className="teachers-stat-grid">
              {heroStats.map((item) => (
                <div className="teachers-stat-card" key={item.label}>
                  <Text className="teachers-stat-label">{item.label}</Text>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="teachers-visual"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <div className="teachers-image-stack">
              <img className="teachers-image teachers-image--main" src={teacherHero} alt="Atelier pédagogique Train and Dare Academy" />
              <img className="teachers-image teachers-image--side" src={workshopHero} alt="Formation et accompagnement en atelier" />
              <div className="teachers-floating-note">
                <SafetyCertificateOutlined />
                <span>Une approche structurée pour animer, guider et valoriser les initiatives des jeunes.</span>
              </div>
            </div>
          </motion.div>
        </section>

        {hasApiFallback && (
          <Alert
            className="teachers-alert"
            type="info"
            showIcon
            message="La page utilise le contenu local Train & Dare Academy pour rester disponible."
          />
        )}

        <section className="teachers-section">
          <div className="teachers-section-head">
            <span className="teachers-section-kicker">Impact pédagogique</span>
            <Title level={2} className="teachers-section-title">
              Des outils pour rendre l'entrepreneuriat concret, vivant et accessible.
            </Title>
          </div>

          <div className="teachers-pillar-grid">
            {pillars.map((pillar, index) => (
              <motion.article
                className="teachers-pillar-card"
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="teachers-icon">{pillar.icon}</div>
                <strong>{pillar.title}</strong>
                <p>{pillar.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="teachers-section teachers-section--split">
          <div className="teachers-media-panel">
            <img src={classroomHero} alt="Jeunes en activité Train and Dare Academy" />
          </div>

          <div className="teachers-content-panel">
            <span className="teachers-section-kicker">
              <ProjectOutlined /> Clubs & mini-projets
            </span>
            <Title level={2} className="teachers-section-title">
              Faire de la classe un terrain d'expérimentation.
            </Title>
            <Paragraph className="teachers-section-text">
              Les formations enseignants aident à lancer des activités simples, structurées et motivantes : défis
              d'idéation, mini-projets, pitchs, clubs, ateliers soft skills et accompagnement des équipes d'élèves.
            </Paragraph>

            <div className="teachers-outcome-list">
              {outcomes.map((outcome) => (
                <span key={outcome}>
                  <CheckCircleOutlined /> {outcome}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="teachers-section teachers-section--soft">
          <div className="teachers-section-head">
            <span className="teachers-section-kicker">
              <ExperimentOutlined /> Méthode
            </span>
            <Title level={2} className="teachers-section-title">
              Une progression claire pour passer d'une idée de séance à un projet animé.
            </Title>
          </div>

          <div className="teachers-method-grid">
            {methodSteps.map((step) => (
              <article className="teachers-method-card" key={step.step}>
                <span>{step.step}</span>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="teachers-section" id="teachers-programmes">
          <div className="teachers-section-head teachers-section-head--row">
            <div>
              <span className="teachers-section-kicker">Programmes</span>
              <Title level={2} className="teachers-section-title">
                Choisir le programme enseignants
              </Title>
              <Paragraph className="teachers-section-text">
                Chaque module peut être adapté à un établissement, une équipe pédagogique, un club ou un programme
                jeunesse déjà existant.
              </Paragraph>
            </div>
            <Button size="large" icon={<CalendarOutlined />} onClick={() => navigate('/#contact')}>
              Demander un échange
            </Button>
          </div>

          {loading ? (
            <div className="teachers-program-grid">
              {[0, 1, 2].map((item) => (
                <div className="teachers-program-card" key={item}>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="teachers-program-grid">
              {programmes.map((program, index) => (
                <motion.article
                  className="teachers-program-card"
                  key={program.id || program.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                >
                  <div className="teachers-program-top">
                    <span className="teachers-program-number">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <Tag color="green">{program.public}</Tag>
                      <Tag>{program.duree}</Tag>
                    </div>
                  </div>

                  <Title level={3} className="teachers-card-title">
                    {program.titre}
                  </Title>

                  <div className="teachers-objectives">
                    {(program.objectifs ?? []).slice(0, 4).map((objective) => (
                      <span key={objective}>
                        <CheckCircleOutlined /> {objective}
                      </span>
                    ))}
                  </div>

                  <div className="teachers-card-actions">
                    <Button type="primary" onClick={() => openInscription(program)}>
                      S'inscrire
                    </Button>
                    <Button onClick={() => navigate('/#contact')}>Parler du besoin</Button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        <section className="teachers-cta">
          <div>
            <span className="teachers-section-kicker teachers-section-kicker--light">Prochaine étape</span>
            <Title level={2} className="teachers-cta-title">
              Installer l'esprit d'entreprendre dans votre établissement.
            </Title>
            <Paragraph className="teachers-cta-copy">
              Train & Dare Academy peut accompagner une équipe enseignante, un club, un atelier ponctuel ou un parcours
              complet selon vos objectifs.
            </Paragraph>
          </div>
          <div className="teachers-cta-actions">
            <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => openInscription()}>
              Commencer
            </Button>
            <Button size="large" onClick={() => navigate('/programmes/parent-ado')}>
              Voir Parent & Ado
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EspaceEnseignants;
