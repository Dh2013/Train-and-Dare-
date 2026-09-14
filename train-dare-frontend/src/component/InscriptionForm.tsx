import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Checkbox, Form, Input, Select, Typography, message } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { inscriptionsApi } from '../api/inscriptions';
import { programsApi, type Programme, type Univers } from '../api/programs';
import { trackConversion } from '../lib/analytics';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

interface InscriptionFormProps {
  programmeId?: string;
  programmeTitre?: string;
}

interface ProgramOption {
  id: string;
  slug: string;
  lienInscription: string;
  titre: string;
  universTitre: string;
  public: string;
  duree: string;
}

interface InscriptionValues {
  programmeId: string;
  nom: string;
  email: string;
  trancheAge?: string;
  telephone?: string;
  preferredContact?: 'email' | 'phone' | 'whatsapp';
  message?: string;
  consentAccepted: boolean;
}

const ageOptions = [
  { value: '13-18', label: '13-18 ans' },
  { value: '19-25', label: '19-25 ans' },
  { value: 'parent', label: 'Parent' },
  { value: 'enseignant', label: 'Enseignant / éducateur' },
  { value: 'adulte', label: 'Adulte / porteur de projet' },
];

const contactOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Téléphone' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const buildProgramOptions = (univers: Univers[]): ProgramOption[] =>
  univers.flatMap((space) =>
    space.programmes.map((program: Programme) => ({
      id: program.id,
      slug: program.slug,
      lienInscription: program.lienInscription,
      titre: program.titre,
      universTitre: space.titre,
      public: program.public,
      duree: program.duree,
    }))
  );

const InscriptionForm: React.FC<InscriptionFormProps> = ({ programmeId: initialProgrammeId, programmeTitre }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<InscriptionValues>();
  const selectedProgrammeId = Form.useWatch('programmeId', form);
  const requestedProgramme =
    searchParams.get('programme') || searchParams.get('programmeId') || initialProgrammeId || undefined;

  const [loading, setLoading] = useState(false);
  const [programmesLoading, setProgrammesLoading] = useState(true);
  const [programmesError, setProgrammesError] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [programmes, setProgrammes] = useState<ProgramOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    setProgrammesLoading(true);
    setProgrammesError(false);

    programsApi
      .list()
      .then(({ data }) => {
        if (cancelled) {
          return;
        }

        const options = buildProgramOptions(data as Univers[]);
        const found = requestedProgramme
          ? options.find(
              (program) =>
                program.id === requestedProgramme ||
                program.slug === requestedProgramme ||
                program.lienInscription === requestedProgramme
            )
          : undefined;

        const nextOptions =
          requestedProgramme && !found
            ? [
                {
                  id: requestedProgramme,
                  slug: requestedProgramme,
                  lienInscription: requestedProgramme,
                  titre: programmeTitre || 'Programme sélectionné',
                  universTitre: 'Train & Dare Academy',
                  public: 'À confirmer',
                  duree: 'À confirmer',
                },
                ...options,
              ]
            : options;

        setProgrammes(nextOptions);

        if (requestedProgramme) {
          form.setFieldValue('programmeId', found?.id || requestedProgramme);
        }
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setProgrammesError(true);
        if (requestedProgramme) {
          setProgrammes([
            {
              id: requestedProgramme,
              slug: requestedProgramme,
              lienInscription: requestedProgramme,
              titre: programmeTitre || 'Programme sélectionné',
              universTitre: 'Train & Dare Academy',
              public: 'À confirmer',
              duree: 'À confirmer',
            },
          ]);
          form.setFieldValue('programmeId', requestedProgramme);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProgrammesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [form, programmeTitre, requestedProgramme]);

  const selectedProgramme = useMemo(
    () => programmes.find((program) => program.id === selectedProgrammeId),
    [programmes, selectedProgrammeId]
  );

  const onFinish = async (values: InscriptionValues) => {
    const programmeId = values.programmeId?.trim();
    const matchedProgramme = programmes.find((program) => program.id === programmeId);

    if (!programmeId) {
      message.warning('Veuillez choisir un programme.');
      return;
    }

    setLoading(true);
    setSuccessMessage(null);

    try {
      const { data } = await inscriptionsApi.submit({
        programmeId,
        programmeSlug: matchedProgramme?.slug || programmeId,
        nom: values.nom.trim(),
        email: values.email.trim(),
        trancheAge: values.trancheAge?.trim() || undefined,
        telephone: values.telephone?.trim() || undefined,
        preferredContact: values.preferredContact,
        message: values.message?.trim() || undefined,
        source: 'inscription-page',
        consentAccepted: values.consentAccepted,
      });

      trackConversion('programme_registration_request', {
        programmeId,
        location: 'inscription_form',
      });

      setSuccessMessage(
        `Votre demande est enregistrée${data.id ? ` sous la référence ${data.id}` : ''}. L’équipe Train & Dare vous recontactera sous 48 h.`
      );
      message.success('Demande envoyée.');
      form.resetFields();

      if (requestedProgramme) {
        form.setFieldValue('programmeId', matchedProgramme?.id || requestedProgramme);
      }
    } catch (err: unknown) {
      const errorMessage =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { error?: string } } }).response?.data?.error;

      message.error(String(errorMessage || 'Erreur lors de l’envoi. Réessayez ou contactez-nous.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-form-card">
      <div className="inscription-form-head">
        <div>
          <span className="inscription-mini-kicker">Formulaire sécurisé</span>
          <Title level={3} className="inscription-form-title">
            Demande d’inscription
          </Title>
          <Paragraph className="inscription-form-copy">
            Sélectionnez un programme et indiquez le meilleur moyen de vous recontacter.
          </Paragraph>
        </div>
        <div className="inscription-form-badge">
          <CheckCircleOutlined />
          <span>48 h</span>
        </div>
      </div>

      {successMessage && (
        <Alert
          className="inscription-alert"
          message="Demande reçue"
          description={successMessage}
          type="success"
          showIcon
        />
      )}

      {programmesError && (
        <Alert
          className="inscription-alert"
          message="Chargement partiel des programmes"
          description="La liste des programmes n’a pas pu être chargée. Vous pouvez réessayer ou nous contacter directement."
          type="warning"
          showIcon
        />
      )}

      {programmeTitre && (
        <Alert
          className="inscription-alert"
          message={`Programme présélectionné : ${programmeTitre}`}
          type="info"
          showIcon
        />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ preferredContact: 'email' }}>
        <Form.Item
          name="programmeId"
          label="Programme"
          rules={[{ required: true, message: 'Choisissez un programme.' }]}
        >
          <Select
            size="large"
            loading={programmesLoading}
            placeholder="Sélectionnez un programme"
            showSearch
            optionFilterProp="label"
            options={programmes.map((program) => ({
              value: program.id,
              label: `${program.titre} (${program.universTitre})`,
            }))}
          />
        </Form.Item>

        {selectedProgramme && (
          <div className="inscription-selected-program">
            <strong>{selectedProgramme.titre}</strong>
            <span>{selectedProgramme.public}</span>
            <span>{selectedProgramme.duree}</span>
          </div>
        )}

        <div className="inscription-form-grid">
          <Form.Item name="nom" label="Nom complet" rules={[{ required: true, message: 'Votre nom est requis.' }]}>
            <Input size="large" placeholder="Votre nom complet" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Votre email est requis.' },
              { type: 'email', message: 'Entrez un email valide.' },
            ]}
          >
            <Input size="large" type="email" placeholder="vous@exemple.com" maxLength={254} />
          </Form.Item>

          <Form.Item name="telephone" label="Téléphone">
            <Input size="large" placeholder="+216 ..." maxLength={30} />
          </Form.Item>

          <Form.Item name="preferredContact" label="Contact préféré">
            <Select size="large" options={contactOptions} />
          </Form.Item>

          <Form.Item name="trancheAge" label="Profil">
            <Select size="large" placeholder="Optionnel" allowClear options={ageOptions} />
          </Form.Item>
        </div>

        <Form.Item name="message" label="Message">
          <TextArea
            rows={5}
            placeholder="Précisez votre besoin, votre objectif ou le programme qui vous intéresse."
            maxLength={2000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="consentAccepted"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error('Merci de confirmer que vous acceptez d’être recontacté.')),
            },
          ]}
        >
          <Checkbox>
            J’accepte d’être recontacté par Train & Dare Academy dans le cadre de ma demande d’inscription.
          </Checkbox>
        </Form.Item>

        <div className="inscription-submit-row">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            loading={loading}
          >
            Envoyer ma demande
          </Button>
          <Button size="large" icon={<MailOutlined />} onClick={() => navigate('/#contact')}>
            Contacter l’équipe
          </Button>
        </div>
      </Form>

      <Text className="inscription-form-note">
        Aucune inscription définitive n’est validée sans échange de confirmation avec l’équipe.
      </Text>
    </div>
  );
};

export default InscriptionForm;
