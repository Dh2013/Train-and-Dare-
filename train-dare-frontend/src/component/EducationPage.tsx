import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Row, Skeleton, Tag, Typography } from 'antd';
import { motion } from 'framer-motion';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CompassOutlined,
  HeartOutlined,
  PlayCircleOutlined,
  ReadOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { programsApi, type Programme, type Univers } from '../api/programs';
import Seo from './Seo';
import heroYouth from '../assets/IMG_20220812_093123 (2).jpg';
import heroWorkshop from '../assets/IMG_20231125_134053.jpg';
import heroSupport from '../assets/IMG_20240228_144718.jpg';
import './EducationPage.css';

const { Paragraph, Text, Title } = Typography;

const FALLBACK_UNIVERS: Univers = {
  id: 'univers-ado-preneur',
  slug: 'ado-preneur',
  titre: 'Espace Ado-preneur',
  sousTitre: "Accompagner les jeunes de 13 à 25 ans vers l'entrepreneuriat",
  description:
    'Ateliers pratiques, projets concrets, coaching, PNL et neurosciences, éducation financière et communauté apprenante.',
  programmes: [
    {
      id: 'prog-education-ado',
      slug: 'education-entrepreneuriat-ado',
      titre: "Éducation à l'entrepreneuriat pour Ados et jeunes adultes",
      public: '13-18 ans et 19-25 ans',
      duree: '48 h sur 6 mois (octobre à avril)',
      objectifs: [
        "Esprit d'entreprendre : initiative, confiance, communication, travail d'équipe, pensée critique",
        "Esprit d'entreprise : idéation, design thinking, BMC, négociation",
      ],
      lienInscription: 'education-entrepreneuriat-ado',
    },
    {
      id: 'prog-pnl-ado',
      slug: 'pnl-ados-inside-out',
      titre: 'PNL pour Ados – Programme Inside Out',
      public: '13-25 ans',
      duree: '5 modules sur 5 semaines ou format intensif 5 jours',
      objectifs: [
        'Je me découvre (VAKOG, valeurs, talents)',
        'Je transforme mes pensées (croyances limitantes, estime de soi)',
        'Je communique avec impact (assertivité, pitch)',
        'Je me fixe un cap et j’agis (SMART, projet)',
        'Je deviens entrepreneur de ma vie (identité, vision)',
      ],
      lienInscription: 'pnl-ados-inside-out',
    },
    {
      id: 'prog-edu-financiere',
      slug: 'education-financiere-ado',
      titre: 'Éducation financière pour Ados et jeunes adultes',
      public: '13-25 ans',
      duree: 'Module dédié',
      objectifs: [
        'Comprendre les sources de financement',
        'Établir un budget',
        'Gérer ses ressources en autonomie',
      ],
      lienInscription: 'education-financiere-ado',
    },
    {
      id: 'prog-bootcamp',
      slug: 'bootcamp-vacances',
      titre: 'Stage vacances (Bootcamp)',
      public: '13-25 ans',
      duree: 'Format stage intensif',
      objectifs: [
        'Projets concrets',
        'Leadership, créativité, coopération',
        "Passer de l'idée à la réalisation",
      ],
      lienInscription: 'bootcamp-vacances',
    },
  ],
};

const impactPillars = [
  {
    icon: <RocketOutlined />,
    title: 'Esprit d’initiative',
    body: 'Les jeunes apprennent à transformer une idée en action claire, avec plus d’autonomie et de confiance.',
  },
  {
    icon: <HeartOutlined />,
    title: 'Confiance et expression',
    body: 'Le parcours développe l’estime de soi, la communication et la capacité à prendre la parole avec impact.',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Créativité et résolution',
    body: 'Design thinking, prototypage et pensée critique aident à explorer des solutions plutôt qu’à attendre.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Coopération et leadership',
    body: 'Le collectif est utilisé comme terrain d’apprentissage pour renforcer l’écoute, la contribution et la responsabilité.',
  },
];

const journeySteps = [
  {
    step: '01',
    title: 'Découvrir son potentiel',
    body: 'Identifier ses talents, ses valeurs, son mode de fonctionnement et ses leviers de motivation.',
  },
  {
    step: '02',
    title: 'Imaginer et structurer',
    body: 'Explorer des idées, comprendre les besoins, prototyper et apprendre à construire un projet simple.',
  },
  {
    step: '03',
    title: 'Présenter et convaincre',
    body: 'Développer son pitch, sa présence, sa clarté et sa capacité à expliquer une vision.',
  },
  {
    step: '04',
    title: 'Passer à l’action',
    body: 'Ancrer les apprentissages dans une posture durable, transférable à l’école, à la vie et aux futurs projets.',
  },
];

const ecosystemLinks = [
  {
    icon: <TeamOutlined />,
    title: 'Parents & ados',
    body: 'Impliquer la famille dans l’évolution du jeune avec un cadre plus constructif, sans pression inutile.',
    action: 'Découvrir l’espace',
    path: '/programmes/parent-ado',
  },
  {
    icon: <ReadOutlined />,
    title: 'Enseignants',
    body: 'Donner aux éducateurs des outils pour faire vivre l’esprit d’entreprendre en classe et en établissement.',
    action: 'Voir les ressources',
    path: '/programmes/enseignants',
  },
  {
    icon: <CompassOutlined />,
    title: 'Blog & ressources',
    body: 'Approfondir les sujets autour du mindset, de la PNL, du leadership et du développement jeunesse.',
    action: 'Lire le blog',
    path: '/blog',
  },
];

const EducationPage: React.FC = () => {
  const navigate = useNavigate();
  const [univers, setUnivers] = useState<Univers | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    programsApi
      .list('ado-preneur')
      .then(({ data }) => {
        if (cancelled) {
          return;
        }
        const educationUnivers = Array.isArray(data) && data.length > 0 ? data[0] : FALLBACK_UNIVERS;
        setUnivers(educationUnivers);
        setUsingFallback(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setUnivers(FALLBACK_UNIVERS);
        setUsingFallback(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const educationUnivers = univers ?? FALLBACK_UNIVERS;
  const featuredProgram = educationUnivers.programmes[0];
  const totalPrograms = educationUnivers.programmes.length;

  const totalObjectives = useMemo(
    () => educationUnivers.programmes.reduce((sum, program) => sum + program.objectifs.length, 0),
    [educationUnivers.programmes]
  );

  const openInscription = (program: Programme) => {
    navigate(`/inscription/${program.lienInscription || program.slug}`);
  };

  return (
    <div className="education-shell">
      <Seo
        title="Programme Éducation Entrepreneuriale"
        description="Une page premium pour découvrir le parcours d’éducation entrepreneuriale Train & Dare Academy destiné aux jeunes et adolescents."
        path="/programmes/education"
        type="website"
      />

      <div className="education-container">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/#programmes')}>
          Retour au site
        </Button>

        {usingFallback && (
          <Alert
            showIcon
            type="info"
            style={{ marginTop: 12 }}
            message="Contenu de secours affiché"
            description="Le serveur programme n’a pas répondu. La page affiche donc les données intégrées au frontend."
          />
        )}

        {loading ? (
          <div className="education-loading-card">
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
        ) : (
          <>
            <section className="education-hero">
              <div className="education-hero-grid">
                <motion.div
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55 }}
                >
                  <span className="education-kicker">Éducation entrepreneuriale</span>
                  <Title className="education-display">
                    Une page conçue pour donner envie aux jeunes d’oser, et rassurer les parents sur le sérieux du parcours.
                  </Title>
                  <Paragraph className="education-lead">
                    {educationUnivers.sousTitre}. Cette page met en avant une offre claire, premium et crédible pour les
                    jeunes, les familles et les partenaires éducatifs.
                  </Paragraph>

                  <div className="education-action-row">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ArrowRightOutlined />}
                      iconPosition="end"
                      onClick={() => featuredProgram && openInscription(featuredProgram)}
                    >
                      S’inscrire au parcours principal
                    </Button>
                    <Button size="large" onClick={() => navigate('/programmes/parent-ado')}>
                      Voir l’espace parents
                    </Button>
                  </div>

                  <div className="education-pill-row">
                    <span className="education-pill">13 à 25 ans</span>
                    <span className="education-pill">PNL & neurosciences</span>
                    <span className="education-pill">Ateliers, projets, coaching</span>
                    <span className="education-pill">Progression concrète</span>
                  </div>

                  <div className="education-stat-grid">
                    <div className="education-stat-card">
                      <Text className="education-stat-label">Programmes</Text>
                      <strong>{totalPrograms}</strong>
                    </div>
                    <div className="education-stat-card">
                      <Text className="education-stat-label">Compétences travaillées</Text>
                      <strong>{totalObjectives} axes</strong>
                    </div>
                    <div className="education-stat-card">
                      <Text className="education-stat-label">Positionnement</Text>
                      <strong>Jeunes, familles, écoles</strong>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="education-hero-visual"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="education-image-stack">
                    <div className="education-image education-image--main">
                      <img src={heroYouth} alt="Jeunes participant à un parcours entrepreneurial Train and Dare" />
                    </div>
                    <div className="education-image education-image--secondary">
                      <img src={heroWorkshop} alt="Atelier collectif Train and Dare Academy" />
                    </div>
                    <div className="education-floating-card">
                      <StarFilled />
                      <span>Un univers jeune, énergique et rassurant pour les familles</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            <section className="education-section">
              <div className="education-section-head">
                <span className="education-section-kicker">Promesse</span>
                <Title level={2} className="education-section-title">
                  Plus qu’un programme : un cadre pour faire émerger initiative, posture et vision.
                </Title>
                <Paragraph className="education-section-text education-section-text--center">
                  {educationUnivers.description}
                </Paragraph>
              </div>

              <Row gutter={[18, 18]}>
                {impactPillars.map((pillar) => (
                  <Col xs={24} md={12} key={pillar.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="education-impact-card">
                        <div className="education-impact-icon">{pillar.icon}</div>
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

            <section className="education-section education-section--soft">
              <div className="education-section-head">
                <span className="education-section-kicker">Programme</span>
                <Title level={2} className="education-section-title">
                  Une offre claire pour répondre à différents niveaux de maturité et d’ambition.
                </Title>
              </div>

              <Row gutter={[20, 20]}>
                {educationUnivers.programmes.map((program, index) => (
                  <Col xs={24} md={12} key={program.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                    >
                      <Card className="education-program-card" bordered={false}>
                        <div className="education-card-top">
                          <Tag color={index === 0 ? 'green' : 'blue'}>{program.public}</Tag>
                          <Tag>{program.duree}</Tag>
                        </div>

                        <Title level={4} className="education-card-title">
                          {program.titre}
                        </Title>

                        <div className="education-objective-list">
                          {program.objectifs.map((objective) => (
                            <div key={objective} className="education-objective-item">
                              <PlayCircleOutlined />
                              <span>{objective}</span>
                            </div>
                          ))}
                        </div>

                        <div className="education-card-actions">
                          <Button onClick={() => navigate('/blog')}>Voir les ressources</Button>
                          <Button type="primary" onClick={() => openInscription(program)}>
                            S’inscrire
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </section>

            <section className="education-section">
              <div className="education-grid-two">
                <div className="education-journey-card">
                  <span className="education-section-kicker">Parcours d’apprentissage</span>
                  <Title level={2} className="education-section-title">
                    Une progression pensée pour sécuriser l’évolution du jeune.
                  </Title>

                  <div className="education-journey-list">
                    {journeySteps.map((step) => (
                      <div key={step.step} className="education-journey-step">
                        <div className="education-step-index">{step.step}</div>
                        <div>
                          <strong>{step.title}</strong>
                          <p>{step.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="education-proof-card">
                  <img src={heroSupport} alt="Accompagnement pédagogique Train and Dare Academy" />
                  <div className="education-proof-body">
                    <span className="education-mini-kicker">Pourquoi cette page inspire confiance</span>
                    <Title level={3} className="education-section-title">
                      Un langage plus haut de gamme, sans perdre l’énergie jeunesse.
                    </Title>
                    <Paragraph className="education-section-text">
                      Le design valorise l’académie comme une structure sérieuse, claire et différenciante. Il aide les
                      parents à comprendre la qualité du cadre, tout en restant inspirant pour les jeunes.
                    </Paragraph>
                    <div className="education-proof-points">
                      <span><SafetyCertificateOutlined /> Positionnement crédible pour familles et partenaires</span>
                      <span><RocketOutlined /> Univers dynamique, orienté action et progrès</span>
                      <span><CompassOutlined /> Parcours lisible, bénéfices concrets et CTA nets</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="education-section education-section--dark">
              <div className="education-section-head">
                <span className="education-section-kicker education-section-kicker--light">Écosystème</span>
                <Title level={2} className="education-section-title education-section-title--light">
                  Le jeune n’avance pas seul : la page relie naturellement parents, enseignants et ressources.
                </Title>
              </div>

              <Row gutter={[18, 18]}>
                {ecosystemLinks.map((item) => (
                  <Col xs={24} md={8} key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="education-ecosystem-card">
                        <div className="education-ecosystem-icon">{item.icon}</div>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                        <Button type="link" onClick={() => navigate(item.path)}>
                          {item.action}
                        </Button>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </section>

            <section className="education-section">
              <div className="education-cta-card">
                <div>
                  <span className="education-section-kicker">Passage à l’action</span>
                  <Title level={2} className="education-section-title">
                    Donner à un jeune l’envie d’oser commence par lui offrir le bon cadre.
                  </Title>
                  <Paragraph className="education-section-text">
                    Le programme principal aide les adolescents et jeunes adultes à développer initiative, confiance,
                    communication, créativité et posture entrepreneuriale dans un environnement humain et structuré.
                  </Paragraph>
                </div>

                <div className="education-cta-actions">
                  {featuredProgram && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<ArrowRightOutlined />}
                      iconPosition="end"
                      onClick={() => openInscription(featuredProgram)}
                    >
                      S’inscrire maintenant
                    </Button>
                  )}
                  <Button size="large" onClick={() => navigate('/programmes/parent-ado')}>
                    Espace Parent & Ado
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default EducationPage;
