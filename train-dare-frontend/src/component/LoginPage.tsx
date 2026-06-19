import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;

/**
 * Page de connexion admin. Après succès, redirection vers /editeur ou returnTo.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const returnTo = (location.state as { from?: { pathname: string } })?.from?.pathname || '/editeur';

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const ok = await login(values.username.trim(), values.password);
      if (ok) {
        message.success('Connexion réussie.');
        navigate(returnTo, { replace: true });
      } else {
        message.error('Identifiants incorrects.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Card style={{ maxWidth: 400, width: '100%' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
          Connexion administration
        </Title>
        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
          Accès réservé aux administrateurs
        </Paragraph>
        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Identifiant requis' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Identifiant" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Mot de passe requis' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Se connecter
            </Button>
          </Form.Item>
        </Form>
        <Button type="link" block onClick={() => navigate('/blog')}>
          Retour au blog
        </Button>
      </Card>
    </div>
  );
};

export default LoginPage;
