import { Typography, Row, Col, Card, Tag, List } from "antd";
import { HeartOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const coachingOffers = [
  {
    id: 1,
    icon: <HeartOutlined style={{ fontSize: 28, color: "#1890ff" }} />,
    color: "blue",
    title: "Coaching pour adolescents et jeunes adultes",
    subtitle: "Comprendre son fonctionnement mental pour mieux avancer",
    features: [
      "Estime de soi & confiance en soi",
      "Orientation scolaire & choix de vie",
      "Motivation et organisation",
      "Préparation aux projets entrepreneuriaux jeunes (esprit d'initiative)"
    ],
    bonus:
      "Approche fondée sur la PNL et les neurosciences pour expliquer le fonctionnement du cerveau adolescent",
    format: "Séances individuelles / ateliers collectifs / accompagnement parent-enfant",
    duration: "1h – forfaits possibles (3, 5 ou 8 séances)"
  }
];

const Coaching = () => {
  return (
    <section id="coaching" style={{ padding: "80px 20px", backgroundColor: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Title level={2} style={{ color: "#764ba2" }}>Coaching Personnalisé</Title>
          <Paragraph italic style={{ maxWidth: 700, margin: "0 auto", fontSize: 18, color: "#666" }}>
            "Un espace d'écoute, de clarté et d'élan pour oser le changement et réaliser son potentiel."
          </Paragraph>
        </div>

        {/* Introduction */}
        <div style={{ marginBottom: 64 }}>
          <Title level={3} style={{ textAlign: "center" }}>Introduction générale</Title>
          <Paragraph style={{ textAlign: "center", color: "#666", fontSize: 16, maxWidth: 800, margin: "0 auto" }}>
            Chez <strong style={{ color: "#1890ff" }}>Train & Dare Academy</strong>, nous croyons que chaque personne porte en elle un potentiel unique.
          </Paragraph>
          <Paragraph style={{ textAlign: "center", color: "#666", fontSize: 16, maxWidth: 800, margin: "0 auto" }}>
            Le coaching est un outil puissant pour <strong>se découvrir, se recentrer et passer à l'action</strong> dans un cadre bienveillant et structuré.
          </Paragraph>
          <Paragraph style={{ textAlign: "center", color: "#666", fontSize: 16, maxWidth: 800, margin: "0 auto" }}>
            Nos accompagnements sont <strong style={{ color: "#fa8c16" }}>personnalisés</strong> et adaptés à votre âge, vos besoins, et votre stade de développement personnel ou entrepreneurial.
          </Paragraph>
        </div>

        {/* Coaching Card */}
        {coachingOffers.map((offer) => (
          <Card
            key={offer.id}
            bordered={false}
            style={{ borderRadius: 16, marginBottom: 48, padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
          >
            <Row gutter={[32, 32]}>
              <Col xs={24} lg={6} style={{ textAlign: "center" }}>
                <div style={{ marginBottom: 16 }}>{offer.icon}</div>
                <Tag color={offer.color}>1. Coaching</Tag>
                <Title level={4} style={{ color: "#1890ff" }}>{offer.title}</Title>
                <Paragraph italic style={{ color: "#999" }}>{offer.subtitle}</Paragraph>
              </Col>
              <Col xs={24} lg={10}>
                <Title level={5}>Accompagnement sur :</Title>
                <List
                  size="small"
                  dataSource={offer.features}
                  renderItem={(item) => (
                    <List.Item style={{ paddingLeft: 0 }}>
                      <span style={{ color: "#666" }}>✓ {item}</span>
                    </List.Item>
                  )}
                />
              </Col>
              <Col xs={24} lg={8}>
                <div style={{ background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <strong style={{ color: "#52c41a" }}>Bonus :</strong>
                  <Paragraph>{offer.bonus}</Paragraph>
                </div>
                <div style={{ background: "#f5f5f5", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <strong>Format :</strong> <br /> {offer.format}
                </div>
                <div style={{ background: "#f5f5f5", borderRadius: 8, padding: 12 }}>
                  <strong>Durée :</strong> <br /> {offer.duration}
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Coaching;
