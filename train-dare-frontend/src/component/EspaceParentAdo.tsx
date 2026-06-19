import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, List, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { programsApi, type Univers, type Programme } from '../api/programs';

const { Title, Paragraph } = Typography;

/**
 * Page Espace Parent & Ado – Train&Dare.
 * Affiche les programmes dédiés aux parents (PDF : éducation familiale, softskills, PNL).
 */
const EspaceParentAdo: React.FC = () => {
  const navigate = useNavigate();
  const [univers, setUnivers] = useState<Univers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programsApi.list('parent-ado')
      .then(({ data }) => {
        const u = Array.isArray(data) && data.length ? data[0] : null;
        setUnivers(u as Univers | null);
      })
      .catch(() => setUnivers(null))
      .finally(() => setLoading(false));
  }, []);

  const programmes = univers?.programmes ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <Button type="text" onClick={() => navigate('/programmes')} className="mb-4">
          ← Retour aux programmes
        </Button>

        <div className="text-center mb-12">
          <Title level={2} className="!mb-2">
            <TeamOutlined className="mr-2" />
            Espace Parent & Ado
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Impliquer les parents dans l'aventure entrepreneuriale de leurs enfants
          </Paragraph>
        </div>

        {loading ? (
          <Card loading />
        ) : (
          <>
            {univers && (
              <Card className="mb-8" style={{ borderLeft: '4px solid #fa8c16' }}>
                <Paragraph className="text-base mb-0">{univers.description}</Paragraph>
              </Card>
            )}

            <Title level={4} className="mb-4">Choisir le programme</Title>
            <List
              itemLayout="vertical"
              dataSource={programmes}
              renderItem={(p: Programme) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      key="inscription"
                      onClick={() => navigate(`/inscription/${p.slug}`)}
                    >
                      S'inscrire
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<UserOutlined style={{ fontSize: 24, color: '#fa8c16' }} />}
                    title={p.titre}
                    description={
                      <div className="mt-2">
                        <Tag color="orange">{p.public}</Tag>
                        <Tag>{p.duree}</Tag>
                        {p.objectifs?.length > 0 && (
                          <ul className="mt-2 mb-0 pl-4 list-disc">
                            {p.objectifs.slice(0, 3).map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default EspaceParentAdo;
