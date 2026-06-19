// src/component/ProgramCard.tsx
import React from 'react';
import { Card, Typography, Tag, Button, Space } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface ProgramCardProps {
  title: string;
  subtitle: string;
  shortSummary: string;
  duration: string;
  price: string;
  color: string;
  icon: React.ReactNode;
  features: string[];
  buttonText: string;
  link: string; // route to detail page, ex: "/programmes/education"
  image?: string; // optional 3D image url or local import
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  title,
  subtitle,
  shortSummary,
  duration,
  price,
  color,
  icon,
  features,
  buttonText,
  link,
  image
}) => {
  const navigate = useNavigate();

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.18 }}>
      <Card
        className="h-full shadow-lg"
        style={{ borderTop: `4px solid ${color}`, borderRadius: 12 }}
        title={
          <Space>
            {icon}
            <span style={{ color, fontWeight: 600 }}>{title}</span>
          </Space>
        }
        extra={<Tag color={color}>{duration}</Tag>}
      >
        {/* optional 3D image */}
        {image ? (
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <img src={image} alt={`${title} image`} style={{ maxWidth: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }} />
          </div>
        ) : null}

        <Title level={5}>{subtitle}</Title>

        {/* short summary shown on the card */}
        <Paragraph ellipsis={{ rows: 3 }}>{shortSummary}</Paragraph>

        <Card type="inner" title="Points clés" size="small" style={{ marginBottom: 12 }}>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {features.map((f, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{f}</li>
            ))}
          </ul>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <Tag color={color} style={{ fontWeight: 600 }}>{price}</Tag>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="default"
              onClick={() => navigate(link)}
            >
              Lire plus
            </Button>
            <Button
              type="primary"
              style={{ background: color, borderColor: color }}
              onClick={() => navigate(link)}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProgramCard;


