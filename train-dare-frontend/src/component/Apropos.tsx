import React from 'react';
import { Row, Col, Card, Typography, Button, Space, Divider } from 'antd';
import badge from '../assets/badge  najla formatrice. (1).jpg';
import cvPDF from '../assets/cv najla ben haj maouia formatrice CNFCPP.pdf';
import {
  TeamOutlined,
  ThunderboltOutlined,
  HeartFilled,
  AimOutlined,
  BulbOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './Apropos.css';

const { Title, Paragraph, Text } = Typography;

export const Apropos: React.FC = () => {
  const values = [
    {
      icon: <TeamOutlined style={{ fontSize: 28, color: 'var(--accent)' }} />,
      title: 'Autonomie',
      description: "Chacun a les ressources pour construire son avenir."
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 28, color: 'var(--accent)' }} />,
      title: 'Engagement',
      description: 'Se transformer pour transformer le monde.'
    },
    {
      icon: <HeartFilled style={{ fontSize: 28, color: 'var(--accent)' }} />,
      title: 'Humanité',
      description: 'Une approche bienveillante, centrée sur la personne.'
    },
    {
      icon: <AimOutlined style={{ fontSize: 28, color: 'var(--accent)' }} />,
      title: 'Courage',
      description: "Oser rêver, oser apprendre, oser entreprendre."
    },
    {
      icon: <BulbOutlined style={{ fontSize: 28, color: 'var(--accent)' }} />,
      title: 'Créativité',
      description: "Innover, tester, s'exprimer."
    }
  ];

  return (
    <section id="apropos" className="apropos-section">
      <div className="container">
        {/* === HERO SECTION === */}
        <motion.div
          className="apropos-hero"
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Row gutter={[24, 24]} align="middle">
            {/* === LEFT TEXT CONTENT === */}
            <Col xs={24} md={16}>
              <div className="hero-content">
                <Title level={1} className="hero-title">
                  Train & Dare Academy
                </Title>
                <Paragraph className="hero-sub">
                  Fondé par Najla Ben Haj Maouia — "On ne naît pas entrepreneur, on le devient. Et tout commence par un voyage intérieur."
                </Paragraph>

                <Paragraph className="hero-desc">
                  Nous croyons que chaque personne, quel que soit son âge, peut développer son potentiel entrepreneurial.
                  Notre approche mêle neurosciences, PNL, pédagogie active et coaching transformationnel pour accompagner chacun vers l’autonomie, la créativité et l’action.
                </Paragraph>

                <Divider />

                <Title level={2} className="section-title">Notre Vision</Title>
                <Text className="section-sub">
                  Un monde où chaque jeune et chaque adulte ose entreprendre sa vie, avec sens, audace et responsabilité.
                </Text>

                <Divider />

                <Title level={2} className="section-title">Notre Mission</Title>
                <Text className="section-sub">
                  Accompagner adolescents, jeunes adultes et adultes dans la réalisation de leurs objectifs de changement et
                  l’exploitation de leurs potentiels via neurosciences, PNL, pédagogie active et coaching transformationnel.
                </Text>

                <Space size="middle" className="hero-cta" style={{ marginTop: 24 }}>
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    href={cvPDF}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir le CV
                  </Button>
                </Space>
              </div>
            </Col>

            {/* === RIGHT BADGE IMAGE === */}
            <Col xs={24} md={8}>
              <motion.div
                className="badge-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center' }}
              >
                <img
                  src={badge}
                  alt="Badge Formateur CNFCPP"
                  style={{
                    maxWidth: '250px',
                    width: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* === VALUES SECTION === */}
        <motion.div
          className="values-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Title level={2} className="section-title">Nos Valeurs</Title>
          <Text className="section-sub">Les principes qui guident notre approche pédagogique</Text>

          <Row gutter={[20, 20]} className="values-grid" style={{ marginTop: 24 }}>
            {values.map((v, i) => (
              <Col xs={24} sm={12} md={8} lg={8} key={i}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <Card hoverable className="value-card" bordered={false}>
                    <div className="value-head">
                      <div className="value-icon">{v.icon}</div>
                      <Title level={4} className="value-title">{v.title}</Title>
                    </div>
                    <Paragraph className="value-desc">{v.description}</Paragraph>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>

        {/* === APPROACH SECTION === */}
        <motion.div
          className="approach-section"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="approach-card" bordered={false}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={16}>
                <Title level={3}>Notre Approche Unique</Title>
                <Paragraph>
                  Nous associons méthodes actives, neurosciences et outils de PNL pour travailler à la fois les compétences techniques
                  et la posture mentale. Nos formations comprennent ateliers pratiques, coaching, mentorat et ressources concrètes.
                </Paragraph>

                <ul className="approach-list">
                  <li>• Ateliers interactifs et pédagogie par projet</li>
                  <li>• Modules PNL & neurosciences pour le mindset</li>
                  <li>• Coaching individuel et mentoring post-formation</li>
                  <li>• Accès à une communauté d'entrepreneurs</li>
                </ul>
              </Col>

              <Col xs={24} md={8}></Col>
            </Row>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};