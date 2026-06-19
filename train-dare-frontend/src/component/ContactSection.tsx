import React, { useState } from 'react';
import { Button, Form, Input, Typography } from 'antd';
import { contactApi } from '../api/contact';
import type { ContactFormValues } from '../types/forms';

const { Title, Paragraph } = Typography;
const { Item } = Form;

const CONTACT_STYLE = {
  section: {
    padding: '80px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  wrapper: { maxWidth: 1200, margin: '0 auto' as const, textAlign: 'center' as const },
  form: {
    maxWidth: 600,
    margin: '0 auto' as const,
    background: 'rgba(255,255,255,0.1)',
    padding: '2rem',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
  },
  submitBtn: { background: '#fff', color: '#764ba2', fontWeight: 'bold' as const, border: 'none' as const },
  contactInfo: { marginTop: 32, textAlign: 'left' as const, opacity: 0.8 },
};

/**
 * Section contact de la page d'accueil : formulaire et coordonnées.
 */
const ContactSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form] = Form.useForm();

  const onFinish = async (values: ContactFormValues) => {
    setMessage(null);
    setLoading(true);
    try {
      await contactApi.send(values);
      setMessage({ type: 'success', text: 'Message envoyé ! Nous vous contacterons bientôt.' });
      form.resetFields();
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi. Réessayez ou contactez-nous par email.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" style={CONTACT_STYLE.section}>
      <div style={CONTACT_STYLE.wrapper}>
        <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>
          📧 Contactez-nous
        </Title>
        <Paragraph style={{ fontSize: '1.2rem', color: '#f0f0f0', marginBottom: 32 }}>
          Nous serons ravis de vous accompagner dans votre projet entrepreneurial !
        </Paragraph>
        <Form
          form={form}
          name="contact-form"
          onFinish={onFinish}
          style={CONTACT_STYLE.form}
        >
          <Item name="name" rules={[{ required: true, message: 'Nom requis' }]}>
            <Input placeholder="Votre nom" size="large" />
          </Item>
          <Item name="email" rules={[{ required: true, type: 'email', message: 'Email valide requis' }]}>
            <Input placeholder="Votre email" size="large" />
          </Item>
          <Item name="message" rules={[{ required: true, message: 'Message requis' }]}>
            <Input.TextArea placeholder="Votre message" rows={4} />
          </Item>
          <Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={CONTACT_STYLE.submitBtn}
            >
              Envoyer un message
            </Button>
          </Item>
        </Form>
        {message && (
          <Paragraph style={{ color: message.type === 'success' ? '#b7eb8f' : '#ffccc7', marginTop: 16 }}>
            {message.text}
          </Paragraph>
        )}
        <div style={CONTACT_STYLE.contactInfo}>
          <div><strong>📍 Adresse :</strong> Tunis, Tunisie</div>
          <div><strong>📞 Téléphone :</strong> +216 XX XXX XXX</div>
          <div><strong>✉️ Email :</strong> contact@trainanddare.com</div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
