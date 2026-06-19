import React from 'react';
import { Row, Col, Button, Card, Typography, Carousel, Space } from 'antd';
import {  ArrowRightOutlined, RocketOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Acceuil.css';

// IMG
import img1 from '../assets/IMG_20220812_115832 (1).jpg';
import img2 from '../assets/IMG_20220812_093123 (2).jpg';
import img3 from '../assets/IMG_20220720_100200.jpg';
import img4 from '../assets/IMG_20231125_134053.jpg';
import img5 from '../assets/IMG_20240228_144718.jpg';
import img6 from '../assets/IMG_20240228_150738 (3).jpg';
import img7 from '../assets/WhatsApp Image 2025-07-12 à 16.59.10_cf9a6b07.jpg';
import img8 from '../assets/WhatsApp Image 2025-07-12 à 16.59.13_273332c0.jpg';



const { Title, Paragraph, Text } = Typography;

const testimonials = [
  { quote: "Train & Dare m'a donné la confiance pour lancer mon projet.", author: 'Amal, 17 ans' },
  { quote: "Approche concrète et humaine, très utile pour la reconversion.", author: 'Karim, 33 ans' },
  { quote: "Les ateliers m'ont aidé à structurer mon idée.", author: 'Leila, 21 ans' },
];

const Acceuil: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="acceuil-root">
      {/* Hero */}
      <section className="hero" style={{ padding: '96px 24px 40px' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                <Title className="hero-title">Train & Dare Academy</Title>
               
                <Paragraph className="hero-quote" style={{ marginTop: 12 }}>
                  « Train & Dare Academy accompagne les jeunes dans leur éveil entrepreneurial, et les adultes dans la concrétisation de leur projet. »
                </Paragraph>

                <Paragraph className="hero-desc">
                  Bienvenue — un centre innovant d’éducation et de formation en entrepreneuriat et développement personnel. Deux parcours : Éducation pour jeunes et Formation pour adultes.
                </Paragraph>

                <Space wrap style={{ marginTop: 20 }}>
                  <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/programmes')}>
                    Découvrir nos programmes
                  </Button>
                  </Space>

            

                <div style={{ display: 'flex', gap: 20, marginTop: 28, flexWrap: 'wrap' }}>
             
                 </div>
              </motion.div>
            </Col> 
            <Col xs={24} lg={12}>
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 1 }}
  >
    <div style={{ overflow: 'hidden', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
      <motion.div
        style={{
          display: 'flex',
          gap: 12,
          width: 'max-content'
        }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: 'linear'
        }}
      >
        {[img1, img2, img3, img4, img5, img6, img7, img8,
          img1, img2, img3, img4, img5, img6, img7, img8,
        ].map((img, i) => (
          <div key={i} style={{
            flex: '0 0 auto',
            width: 240,
            height: 160,
            borderRadius: 12,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        ))}
      </motion.div>
    </div>
  </motion.div>
</Col>
            
          </Row>
        </div>
      </section>

      {/* Programmes preview */}
      <section id="programmes-preview" className="programmes-preview" style={{ padding: '40px 24px', background: 'linear-gradient(180deg,#fbfdff,#f7f7ff)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 8 }}>Nous accompagnons deux publics </Title>
          

          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} md={12}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring' }}>
                <Card hoverable style={{ borderTop: '4px solid #1890ff', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <RocketOutlined style={{ color: '#1890ff', fontSize: 22 }} />
                    <Title level={4} style={{ margin: 0, color: '#0ea5e9' }}>🔵 Éducation Entrepreneuriale</Title>
                  </div>
                  <Paragraph style={{ marginTop: 12 }}>Ateliers ludiques, projets, PNL et mentorat pour stimuler l’initiative et la créativité des 12–25 ans.</Paragraph>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button onClick={() => navigate('/adult-plus-info')}>Plus d'info</Button>
                  </div>
                </Card>
                </motion.div>
            </Col>

            <Col xs={24} md={12}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring' }}>
                <Card hoverable style={{ borderTop: '4px solid #f59e0b', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ThunderboltOutlined style={{ color: '#f59e0b', fontSize: 22 }} />
                    <Title level={4} style={{ margin: 0, color: '#f59e0b' }}> Formation Entrepreneuriale</Title>
                  </div>
                  <Paragraph style={{ marginTop: 12 }}>Parcours structuré pour adultes : business model, validation, marketing, financement et posture entrepreneuriale.</Paragraph>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button type="primary" style={{ background: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => navigate('/adult-plus-info')}>Plus d'info</Button>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <Title level={3}>📣 Témoignages</Title>
          <Carousel autoplay dots>
            {testimonials.map((t, i) => (
              <div key={i}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 8px 30px rgba(2,6,23,0.04)' }}>
                  <Paragraph italic style={{ fontSize: 18 }}>"{t.quote}"</Paragraph>
                  <Text strong>{t.author}</Text>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '36px 24px', background: 'linear-gradient(90deg,#ffedd5,#fff7ed)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Un seul mot d'ordre : OSEZ ! </Title>
            <Text type="secondary">Découvrez nos espaces, nos méthodes et nos accompagnements.</Text>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default Acceuil;