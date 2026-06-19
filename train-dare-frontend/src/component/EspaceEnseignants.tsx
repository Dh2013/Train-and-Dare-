import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, List, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ReadOutlined, TeamOutlined } from '@ant-design/icons';
import { programsApi, type Univers, type Programme } from '../api/programs';

const { Title, Paragraph } = Typography;

/**
 * Page Espace Enseignants – Train&Dare.
 * Affiche les formations pour les éducateurs (PDF : pédagogie entrepreneuriale, softskills, PNL).
 */
const EspaceEnseignants: React.FC = () => {
  const navigate = useNavigate();
  const [univers, setUnivers] = useState<Univers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programsApi.list('enseignants')
      .then(({ data }) => {
        const u = Array.isArray(data) && data.length ? data[0] : null;
        setUnivers(u as Univers | null);
      })
      .catch(() => setUnivers(null))
      .finally(() => setLoading(false));
  }, []);

  const programmes = univers?.programmes ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 md:p-10">
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
            <ReadOutlined className="mr-2" />
            Espace Enseignants
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Former les guides de demain – Pédagogie entrepreneuriale et accompagnement en établissement
          </Paragraph>
        </div>

        {loading ? (
          <Card loading />
        ) : (
          <>
            {univers && (
              <Card className="mb-8" style={{ borderLeft: '4px solid #722ed1' }}>
                <Paragraph className="text-base mb-0">{univers.description}</Paragraph>
                <Paragraph className="text-sm text-gray-500 mt-2 mb-0">
                  Notre objectif : aider les enseignants à devenir des passeurs d'initiatives et à intégrer l'esprit d'entreprendre dans le quotidien scolaire.
                </Paragraph>
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
                    avatar={<TeamOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
                    title={p.titre}
                    description={
                      <div className="mt-2">
                        <Tag color="purple">{p.public}</Tag>
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

export default EspaceEnseignants;
