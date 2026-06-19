

// Hero.jsx using React and Ant Design
import { ArrowRightOutlined, PlayCircleOutlined, StarFilled } from '@ant-design/icons';
import { Button, Typography, Row, Col, Tag, Statistic, Image, Card } from 'antd';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-image.jpg';

const { Title, Paragraph, Text } = Typography;

const Hero = () => {
  return (
    <section id="accueil" style={{ minHeight: '100vh', paddingTop: '80px', background: 'linear-gradient(to bottom right, #f0f2f5, #ffffff)' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
        <Row gutter={[48, 48]} align="middle">
          {/* Content */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Tag icon={<StarFilled />} color="#d3adf7" style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: 14 }}>
                Centre d'Excellence en Entrepreneuriat
              </Tag>
              <Title level={1} style={{ fontSize: '3rem', margin: '1rem 0' }}>
                <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Osez</span> entreprendre
                <br />
                <Text type="secondary" style={{ fontSize: '1.25rem' }}>et transformez votre avenir</Text>
              </Title>
              <Paragraph style={{ fontSize: '1.1rem', color: '#595959' }}>
                <strong>"Se former pour oser. Oser le changement. Oser entreprendre."</strong>
                <br />
                Train & Dare Academy accompagne les jeunes dans leur éveil entrepreneurial, et les adultes dans la concrétisation de leur projet.
              </Paragraph>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: 24 }}>
                <Button type="primary" size="large" icon={<ArrowRightOutlined />}>Découvrir nos programmes</Button>
                <Button type="default" size="large" icon={<PlayCircleOutlined />}>Voir notre approche</Button>
              </div>

              {/* Stats */}
              <Row gutter={32} style={{ marginTop: 40, borderTop: '1px solid #f0f0f0', paddingTop: 32 }}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Statistic title="Étudiants formés" value={500} valueStyle={{ color: '#667eea' }} suffix="+" />
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Statistic title="Taux de satisfaction" value={95} valueStyle={{ color: '#667eea' }} suffix="%" />
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Statistic title="Projets lancés" value={200} valueStyle={{ color: '#667eea' }} suffix="+" />
                </Col>
              </Row>
            </motion.div>
          </Col>

          {/* Image */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <Card
                cover={<Image preview={false} src={heroImage} alt="Formation entrepreneuriale moderne" style={{ height: 400, objectFit: 'cover' }} />}
                bordered={false}
                style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }}
              >
                <Tag color="#e6f7ff" style={{ position: 'absolute', top: 16, right: 16 }}>Innovation</Tag>
                <Tag color="#f6ffed" style={{ position: 'absolute', bottom: 16, left: 16 }}>Créativité</Tag>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default Hero;