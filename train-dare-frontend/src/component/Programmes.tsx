/**
 * Section « Nos Programmes » – Train&Dare
 * Deux cartes principales (Éducation Entrepreneuriale | Formation Entrepreneuriale)
 * + Workshops en complément + liens vers espaces Parent & Ado, Enseignants, Inscription.
 * Aligné sur le document « Page 3 NOS PROGRAMMES » (design bleu/orange, taglines, 3 espaces).
 */
import React from 'react';
import { Typography, Row, Col, Button } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, ReadOutlined, TeamOutlined } from '@ant-design/icons';
import ProgrammeHeroCard from './ProgrammeHeroCard';
import ProgramCard from './ProgramCard';
import './Programmes.css';

const { Title, Paragraph } = Typography;

const Programmes: React.FC = () => {
  const navigate = useNavigate();

  /* Données des deux piliers (PDF Page 3 NOS PROGRAMMES) */
  const educationCard = {
    variant: 'education' as const,
    title: "Éducation entrepreneuriale",
    subtitle: "Pour adolescents et jeunes adultes",
    tagline: "Planter la graine entrepreneuriale dès l'adolescence pour cultiver un avenir audacieux.",
    objectives: [
      "Stimuler l'esprit d'initiative",
      "Développer la confiance en soi et l'autonomie",
      "Aider les jeunes à faire des choix éclairés",
      "Initier à la gestion de projet, à la créativité et à l'innovation",
    ],
    spaces: [
      { label: "Ado'preneur", path: "/programmes/education" },
      { label: "Parents", path: "/programmes/parent-ado" },
      { label: "Enseignants", path: "/programmes/enseignants" },
    ],
    primaryPath: "/programmes/education",
    primaryLabel: "Voir le programme complet",
    blogLink: { label: "Blog : Neurosciences & Adolescence", path: "/blog" },
    icon: "👧",
  };

  const formationCard = {
    variant: 'formation' as const,
    title: "Formation en entrepreneuriat",
    subtitle: "Pour adultes et porteurs de projets",
    tagline: "Transformer ses idées en projet. Devenir acteur de sa vie professionnelle.",
    objectives: [
      "Idéation, design thinking et reconnaissance d'opportunité",
      "Étude de marché, BMC et business plan",
      "Soft skills et compétences entrepreneuriales",
      "Marketing, négociation et accompagnement au financement / pitch",
    ],
    primaryPath: "/programmes/formation",
    primaryLabel: "Voir le programme détaillé",
    blogLink: { label: "Blog : entrepreneuriat comme parcours de transformation", path: "/blog" },
    icon: "👨‍🏫",
  };

  /* Carte complémentaire Workshops (existant conservé) */
  const workshopsProgram = {
    id: 'workshops',
    title: "Workshops Intensifs",
    subtitle: "🎯 Sessions Spécialisées",
    shortSummary: "Sessions courtes et intensives (2-3 jours) pour acquérir des compétences ciblées : marketing digital, pitch, leadership et innovation.",
    duration: "2-3 jours",
    price: "Sur mesure",
    color: "#52c41a",
    icon: <TeamOutlined style={{ color: '#52c41a' }} />,
    features: ["Marketing Digital", "Pitch & Communication", "Leadership", "Innovation & Créativité"],
    buttonText: "Voir les Workshops",
    link: "/programmes/workshops",
  };

  return (
    <section className="programmes-section min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-12 px-4 md:py-16 md:px-8" id="programmes">
      {/* Hero */}
      <motion.header
        className="text-center mb-12 md:mb-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title className="!text-3xl md:!text-4xl !font-bold !mb-2" style={{ letterSpacing: '-0.02em' }}>
          Nos Programmes
        </Title>
        <Paragraph className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Deux parcours pour oser entreprendre : éducation dès l'adolescence et formation pour adultes porteurs de projets.
        </Paragraph>
      </motion.header>

      {/* Deux cartes principales côte à côte (PDF) */}
      <div className="max-w-6xl mx-auto mb-14 md:mb-18">
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} lg={12}>
            <ProgrammeHeroCard {...educationCard} />
          </Col>
          <Col xs={24} lg={12}>
            <ProgrammeHeroCard {...formationCard} />
          </Col>
        </Row>
      </div>

      {/* Workshops – complément (existant conservé) */}
      <motion.div
        className="max-w-6xl mx-auto mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        <Title level={4} className="text-center !mb-6 text-gray-700">
          En complément
        </Title>
        <Row justify="center">
          <Col xs={24} md={12} lg={8}>
            <ProgramCard
              title={workshopsProgram.title}
              subtitle={workshopsProgram.subtitle}
              shortSummary={workshopsProgram.shortSummary}
              duration={workshopsProgram.duration}
              price={workshopsProgram.price}
              color={workshopsProgram.color}
              icon={workshopsProgram.icon}
              features={workshopsProgram.features}
              buttonText={workshopsProgram.buttonText}
              link={workshopsProgram.link}
            />
          </Col>
        </Row>
      </motion.div>

      {/* Liens vers espaces et inscription */}
      <motion.div
        className="text-center max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Paragraph className="text-gray-600 mb-4">Découvrez aussi nos autres espaces et inscrivez-vous.</Paragraph>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            icon={<UserOutlined />}
            onClick={() => navigate('/programmes/parent-ado')}
            size="large"
            className="transition-all hover:scale-[1.02]"
          >
            Espace Parent & Ado
          </Button>
          <Button
            icon={<ReadOutlined />}
            onClick={() => navigate('/programmes/enseignants')}
            size="large"
            className="transition-all hover:scale-[1.02]"
          >
            Espace Enseignants
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/inscription')}
            size="large"
            className="transition-all hover:scale-[1.02]"
          >
            S'inscrire à un programme
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default Programmes;
