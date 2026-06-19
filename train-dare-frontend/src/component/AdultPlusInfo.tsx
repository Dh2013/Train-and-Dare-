import React from "react";
import { Card, Row, Col, Typography, List, Collapse, Button } from "antd";
import {
  ContainerOutlined,
  CheckCircleOutlined,
  FundOutlined,
  PieChartOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

type AdultPlusInfoProps = {
  onEnroll?: () => void;
  onContact?: () => void;
};

const AdultPlusInfo: React.FC<AdultPlusInfoProps> = ({ onEnroll, onContact }) => {
  const bullets = [
    "Construire un business model solide (méthodes Lean Canvas & Business Model Canvas).",
    "Valider l’idée via étude de marché et tests de faisabilité (prototypage rapide).",
    "Développer une stratégie marketing et digitale (positionnement, acquisition, rétention).",
    "Acquérir des notions de gestion financière, bookkeeping et options de financement (crowdfunding, subventions, investisseurs).",
    "Travailler la posture entrepreneuriale, leadership, prise de décision et résilience.",
  ];

  return (
    <Card variant="outlined" style={{ borderRadius: 12 }}>
      <Row gutter={[24, 24]} align="top">
        <Col xs={24} md={16}>
          <Title level={3} style={{ marginBottom: 8 }}>
            🟡 Adultes – <Text strong>Formation Entrepreneuriale</Text>
          </Title>
          <Text type="secondary">Structuration | Validation | Croissance</Text>

          <Paragraph style={{ marginTop: 16 }}>
            La formation entrepreneuriale pour adultes accompagne les porteurs de projets, indépendants et
            professionnels en reconversion pour transformer une idée en projet viable. Le parcours est pratique,
            progressif et adapté au rythme de chacun.
          </Paragraph>

          <Collapse defaultActiveKey={["1"]} ghost>
            <Panel header="Principaux axes d'accompagnement" key="1">
              <List
                itemLayout="horizontal"
                dataSource={bullets}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CheckCircleOutlined style={{ fontSize: 18 }} />}
                      description={item}
                    />
                  </List.Item>
                )}
              />
            </Panel>

            <Panel header="Démarche pédagogique" key="2">
              <List>
                <List.Item>
                  <ContainerOutlined />{" "}
                  <Text style={{ marginLeft: 8 }}>Ateliers pratiques (lean tests, MVP, prototypes)</Text>
                </List.Item>
                <List.Item>
                  <PieChartOutlined />{" "}
                  <Text style={{ marginLeft: 8 }}>
                    Outils d’analyse (Lean Canvas, Business Model Canvas, études de marché)
                  </Text>
                </List.Item>
                <List.Item>
                  <FundOutlined />{" "}
                  <Text style={{ marginLeft: 8 }}>
                    Sessions sur financement (crowdfunding, subventions, pitch investisseurs)
                  </Text>
                </List.Item>
                <List.Item>
                  <UserSwitchOutlined />{" "}
                  <Text style={{ marginLeft: 8 }}>Coaching individuel et mentoring par des entrepreneurs</Text>
                </List.Item>
              </List>
            </Panel>

            <Panel header="Résultats attendus" key="3">
              <Paragraph>
                <Text strong>Objectif :</Text> passer de l’idée à la concrétisation — plan d’action clair, prototype
                testé, piste(s) de financement identifiée(s) et pitch prêt. Un accompagnement personnalisé et l’accès
                à un réseau d’experts complètent la formation.
              </Paragraph>
            </Panel>
          </Collapse>

          <div style={{ marginTop: 18 }}>
            <Button type="primary" onClick={onEnroll}>
              Je m'inscris
            </Button>
            <Button style={{ marginLeft: 12 }} onClick={onContact}>
              Demander plus d'infos
            </Button>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <Card type="inner" title="Format & Info rapide" headStyle={{ fontWeight: 600 }} variant="outlined">
            <List size="small" split={false}>
              <List.Item>
                <Text strong>Durée :</Text> <Text style={{ marginLeft: 8 }}>Parcours modulaires (6–20 semaines)</Text>
              </List.Item>
              <List.Item>
                <Text strong>Format :</Text> <Text style={{ marginLeft: 8 }}>Ateliers, jury, coaching 1:1</Text>
              </List.Item>
              <List.Item>
                <Text strong>Sortie :</Text> <Text style={{ marginLeft: 8 }}>Prototype, business plan succinct, pitch</Text>
              </List.Item>
              <List.Item>
                <Text strong>Public :</Text> <Text style={{ marginLeft: 8 }}>Adultes porteurs de projet</Text>
              </List.Item>
            </List>
          </Card>

          <Card style={{ marginTop: 16 }} variant="outlined">
            <Title level={5}>Pourquoi ce parcours ?</Title>
            <Paragraph style={{ marginBottom: 0 }}>
              Approche pragmatique qui réduit le risque entrepreneurial via itérations rapides, validation terrain et
              accompagnement opérationnel jusqu’à la levée de fonds ou le lancement commercial.
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default AdultPlusInfo;
