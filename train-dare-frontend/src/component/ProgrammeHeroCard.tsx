/**
 * Carte « hero » pour la section Nos Programmes.
 * Utilisée pour les deux piliers : Éducation Entrepreneuriale (bleu) et Formation Entrepreneuriale (orange).
 * Design moderne, micro-interactions au survol, liens programme + blog.
 */
import React from 'react';
import { Button, Typography } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Programmes.css';

const { Title, Paragraph } = Typography;

export interface ProgrammeHeroCardProps {
  /** Variante visuelle : education (bleu) | formation (orange) */
  variant: 'education' | 'formation';
  /** Titre principal de la carte */
  title: string;
  /** Sous-titre ou cible (ex. "Pour adolescents et jeunes adultes") */
  subtitle: string;
  /** Citation / tagline du PDF */
  tagline: string;
  /** Objectifs ou contenu en liste */
  objectives: string[];
  /** Pour Éducation : les 3 espaces avec label et route */
  spaces?: { label: string; path: string }[];
  /** Route du bouton principal "Voir le programme complet / détaillé" */
  primaryPath: string;
  /** Libellé du bouton principal */
  primaryLabel: string;
  /** Lien secondaire vers le blog (texte + path) */
  blogLink?: { label: string; path: string };
  /** Icône ou emoji en tête de carte */
  icon?: React.ReactNode;
}

const ProgrammeHeroCard: React.FC<ProgrammeHeroCardProps> = ({
  variant,
  title,
  subtitle,
  tagline,
  objectives,
  spaces,
  primaryPath,
  primaryLabel,
  blogLink,
  icon,
}) => {
  const navigate = useNavigate();
  const isEducation = variant === 'education';
  const color = isEducation ? '#1890ff' : '#fa8c16';
  const colorLight = isEducation ? 'var(--color-education-light)' : 'var(--color-formation-light)';

  return (
    <motion.article
      className={`programme-hero-card programme-hero-card--${variant}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      style={{
        background: colorLight,
        border: `1px solid ${isEducation ? 'rgba(24,144,255,0.2)' : 'rgba(250,140,22,0.2)'}`,
      }}
    >
      <div className="programme-hero-card__accent" style={{ background: color }} />
      <div className="programme-hero-card__body">
        <div className="flex items-center gap-2 mb-2">
          {icon && <span className="text-2xl" aria-hidden>{icon}</span>}
          <Title level={4} style={{ margin: 0, color }}>{title}</Title>
        </div>
        <Paragraph strong className="mb-1" style={{ color: '#333', fontSize: '0.95rem' }}>
          {subtitle}
        </Paragraph>
        <Paragraph className="programme-hero-card__tagline" style={{ color: '#555' }}>
          « {tagline} »
        </Paragraph>

        <ul className="programme-hero-card__objectives" style={{ color: '#444' }}>
          {objectives.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>

        {spaces && spaces.length > 0 && (
          <div className="programme-hero-card__spaces">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-75 mr-1 self-center">Les 3 espaces :</span>
            {spaces.map((s) => (
              <a
                key={s.path}
                href={s.path}
                className="programme-hero-card__space-chip"
                style={{ background: color, color: '#fff' }}
                onClick={(e) => { e.preventDefault(); navigate(s.path); }}
              >
                {s.label}
              </a>
            ))}
          </div>
        )}

        <div className="programme-hero-card__actions">
          <Button
            type="primary"
            size="large"
            style={{ background: color, borderColor: color }}
            onClick={() => navigate(primaryPath)}
          >
            {primaryLabel}
          </Button>
          {blogLink && (
            <a
              href={blogLink.path}
              className="programme-hero-card__link-secondary"
              style={{ color }}
              onClick={(e) => { e.preventDefault(); navigate(blogLink.path); }}
            >
              {blogLink.label}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default ProgrammeHeroCard;
