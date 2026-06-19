import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InscriptionForm from './InscriptionForm';
import { programsApi } from '../api/programs';
import type { Programme } from '../api/programs';

const { Title, Paragraph } = Typography;

/**
 * Page d'inscription à un programme.
 * Route : /inscription ou /inscription/:programmeSlug
 * Si programmeSlug est fourni, le formulaire pré-sélectionne ce programme.
 */
const InscriptionPage: React.FC = () => {
  const { programmeSlug } = useParams<{ programmeSlug?: string }>();
  const navigate = useNavigate();
  const [programmeTitre, setProgrammeTitre] = useState<string | undefined>();

  useEffect(() => {
    if (!programmeSlug) return;
    programsApi.get(programmeSlug).then(({ data }) => {
      const prog = data as Programme & { univers?: { titre: string } };
      if (prog?.titre) setProgrammeTitre(prog.titre);
    }).catch(() => setProgrammeTitre(undefined));
  }, [programmeSlug]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-4">
        Retour
      </Button>
      <Title level={3}>S'inscrire à un programme</Title>
      <Paragraph className="mb-6">
        Remplissez le formulaire ci-dessous. Nous vous recontacterons sous 48 h pour confirmer votre inscription ou vous orienter.
      </Paragraph>
      <InscriptionForm
        programmeId={programmeSlug}
        programmeTitre={programmeTitre}
        onSuccess={() => navigate('/programmes')}
      />
    </div>
  );
};

export default InscriptionPage;
