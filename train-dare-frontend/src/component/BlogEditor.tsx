import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  Popconfirm,
  Select,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LogoutOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { blogsApi } from '../api/blogs';
import type {
  BlogCategory,
  BlogCategoryInput,
  BlogPost,
  BlogPostInput,
  BlogStatus,
  CategoryAudience,
} from '../types/blog';
import { useAuth } from '../context/AuthContext';
import { fallbackBlogCategories } from './BlogData';
import {
  buildBlogPlaceholder,
  formatBlogDate,
  fromDatetimeLocal,
  getAudienceFromCategory,
  getCategoryBySlug,
  slugifyBlogValue,
  stripHtml,
  toDatetimeLocal,
  truncateBlogText,
} from './blogUtils';
import RichTextEditor, { sanitizeHtml } from './RichTextEditor';
import Seo from './Seo';
import './BlogSystem.css';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

type EditorMode = 'list' | 'create' | 'edit';

interface BlogFormValues {
  title: string;
  slug: string;
  date: string;
  author: string;
  category: string;
  tags: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  scheduledFor: string;
}

interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  color: string;
  audience: CategoryAudience;
}

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getStatusLabel(status: BlogStatus): string {
  if (status === 'published') {
    return 'Publie';
  }
  if (status === 'scheduled') {
    return 'Programme';
  }
  return 'Brouillon';
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
  ) {
    return (error as { response: { data: { error: string } } }).response.data.error;
  }
  return fallback;
}

const BlogEditor: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form] = Form.useForm<BlogFormValues>();
  const [categoryForm] = Form.useForm<CategoryFormValues>();
  const [mode, setMode] = useState<EditorMode>('list');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>(fallbackBlogCategories);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategorySlug, setEditingCategorySlug] = useState<string | null>(null);
  const [contentHtml, setContentHtml] = useState('');
  const [previewVisible, setPreviewVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const watchedTitle = Form.useWatch('title', form) ?? '';
  const watchedExcerpt = Form.useWatch('excerpt', form) ?? '';
  const watchedFeaturedImage = Form.useWatch('featuredImage', form) ?? '';
  const watchedCategory = Form.useWatch('category', form) ?? categories[0]?.slug ?? 'entrepreneuriat';
  const watchedMetaTitle = Form.useWatch('metaTitle', form) ?? '';
  const watchedMetaDescription = Form.useWatch('metaDescription', form) ?? '';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [postsResponse, categoriesResponse] = await Promise.all([blogsApi.list(), blogsApi.categories.list()]);
      setPosts(postsResponse.data);
      setCategories(categoriesResponse.data.length > 0 ? categoriesResponse.data : fallbackBlogCategories);
    } catch (error) {
      message.error(extractErrorMessage(error, 'Impossible de charger le tableau de bord du blog.'));
      setPosts([]);
      setCategories(fallbackBlogCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const resetCategoryForm = () => {
    setEditingCategorySlug(null);
    categoryForm.setFieldsValue({
      name: '',
      slug: '',
      description: '',
      color: '#0E9F6E',
      audience: 'adult',
    });
  };

  const resetPostForm = () => {
    setEditingId(null);
    setContentHtml('');
    const defaultCategory = categories[0]?.slug ?? 'entrepreneuriat';
    form.setFieldsValue({
      title: '',
      slug: '',
      date: new Date().toISOString().slice(0, 10),
      author: 'Train & Dare Academy',
      category: defaultCategory,
      tags: '',
      excerpt: '',
      featuredImage: '',
      featuredImageAlt: '',
      metaTitle: '',
      metaDescription: '',
      scheduledFor: '',
    });
  };

  useEffect(() => {
    if (mode === 'list') {
      resetCategoryForm();
    }
  }, [mode]);

  const startCreate = () => {
    resetPostForm();
    setMode('create');
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    form.setFieldsValue({
      title: post.title,
      slug: post.slug,
      date: post.date,
      author: post.author,
      category: post.category,
      tags: post.tags.join(', '),
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      featuredImageAlt: post.featuredImageAlt,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      scheduledFor: toDatetimeLocal(post.scheduledFor),
    });
    setContentHtml(post.content || '');
    setMode('edit');
  };

  const cancelEditing = () => {
    setMode('list');
    resetPostForm();
  };

  const handlePostSave = async (intent: BlogStatus) => {
    try {
      const values = await form.validateFields();
      const title = values.title.trim();
      const slug = slugifyBlogValue(values.slug || title);
      const content = sanitizeHtml(contentHtml);
      const excerpt = values.excerpt.trim() || truncateBlogText(stripHtml(content), 260);
      const metaTitle = values.metaTitle.trim() || title;
      const metaDescription = values.metaDescription.trim() || truncateBlogText(excerpt, 160);
      const scheduledFor = intent === 'scheduled' ? fromDatetimeLocal(values.scheduledFor) : undefined;
      const category = values.category || categories[0]?.slug || 'entrepreneuriat';
      const fallbackImage = buildBlogPlaceholder(title, getAudienceFromCategory(category, categories));
      const payload: BlogPostInput = {
        title,
        slug,
        excerpt,
        content,
        featuredImage: values.featuredImage.trim() || fallbackImage,
        featuredImageAlt: values.featuredImageAlt.trim() || title,
        author: values.author.trim() || 'Train & Dare Academy',
        category,
        tags: parseTags(values.tags),
        date: values.date,
        status: intent,
        scheduledFor,
        metaTitle,
        metaDescription,
      };

      if (!content) {
        message.warning('Ajoutez du contenu a l article avant de l enregistrer.');
        return;
      }
      if (intent === 'scheduled' && !scheduledFor) {
        message.warning('Choisissez une date et une heure pour programmer la publication.');
        return;
      }

      setSaving(true);

      if (mode === 'create') {
        await blogsApi.create(payload);
        message.success(
          intent === 'published'
            ? 'Article cree et publie.'
            : intent === 'scheduled'
              ? 'Article cree et programme.'
              : 'Article cree en brouillon.'
        );
      } else if (editingId) {
        await blogsApi.update(editingId, payload);
        message.success(
          intent === 'published'
            ? 'Article mis a jour et publie.'
            : intent === 'scheduled'
              ? 'Article mis a jour et programme.'
              : 'Article mis a jour.'
        );
      }

      await loadDashboardData();
      cancelEditing();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      message.error(extractErrorMessage(error, 'Impossible d enregistrer cet article.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await blogsApi.delete(id);
      message.success('Article supprime.');
      await loadDashboardData();
      if (editingId === id) {
        cancelEditing();
      }
    } catch (error) {
      message.error(extractErrorMessage(error, 'Impossible de supprimer cet article.'));
    }
  };

  const handlePublishNow = async (id: string) => {
    try {
      await blogsApi.publish(id);
      message.success('Article publie.');
      await loadDashboardData();
    } catch (error) {
      message.error(extractErrorMessage(error, 'Impossible de publier cet article.'));
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await blogsApi.unpublish(id);
      message.success('Article repasse en brouillon.');
      await loadDashboardData();
    } catch (error) {
      message.error(extractErrorMessage(error, 'Impossible de depublier cet article.'));
    }
  };

  const startCategoryEdit = (category: BlogCategory) => {
    setEditingCategorySlug(category.slug);
    categoryForm.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      audience: category.audience,
    });
  };

  const handleCategorySave = async () => {
    try {
      const values = await categoryForm.validateFields();
      const payload: BlogCategoryInput = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        description: values.description.trim(),
        color: values.color,
        audience: values.audience,
      };

      setSaving(true);
      if (editingCategorySlug) {
        await blogsApi.categories.update(editingCategorySlug, payload);
        message.success('Categorie mise a jour.');
      } else {
        await blogsApi.categories.create(payload);
        message.success('Categorie ajoutee.');
      }
      await loadDashboardData();
      resetCategoryForm();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      message.error(extractErrorMessage(error, 'Impossible d enregistrer cette categorie.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryDelete = async (slug: string) => {
    try {
      await blogsApi.categories.delete(slug);
      message.success('Categorie supprimee.');
      await loadDashboardData();
      if (editingCategorySlug === slug) {
        resetCategoryForm();
      }
    } catch (error) {
      message.error(extractErrorMessage(error, 'Impossible de supprimer cette categorie.'));
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!matchesStatus || !matchesCategory) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    const haystack = [
      post.title,
      post.author,
      post.excerpt,
      post.tags.join(' '),
      post.metaTitle,
      post.metaDescription,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const publishedCount = posts.filter((post) => post.status === 'published').length;
  const draftCount = posts.filter((post) => post.status === 'draft').length;
  const scheduledCount = posts.filter((post) => post.status === 'scheduled').length;
  const previewCategory = getCategoryBySlug(watchedCategory, categories);
  const previewImage =
    watchedFeaturedImage.trim() ||
    buildBlogPlaceholder(watchedTitle || 'Article Train & Dare', getAudienceFromCategory(watchedCategory, categories));

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="blog-editor-shell">
        <Seo title="Administration blog" description="Espace admin du blog Train & Dare Academy." path="/editeur" />

        <div className="blog-container">
          <div className="blog-admin-topbar">
            <div>
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={cancelEditing}>
                Retour au tableau de bord
              </Button>
              <Title className="blog-heading" level={2} style={{ marginBottom: 6 }}>
                {mode === 'create' ? 'Nouvel article' : 'Modifier un article'}
              </Title>
              <Paragraph className="blog-muted-copy" style={{ marginBottom: 0 }}>
                Creez, programmez ou publiez un contenu optimise pour le blog Train & Dare.
              </Paragraph>
            </div>

            <div className="blog-toolbar-right">
              <Button onClick={() => navigate('/blog')} icon={<EyeOutlined />}>
                Voir le blog
              </Button>
            </div>
          </div>

          <Alert
            showIcon
            type="info"
            style={{ marginBottom: 22 }}
            message="Workflow editorial"
            description="Utilisez Brouillon pour preparer un article, Programmer pour planifier la mise en ligne, ou Publier pour le rendre visible immediatement."
          />

          <Form form={form} layout="vertical">
            <div className="blog-editor-grid">
              <div className="blog-editor-panel">
                <Title level={4} className="blog-heading" style={{ marginTop: 0 }}>
                  Informations de publication
                </Title>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <Form.Item name="title" label="Titre" rules={[{ required: true, message: 'Le titre est requis.' }]}>
                    <Input placeholder="Titre de l article" />
                  </Form.Item>
                  <Form.Item name="slug" label="Slug SEO">
                    <Input placeholder="laisser vide pour generer automatiquement" />
                  </Form.Item>
                  <Form.Item name="author" label="Auteur" rules={[{ required: true, message: 'L auteur est requis.' }]}>
                    <Input placeholder="Nom de l auteur" />
                  </Form.Item>
                  <Form.Item name="date" label="Date de reference" rules={[{ required: true, message: 'La date est requise.' }]}>
                    <Input type="date" />
                  </Form.Item>
                  <Form.Item name="category" label="Categorie" rules={[{ required: true, message: 'Selectionnez une categorie.' }]}>
                    <Select
                      options={categories.map((category) => ({
                        value: category.slug,
                        label: category.name,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item name="tags" label="Tags">
                    <Input placeholder="entrepreneuriat, mindset, jeunes" />
                  </Form.Item>
                  <Form.Item name="featuredImage" label="Image a la une">
                    <Input placeholder="https://..." />
                  </Form.Item>
                  <Form.Item name="featuredImageAlt" label="Texte alternatif image">
                    <Input placeholder="Description de l image" />
                  </Form.Item>
                </div>

                <Form.Item name="excerpt" label="Extrait">
                  <TextArea rows={4} placeholder="Resume court affiche dans la liste des articles" />
                </Form.Item>

                <Title level={4} className="blog-heading">
                  SEO
                </Title>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <Form.Item name="metaTitle" label="Meta title">
                    <Input placeholder="Titre SEO personnalise" />
                  </Form.Item>
                  <Form.Item name="scheduledFor" label="Publication programmee">
                    <Input type="datetime-local" prefix={<CalendarOutlined />} />
                  </Form.Item>
                </div>

                <Form.Item name="metaDescription" label="Meta description">
                  <TextArea rows={3} placeholder="Description courte pour Google et les reseaux sociaux" />
                </Form.Item>

                <Title level={4} className="blog-heading">
                  Contenu de l article
                </Title>
                <RichTextEditor
                  value={contentHtml}
                  onChange={setContentHtml}
                  placeholder="Ajoutez vos titres, paragraphes, images, liens et listes..."
                  minHeight={360}
                />

                <div className="blog-editor-actions">
                  <Button icon={<SaveOutlined />} loading={saving} onClick={() => void handlePostSave('draft')}>
                    Enregistrer en brouillon
                  </Button>
                  <Button icon={<CalendarOutlined />} loading={saving} onClick={() => void handlePostSave('scheduled')}>
                    Programmer
                  </Button>
                  <Button type="primary" loading={saving} onClick={() => void handlePostSave('published')}>
                    Publier maintenant
                  </Button>
                </div>
              </div>

              <div className="blog-editor-panel">
                <div className="blog-inline-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                  <Title level={4} className="blog-heading" style={{ margin: 0 }}>
                    Apercu
                  </Title>
                  <Button type="link" onClick={() => setPreviewVisible((value) => !value)}>
                    {previewVisible ? 'Masquer' : 'Afficher'}
                  </Button>
                </div>

                {previewVisible && (
                  <div className="blog-preview-card">
                    <img
                      src={previewImage}
                      alt={watchedTitle || 'Apercu article'}
                      style={{ width: '100%', borderRadius: 20, aspectRatio: '16 / 10', objectFit: 'cover' }}
                    />

                    <div className="blog-card-meta" style={{ marginTop: 18 }}>
                      {previewCategory && (
                        <span className="blog-badge" style={{ backgroundColor: previewCategory.color }}>
                          {previewCategory.name}
                        </span>
                      )}
                    </div>

                    <Title level={4} className="blog-heading" style={{ marginBottom: 8 }}>
                      {watchedTitle || 'Titre de previsualisation'}
                    </Title>
                    <Paragraph className="blog-muted-copy">
                      {watchedExcerpt || 'Votre extrait apparaitra ici pour aider les visiteurs a comprendre rapidement le sujet.'}
                    </Paragraph>

                    <div className="blog-side-note">
                      <Text strong>Meta title</Text>
                      <div className="blog-muted-copy" style={{ marginTop: 8 }}>
                        {watchedMetaTitle || watchedTitle || 'Titre SEO'}
                      </div>
                      <div className="blog-muted-copy" style={{ marginTop: 10 }}>
                        {watchedMetaDescription || 'La meta description sera visible ici.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-editor-shell">
      <Seo title="Tableau de bord blog" description="Back office du blog Train & Dare Academy." path="/editeur" />

      <div className="blog-container">
        <div className="blog-admin-topbar">
          <div>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/blog')}>
              Retour au blog
            </Button>
            <Title className="blog-heading" level={2} style={{ marginBottom: 6 }}>
              Tableau de bord du blog
            </Title>
            <Paragraph className="blog-muted-copy" style={{ marginBottom: 0 }}>
              Gere les publications, les categories, les tags, le planning editorial et les champs SEO.
            </Paragraph>
          </div>

          <div className="blog-toolbar-right">
            <Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>
              Nouvel article
            </Button>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                logout();
                navigate('/blog');
              }}
            >
              Deconnexion
            </Button>
          </div>
        </div>

        <div className="blog-admin-stats">
          <div className="blog-admin-stat">
            <span className="blog-muted-copy">Publies</span>
            <strong>{publishedCount}</strong>
          </div>
          <div className="blog-admin-stat">
            <span className="blog-muted-copy">Programmes</span>
            <strong>{scheduledCount}</strong>
          </div>
          <div className="blog-admin-stat">
            <span className="blog-muted-copy">Brouillons</span>
            <strong>{draftCount}</strong>
          </div>
          <div className="blog-admin-stat">
            <span className="blog-muted-copy">Categories</span>
            <strong>{categories.length}</strong>
          </div>
        </div>

        <Alert
          showIcon
          type="info"
          style={{ marginBottom: 22 }}
          message="Administration securisee"
          description="Les contenus du blog sont proteges par authentification admin. Les articles non publies restent invisibles pour les visiteurs."
        />

        <div className="blog-dashboard-grid">
          <section className="blog-admin-panel">
            <div className="blog-toolbar" style={{ marginTop: 0 }}>
              <div className="blog-toolbar-left">
                <Input
                  allowClear
                  placeholder="Rechercher un titre, un auteur ou un tag..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  style={{ minWidth: 260 }}
                />
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  style={{ minWidth: 170 }}
                  options={[
                    { value: 'all', label: 'Tous les statuts' },
                    { value: 'published', label: 'Publies' },
                    { value: 'scheduled', label: 'Programmes' },
                    { value: 'draft', label: 'Brouillons' },
                  ]}
                />
                <Select
                  value={categoryFilter}
                  onChange={(value) => setCategoryFilter(value)}
                  style={{ minWidth: 190 }}
                  options={[
                    { value: 'all', label: 'Toutes les categories' },
                    ...categories.map((category) => ({
                      value: category.slug,
                      label: category.name,
                    })),
                  ]}
                />
              </div>
            </div>

            {loading ? (
              <div className="blog-empty">
                <Paragraph className="blog-muted-copy">Chargement du tableau de bord...</Paragraph>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="blog-empty">
                <Empty description="Aucun article ne correspond a vos filtres." image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            ) : (
              <div className="blog-list-card">
                {filteredPosts.map((post) => {
                  const category = getCategoryBySlug(post.category, categories);
                  const thumbnail =
                    post.featuredImage ||
                    buildBlogPlaceholder(post.title, getAudienceFromCategory(post.category, categories));

                  return (
                    <div key={post.id} className="blog-list-row">
                      <img className="blog-list-thumb" src={thumbnail} alt={post.featuredImageAlt || post.title} />

                      <div>
                        <div className="blog-card-meta" style={{ marginBottom: 6 }}>
                          {category && (
                            <span className="blog-badge" style={{ backgroundColor: category.color }}>
                              {category.name}
                            </span>
                          )}
                          <span className="blog-status-pill" data-status={post.status}>
                            {getStatusLabel(post.status)}
                          </span>
                        </div>

                        <Title level={5} className="blog-heading" style={{ marginBottom: 6 }}>
                          {post.title}
                        </Title>
                        <div className="blog-meta-row" style={{ marginBottom: 8 }}>
                          <Text className="blog-muted-copy">{post.author}</Text>
                          <Text className="blog-muted-copy">{formatBlogDate(post.publishedAt || post.date)}</Text>
                          <Text className="blog-muted-copy">{post.readingTimeMinutes} min</Text>
                        </div>
                        <Paragraph className="blog-muted-copy" style={{ marginBottom: 8 }}>
                          {post.excerpt}
                        </Paragraph>
                        <div className="blog-card-tags">
                          {post.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="blog-tag">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="blog-toolbar-right" style={{ justifyContent: 'flex-end' }}>
                        <Button icon={<EyeOutlined />} onClick={() => navigate(`/blog/${post.slug}`)}>
                          Voir
                        </Button>
                        <Button icon={<EditOutlined />} onClick={() => startEdit(post)}>
                          Modifier
                        </Button>
                        {post.status === 'published' ? (
                          <Button onClick={() => void handleUnpublish(post.id)}>Depublier</Button>
                        ) : (
                          <Button type="primary" onClick={() => void handlePublishNow(post.id)}>
                            Publier
                          </Button>
                        )}
                        <Popconfirm
                          title="Supprimer cet article ?"
                          description="Cette action est irreversible."
                          okText="Supprimer"
                          cancelText="Annuler"
                          onConfirm={() => void handleDeletePost(post.id)}
                        >
                          <Button danger icon={<DeleteOutlined />}>
                            Supprimer
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="blog-admin-panel">
            <Title level={4} className="blog-heading" style={{ marginTop: 0 }}>
              Categories
            </Title>
            <Paragraph className="blog-muted-copy">
              Creez vos themes editoriaux pour structurer le blog et filtrer les articles cote public.
            </Paragraph>

            <Form form={categoryForm} layout="vertical">
              <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom est requis.' }]}>
                <Input placeholder="Ex. Leadership" />
              </Form.Item>
              <Form.Item name="slug" label="Slug">
                <Input placeholder="leadership" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Courte description de la categorie" />
              </Form.Item>
              <div className="blog-category-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Form.Item name="color" label="Couleur" rules={[{ required: true, message: 'Choisissez une couleur.' }]}>
                  <Input type="color" />
                </Form.Item>
                <Form.Item
                  name="audience"
                  label="Audience"
                  rules={[{ required: true, message: 'Choisissez une audience.' }]}
                >
                  <Select
                    options={[
                      { value: 'adult', label: 'Adultes' },
                      { value: 'youth', label: 'Jeunesse' },
                      { value: 'all', label: 'Mixte' },
                    ]}
                  />
                </Form.Item>
              </div>

              <div className="blog-toolbar-left" style={{ marginBottom: 18 }}>
                <Button type="primary" loading={saving} onClick={() => void handleCategorySave()}>
                  {editingCategorySlug ? 'Mettre a jour' : 'Ajouter la categorie'}
                </Button>
                {editingCategorySlug && <Button onClick={resetCategoryForm}>Annuler</Button>}
              </div>
            </Form>

            <div className="blog-list-card">
              {categories.map((category) => (
                <div key={category.slug} className="blog-side-note">
                  <div className="blog-inline-row" style={{ justifyContent: 'space-between' }}>
                    <div className="blog-inline-row">
                      <span className="blog-category-swatch" style={{ backgroundColor: category.color }} />
                      <Text strong>{category.name}</Text>
                    </div>
                    <span className="blog-tag">{category.audience}</span>
                  </div>
                  <Paragraph className="blog-muted-copy" style={{ margin: '10px 0 14px' }}>
                    {category.description || 'Aucune description ajoutee pour cette categorie.'}
                  </Paragraph>
                  <div className="blog-inline-row">
                    <Button size="small" icon={<EditOutlined />} onClick={() => startCategoryEdit(category)}>
                      Modifier
                    </Button>
                    <Popconfirm
                      title="Supprimer cette categorie ?"
                      description="La suppression est bloquee si des articles utilisent encore cette categorie."
                      okText="Supprimer"
                      cancelText="Annuler"
                      onConfirm={() => void handleCategoryDelete(category.slug)}
                    >
                      <Button size="small" danger icon={<DeleteOutlined />}>
                        Supprimer
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
