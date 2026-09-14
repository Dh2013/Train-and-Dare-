import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  MessageOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import InscriptionForm from './InscriptionForm';
import Seo from './Seo';
import { pageSeo } from '../seo/pages';
import { programsApi } from '../api/programs';
import type { Programme } from '../api/programs';
import inscriptionHero from '../assets/TRAIN&DARE ACADEMY 2.jpg';
import './InscriptionPage.css';

const { Paragraph, Title } = Typography;

const FAMILY_PROGRAM_SLUG = 'education-entrepreneuriale-familiale';

const proofItems = [
  {
    icon: <ClockCircleOutlined />,
    title: 'Réponse sous 48 h',
    text: 'Votre demande est relue pour vous orienter vers le bon parcours.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Jeunes, parents, adultes',
    text: 'Une inscription adaptée au profil, au besoin et au niveau de maturité.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Cadre sérieux',
    text: 'Vos informations servent uniquement au suivi de votre demande.',
  },
];

const familyProofItems = [
  {
    icon: <HeartOutlined />,
    title: 'Parent & ado alignés',
    text: 'Un échange pour comprendre le besoin familial et le niveau de maturité du jeune.',
  },
  {
    icon: <MessageOutlined />,
    title: 'Dialogue constructif',
    text: 'Une approche qui aide à parler confiance, orientation et projet sans pression.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Cadre confidentiel',
    text: 'Les informations servent uniquement à préparer le meilleur accompagnement.',
  },
];

const familySteps = [
  {
    icon: <BulbOutlined />,
    title: 'Comprendre le besoin',
    text: "Objectifs du parent, motivation de l'ado, difficultés ou envies à clarifier.",
  },
  {
    icon: <TeamOutlined />,
    title: 'Choisir le bon format',
    text: 'Atelier, échange familial, programme ado ou accompagnement sur mesure.',
  },
  {
    icon: <RocketOutlined />,
    title: "Préparer l'action",
    text: 'Un retour simple pour savoir quoi faire ensuite et comment avancer sereinement.',
  },
];

const InscriptionPage: React.FC = () => {
  const { programmeSlug } = useParams<{ programmeSlug?: string }>();
  const navigate = useNavigate();
  const [programmeTitre, setProgrammeTitre] = useState<string | undefined>();
  const isFamilyInscription = programmeSlug === FAMILY_PROGRAM_SLUG;
  const isEducationInscription = programmeSlug === 'education-entrepreneuriat-ado';
  const activeProofItems = isFamilyInscription ? familyProofItems : proofItems;

  useEffect(() => {
    if (!programmeSlug) {
      setProgrammeTitre(undefined);
      return;
    }

    let cancelled = false;

    programsApi
      .get(programmeSlug)
      .then(({ data }) => {
        if (cancelled) {
          return;
        }
        const programme = data as Programme & { univers?: { titre: string } };
        setProgrammeTitre(programme?.titre);
      })
      .catch(() => {
        if (!cancelled) {
          setProgrammeTitre(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [programmeSlug]);

  return (
    <div className="inscription-shell">
      <Seo {...pageSeo('/inscription')} />
      <div className="inscription-container">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="inscription-back"
          onClick={() => navigate('/#programmes')}
        >
          Retour aux programmes
        </Button>

        <section className={`inscription-hero${isFamilyInscription ? ' inscription-hero--family' : ''}`} style={isEducationInscription ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>
          <div className="inscription-hero-copy">
            <span className="inscription-kicker">
              {isFamilyInscription ? 'Programme familial' : 'Inscription'}
            </span>
            <Title level={1} className="inscription-display">
              {isFamilyInscription
                ? "Inscrire votre famille dans un accompagnement qui aide l'ado à oser."
                : 'Rejoindre un parcours Train & Dare Academy.'}
            </Title>
            <Paragraph className="inscription-lead">
              {isFamilyInscription
                ? "Laissez vos coordonnées et indiquez le besoin principal. L'équipe Train & Dare Academy vous recontacte pour proposer le format le plus adapté : atelier parent, parcours ado ou accompagnement familial."
                : "Choisissez le programme qui vous correspond, laissez vos coordonnées, et l'équipe vous recontacte pour confirmer les prochaines étapes."}
            </Paragraph>

            <div className="inscription-action-row">
              <Button
                type="primary"
                size="large"
                onClick={() => document.getElementById('inscription-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                {isFamilyInscription ? 'Remplir la demande familiale' : 'Remplir le formulaire'}
              </Button>
              <Button size="large" onClick={() => navigate('/#contact')}>
                Poser une question
              </Button>
            </div>

            <div className="inscription-proof-grid">
              {activeProofItems.map((item) => (
                <div className="inscription-proof-card" key={item.title}>
                  <div className="inscription-proof-icon">{item.icon}</div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {isFamilyInscription ? (
            <aside className="inscription-family-panel">
              <span className="inscription-family-label">Parcours sélectionné</span>
              <strong>Éducation entrepreneuriale familiale</strong>
              <p>
                Un format pensé pour aider les parents à soutenir le potentiel de leur adolescent avec plus de clarté,
                de confiance et de méthode.
              </p>
              <div className="inscription-family-tags">
                <span>Parents d'ados</span>
                <span>Sur mesure</span>
                <span>Dialogue & projet</span>
              </div>
              <div className="inscription-family-note">
                <CheckCircleOutlined />
                <span>Demande courte, suivi humain, orientation claire.</span>
              </div>
            </aside>
          ) : !isEducationInscription ? (
            <div className="inscription-hero-visual">
              <img src={inscriptionHero} alt="Groupe Train and Dare Academy" />
              <div className="inscription-visual-note">
                <CheckCircleOutlined />
                <span>Demande simple, suivi humain, orientation claire.</span>
              </div>
            </div>
          ) : null}
        </section>

        {isFamilyInscription && (
          <section className="inscription-family-steps" aria-label="Étapes de la demande familiale">
            {familySteps.map((step) => (
              <article className="inscription-family-step" key={step.title}>
                <div className="inscription-family-step-icon">{step.icon}</div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </article>
            ))}
          </section>
        )}

        <section
          id="inscription-form"
          className={`inscription-form-section${isFamilyInscription ? ' inscription-form-section--family' : ''}`}
        >
          <div className="inscription-form-intro">
            <span className="inscription-kicker">{isFamilyInscription ? 'Demande familiale' : 'Votre demande'}</span>
            <Title level={2} className="inscription-section-title">
              {isFamilyInscription
                ? 'Précisez le besoin, nous vous orientons vers le bon format.'
                : 'Quelques informations suffisent pour démarrer.'}
            </Title>
            <Paragraph className="inscription-section-text">
              {isFamilyInscription
                ? "Le formulaire reste simple : programme présélectionné, coordonnées, profil et message. L'échange de confirmation permettra d'affiner les détails."
                : "Le formulaire est volontairement court. Vous pourrez préciser les détails du parcours lors de l'échange de confirmation."}
            </Paragraph>
          </div>

          <InscriptionForm programmeId={programmeSlug} programmeTitre={programmeTitre} />
        </section>
      </div>
    </div>
  );
};

export default InscriptionPage;
