import React from 'react';
import { Typography, Collapse, Button } from 'antd';
import { QuestionCircleOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;
/* No need to declare Panel from 'antd' as it's not used directly. 
    The Collapse component uses the 'items' prop instead of children Panels. 
    You can safely remove any unused Panel import or declaration. */
const faqs = [
  {
    question: 'Quel est l\'âge minimum pour participer aux programmes ?',
    answer: 'Nos programmes Éducation Entrepreneuriale sont ouverts aux 13-25 ans. Les formations pour adultes n\'ont pas de limite supérieure.'
  },
  {
    question: 'Les programmes sont-ils en présentiel ou en ligne ?',
    answer: 'Un mélange hybride : ateliers en présentiel à Tunis et sessions en ligne via Zoom pour plus de flexibilité.'
  },
  {
    question: 'Y a-t-il des prérequis pour s\'inscrire ?',
    answer: 'Aucun prérequis ! Que vous soyez débutant ou en reconversion, notre approche est adaptée à tous les niveaux.'
  },
  {
    question: 'Comment sont calculés les prix des programmes ?',
    answer: 'Les tarifs varient de 297€ à 997€ selon la durée. Des forfaits et réductions pour groupes ou inscriptions anticipées sont disponibles.'
  },
  {
    question: 'Proposez-vous un suivi après la formation ?',
    answer: 'Oui ! Accès à une communauté alumni et sessions de coaching gratuites pendant 3 mois post-formation.'
  },
  {
    question: 'Comment contacter un coach pour une session personnalisée ?',
    answer: 'Utilisez notre formulaire de contact ou envoyez un email à contact@trainanddare.com pour une réponse sous 48h.'
  }
];

const FAQ: React.FC = () => {
  return (
    <section id="faq" style={{ padding: '80px 20px', backgroundColor: '#f0f8ff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title level={2} style={{ color: '#667eea', marginBottom: 24 }}>
            <QuestionCircleOutlined /> FAQ - Questions Fréquentes
          </Title>
          <Paragraph style={{ fontSize: '1.1rem', color: '#666', marginBottom: 48 }}>
            Trouvez des réponses rapides à vos questions sur nos programmes et services.
          </Paragraph>
        </motion.div>

        <Collapse
          accordion
          style={{ maxWidth: 800, margin: '0 auto' }}
          items={faqs.map((faq, index) => ({
            key: index,
            label: faq.question,
            children: <Paragraph style={{ color: '#475569' }}>{faq.answer}</Paragraph>
          }))}
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginTop: 48, textAlign: 'center' }}
        >
          <Paragraph style={{ color: '#666', marginBottom: 24 }}>
            Pas trouvé votre réponse ? Contactez-nous directement !
          </Paragraph>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              icon={<PhoneOutlined />}
              size="large"
              onClick={() => window.location.href = 'tel:+216XXXXXXXX'}
              style={{ backgroundColor: '#52c41a' }}
            >
              Appeler
            </Button>
            <Button
              type="default"
              icon={<MailOutlined />}
              size="large"
              onClick={() => window.location.href = 'mailto:contact@trainanddare.com'}
            >
              Envoyer un Email
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;