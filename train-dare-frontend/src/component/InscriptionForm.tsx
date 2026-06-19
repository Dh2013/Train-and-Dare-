import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, message, Alert } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { inscriptionsApi } from '../api/inscriptions';
import { programsApi, type Univers, type Programme } from '../api/programs';

const { Paragraph } = Typography;
const { TextArea } = Input;

interface InscriptionFormProps {
  /** Programme présélectionné (slug ou id) */
  programmeId?: string;
  programmeTitre?: string;
  onSuccess?: () => void;
}

/**
 * Formulaire de candidature / inscription à un programme Train&Dare.
 * Si programmeId est fourni (route ou query), le champ programme est prérempli et optionnellement verrouillé.
 */
const InscriptionForm: React.FC<InscriptionFormProps> = ({
  programmeId: initialProgrammeId,
  programmeTitre,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programmeFromQuery = searchParams.get('programme') || searchParams.get('programmeId') || initialProgrammeId;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [programmes, setProgrammes] = useState<{ id: string; slug: string; titre: string; universTitre: string }[]>([]);

  useEffect(() => {
    programsApi.list().then(({ data: univers }) => {
      const flat: { id: string; slug: string; titre: string; universTitre: string }[] = [];
      (univers as Univers[]).forEach((u) => {
        u.programmes.forEach((p: Programme) => {
          flat.push({ id: p.id, slug: p.slug, titre: p.titre, universTitre: u.titre });
        });
      });
      setProgrammes(flat);
      if (programmeFromQuery && flat.length) {
        const found = flat.find((p) => p.id === programmeFromQuery || p.slug === programmeFromQuery);
        if (found) form.setFieldValue('programmeId', found.id);
      }
    }).catch(() => setProgrammes([]));
  }, [programmeFromQuery, form]);

  const onFinish = async (values: Record<string, string>) => {
    const programmeId = values.programmeId?.trim();
    if (!programmeId) {
      message.warning('Veuillez choisir un programme.');
      return;
    }
    setLoading(true);
    try {
      await inscriptionsApi.submit({
        programmeId,
        programmeSlug: programmes.find((p) => p.id === programmeId)?.slug,
        nom: values.nom.trim(),
        email: values.email.trim(),
        trancheAge: values.trancheAge?.trim() || undefined,
        telephone: values.telephone?.trim() || undefined,
        message: values.message?.trim() || undefined,
      });
      message.success('Votre demande d\'inscription a bien été enregistrée. Nous vous recontacterons sous 48 h.');
      form.resetFields();
      onSuccess?.();
      navigate('/programmes');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      message.error(String(msg || 'Erreur lors de l\'envoi. Réessayez ou contactez-nous.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Demande d'inscription à un programme" className="max-w-xl mx-auto">
      {programmeTitre && (
        <Alert message={`Programme : ${programmeTitre}`} type="info" showIcon className="mb-4" />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="programmeId"
          label="Programme"
          rules={[{ required: true, message: 'Choisissez un programme' }]}
        >
          <Select
            placeholder="Sélectionnez un programme"
            showSearch
            optionFilterProp="label"
            options={programmes.map((p) => ({ value: p.id, label: `${p.titre} (${p.universTitre})` }))}
            disabled={!!programmeFromQuery && programmes.some((p) => p.id === programmeFromQuery || p.slug === programmeFromQuery)}
          />
        </Form.Item>
        <Form.Item name="nom" label="Nom complet" rules={[{ required: true, message: 'Requis' }]}>
          <Input placeholder="Votre nom" maxLength={200} />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email valide requis' }]}>
          <Input type="email" placeholder="votre@email.com" maxLength={254} />
        </Form.Item>
        <Form.Item name="trancheAge" label="Tranche d'âge (pour les programmes Ado-preneur)">
          <Select placeholder="Optionnel" allowClear options={[
            { value: '13-18', label: '13-18 ans' },
            { value: '19-25', label: '19-25 ans' },
            { value: 'parent', label: 'Parent' },
            { value: 'enseignant', label: 'Enseignant / Éducateur' },
          ]} />
        </Form.Item>
        <Form.Item name="telephone" label="Téléphone">
          <Input placeholder="Optionnel" maxLength={30} />
        </Form.Item>
        <Form.Item name="message" label="Message">
          <TextArea rows={4} placeholder="Précisez votre projet ou votre demande (optionnel)" maxLength={2000} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Envoyer ma demande
          </Button>
        </Form.Item>
      </Form>
      <Paragraph type="secondary" className="text-sm">
        En soumettant ce formulaire, vous acceptez d'être recontacté par Train&amp;Dare Academy dans le cadre de votre demande d'inscription.
      </Paragraph>
    </Card>
  );
};

export default InscriptionForm;
