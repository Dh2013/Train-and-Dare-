import React, { useEffect, useState } from 'react';
import { Alert, Button, Empty, Spin, Typography, message } from 'antd';
import {
  ArrowLeftOutlined,
  CopyOutlined,
  DashboardOutlined,
  FacebookFilled,
  LinkedinFilled,
  ShareAltOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { blogsApi } from '../api/blogs';
import type { BlogCategory, BlogPost } from '../types/blog';
import { useAuth } from '../context/AuthContext';
import { fallbackBlogCategories, posts as fallbackBlogPosts } from './BlogData';
import {
  buildBlogPlaceholder,
  formatBlogDate,
  getAudienceFromCategory,
  getCategoryBySlug,
} from './blogUtils';
import { sanitizeHtml } from './RichTextEditor';
import Seo from './Seo';
import './BlogSystem.css';

const { Title, Text } = Typography;

function buildShareUrl(slug: string): string {
  if (typeof window === 'undefined' || !window.location?.origin) {
    return `http://localhost:5173/blog/${slug}`;
  }
  return `${window.location.origin}/blog/${slug}`;
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>(fallbackBlogCategories);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadPost = async () => {
      setLoading(true);
      try {
        const [postResponse, postsResponse, categoriesResponse] = await Promise.all([
          blogsApi.get(slug),
          blogsApi.listPublished({ limit: 8 }),
          blogsApi.categories.list(),
        ]);

        if (cancelled) {
          return;
        }

        const allCategories = categoriesResponse.data.length > 0 ? categoriesResponse.data : fallbackBlogCategories;
        const currentPost = postResponse.data;
        const rankedRelated = postsResponse.data
          .filter((candidate) => candidate.slug !== currentPost.slug)
          .sort((left, right) => {
            const leftScore =
              Number(left.category === currentPost.category) * 3 +
              left.tags.filter((tag) => currentPost.tags.includes(tag)).length;
            const rightScore =
              Number(right.category === currentPost.category) * 3 +
              right.tags.filter((tag) => currentPost.tags.includes(tag)).length;
            return rightScore - leftScore;
          })
          .slice(0, 3);

        setPost(currentPost);
        setCategories(allCategories);
        setRelatedPosts(rankedRelated);
        setUsingFallback(false);
      } catch {
        if (cancelled) {
          return;
        }
        const fallbackPost = fallbackBlogPosts.find((candidate) => candidate.slug === slug) ?? null;
        const fallbackRelated = fallbackBlogPosts.filter((candidate) => candidate.slug !== slug).slice(0, 3);
        setPost(fallbackPost);
        setCategories(fallbackBlogCategories);
        setRelatedPosts(fallbackRelated);
        setUsingFallback(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-shell">
        <div className="blog-container">
          <div className="blog-empty">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-shell">
        <div className="blog-container">
          <div className="blog-empty">
            <Empty description="Article introuvable" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" onClick={() => navigate('/blog')}>
                Retour au blog
              </Button>
            </Empty>
          </div>
        </div>
      </div>
    );
  }

  const category = getCategoryBySlug(post.category, categories);
  const safeContent = sanitizeHtml(post.content || '');
  const shareUrl = buildShareUrl(post.slug);
  const shareText = encodeURIComponent(post.title);
  const featuredImage =
    post.featuredImage || buildBlogPlaceholder(post.title, getAudienceFromCategory(post.category, categories));

  const shareActions = [
    {
      key: 'whatsapp',
      label: 'Partager sur WhatsApp',
      href: `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`,
      icon: <WhatsAppOutlined />,
    },
    {
      key: 'facebook',
      label: 'Partager sur Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: <FacebookFilled />,
    },
    {
      key: 'linkedin',
      label: 'Partager sur LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: <LinkedinFilled />,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      message.success('Lien copie dans le presse-papiers.');
    } catch {
      message.error('Impossible de copier le lien pour le moment.');
    }
  };

  return (
    <div className="blog-shell">
      <Seo
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        image={featuredImage}
        path={`/blog/${post.slug}`}
        type="article"
      />

      <div className="blog-container">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/blog')}>
          Retour au blog
        </Button>

        {usingFallback && (
          <Alert
            type="info"
            showIcon
            style={{ marginTop: 12 }}
            message="Version de secours"
            description="Le serveur est indisponible, donc cet article est affiche depuis les donnees integrees au frontend."
          />
        )}

        {post.status !== 'published' && (
          <Alert
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
            message={`Apercu administrateur : article ${post.status === 'scheduled' ? 'programme' : 'en brouillon'}`}
            description="Ce contenu n est pas visible publiquement tant qu il n est pas publie."
          />
        )}

        <section className="blog-post-shell">
          <article className="blog-post-main">
            <div className="blog-post-cover">
              <img src={featuredImage} alt={post.featuredImageAlt || post.title} />
            </div>

            <div className="blog-post-content">
              <div className="blog-post-meta" style={{ marginBottom: 12 }}>
                {category && (
                  <span className="blog-badge" style={{ backgroundColor: category.color }}>
                    {category.name}
                  </span>
                )}
                <span className="blog-status-pill" data-status={post.status}>
                  {post.status === 'published'
                    ? 'Publie'
                    : post.status === 'scheduled'
                      ? 'Programme'
                      : 'Brouillon'}
                </span>
              </div>

              <Title className="blog-heading" level={1} style={{ marginTop: 0 }}>
                {post.title}
              </Title>

              <div className="blog-meta-row" style={{ marginBottom: 18 }}>
                <Text className="blog-muted-copy">{post.author}</Text>
                <Text className="blog-muted-copy">{formatBlogDate(post.publishedAt || post.date)}</Text>
                <Text className="blog-muted-copy">{post.readingTimeMinutes} min de lecture</Text>
              </div>

              <div className="blog-post-tags" style={{ marginBottom: 22 }}>
                {post.tags.map((tag) => (
                  <span key={tag} className="blog-tag">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="blog-rich-content" dangerouslySetInnerHTML={{ __html: safeContent }} />
            </div>
          </article>

          <aside className="blog-post-sidebar">
            <div className="blog-inline-row" style={{ justifyContent: 'space-between' }}>
              <Title level={4} className="blog-heading" style={{ margin: 0 }}>
                A propos de cet article
              </Title>
              <ShareAltOutlined style={{ color: '#0f766e' }} />
            </div>

            <div className="blog-side-note" style={{ marginTop: 18 }}>
              <Text strong>SEO</Text>
              <div className="blog-muted-copy" style={{ marginTop: 8 }}>
                URL: /blog/{post.slug}
              </div>
              <div className="blog-muted-copy">Meta title: {post.metaTitle || post.title}</div>
            </div>

            <div className="blog-share-stack">
              {shareActions.map((action) => (
                <Button
                  key={action.key}
                  block
                  href={action.href}
                  target="_blank"
                  rel="noreferrer"
                  icon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
              <Button block icon={<CopyOutlined />} onClick={handleCopyLink}>
                Copier le lien
              </Button>
              {isAdmin && (
                <Button block icon={<DashboardOutlined />} onClick={() => navigate('/editeur')}>
                  Ouvrir le tableau de bord
                </Button>
              )}
            </div>
          </aside>
        </section>

        {relatedPosts.length > 0 && (
          <section className="blog-related">
            <Title level={3} className="blog-heading">
              Articles lies
            </Title>

            <div className="blog-grid">
              {relatedPosts.map((related) => {
                const relatedCategory = getCategoryBySlug(related.category, categories);
                const relatedImage =
                  related.featuredImage ||
                  buildBlogPlaceholder(related.title, getAudienceFromCategory(related.category, categories));

                return (
                  <article key={related.id} className="blog-card">
                    <div className="blog-card-cover">
                      <img src={relatedImage} alt={related.featuredImageAlt || related.title} />
                    </div>

                    <div className="blog-card-body">
                      {relatedCategory && (
                        <span className="blog-badge" style={{ backgroundColor: relatedCategory.color, width: 'fit-content' }}>
                          {relatedCategory.name}
                        </span>
                      )}
                      <h3 className="blog-heading blog-card-title">{related.title}</h3>
                      <div className="blog-meta-row">
                        <Text className="blog-muted-copy">{formatBlogDate(related.publishedAt || related.date)}</Text>
                        <Text className="blog-muted-copy">{related.readingTimeMinutes} min</Text>
                      </div>
                      <Button type="primary" onClick={() => navigate(`/blog/${related.slug}`)}>
                        Lire l article
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
