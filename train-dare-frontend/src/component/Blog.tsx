import React, { useEffect, useState } from 'react';
import { Button, Empty, Input, Spin, Typography } from 'antd';
import { ArrowRightOutlined, DashboardOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { blogsApi } from '../api/blogs';
import type { BlogCategory, BlogPost } from '../types/blog';
import { useAuth } from '../context/AuthContext';
import { fallbackBlogCategories, posts as fallbackBlogPosts } from './BlogData';
import {
  buildBlogPlaceholder,
  formatBlogDate,
  getAudienceFromCategory,
  getCategoryBySlug,
  stripHtml,
  truncateBlogText,
} from './blogUtils';
import Seo from './Seo';
import './BlogSystem.css';

const { Paragraph, Title } = Typography;

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>(fallbackBlogCategories);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      setLoading(true);
      try {
        const [postsResponse, categoriesResponse] = await Promise.all([
          blogsApi.listPublished(),
          blogsApi.categories.list(),
        ]);

        if (cancelled) {
          return;
        }

        setPosts(postsResponse.data);
        setCategories(categoriesResponse.data.length > 0 ? categoriesResponse.data : fallbackBlogCategories);
        setUsingFallback(false);
      } catch {
        if (cancelled) {
          return;
        }
        setPosts(fallbackBlogPosts);
        setCategories(fallbackBlogCategories);
        setUsingFallback(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    if (!matchesCategory) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    const haystack = [
      post.title,
      post.excerpt,
      post.author,
      post.tags.join(' '),
      post.metaTitle,
      post.metaDescription,
      stripHtml(post.content),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const totalReadingTime = posts.reduce((sum, post) => sum + post.readingTimeMinutes, 0);
  const adultCount = posts.filter((post) => getAudienceFromCategory(post.category, categories) !== 'youth').length;
  const youthCount = posts.filter((post) => getAudienceFromCategory(post.category, categories) === 'youth').length;

  return (
    <div className="blog-shell">
      <Seo
        title="Blog"
        description="Articles Train & Dare Academy sur l entrepreneuriat, le mindset, la PNL et le developpement jeunesse."
        path="/blog"
        type="website"
      />

      <div className="blog-container">
        <section className="blog-hero">
          <div className="blog-hero-grid">
            <div>
              <span className="blog-kicker">Train & Dare Blog</span>
              <h1 className="blog-heading blog-hero-title">
                Des articles concrets pour faire grandir les idees, les adultes et les jeunes.
              </h1>
              <p className="blog-hero-copy">
                Entrepreneuriat, mindset, PNL et developpement jeunesse : le blog Train & Dare Academy aide votre equipe,
                vos apprenants et votre communaute a passer plus vite de l envie a l action.
              </p>
              <div className="blog-toolbar-left" style={{ marginTop: 22 }}>
                <Button type="primary" size="large" onClick={() => setActiveCategory('all')}>
                  Explorer les articles
                </Button>
                {isAdmin && (
                  <Button size="large" icon={<DashboardOutlined />} onClick={() => navigate('/editeur')}>
                    Tableau de bord
                  </Button>
                )}
              </div>
            </div>

            <div className="blog-stats">
              <div className="blog-stat-card">
                <span className="blog-muted-copy">Articles publies</span>
                <p className="blog-stat-value">{posts.length}</p>
              </div>
              <div className="blog-stat-card">
                <span className="blog-muted-copy">Temps de lecture total</span>
                <p className="blog-stat-value">{totalReadingTime} min</p>
              </div>
              <div className="blog-stat-card">
                <span className="blog-muted-copy">Contenus adultes</span>
                <p className="blog-stat-value">{adultCount}</p>
              </div>
              <div className="blog-stat-card">
                <span className="blog-muted-copy">Contenus jeunesse</span>
                <p className="blog-stat-value">{youthCount}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="blog-toolbar">
          <div className="blog-toolbar-left">
            <Input
              allowClear
              size="large"
              placeholder="Rechercher un article, un sujet ou un mot-cle..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={{ minWidth: 280, maxWidth: 420, borderRadius: 999 }}
            />
          </div>

          <div className="blog-toolbar-right">
            {usingFallback && (
              <Button icon={<ReloadOutlined />} onClick={() => setReloadKey((value) => value + 1)}>
                Reessayer le serveur
              </Button>
            )}
            <span className="blog-muted-copy">
              {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="blog-filter-row">
          <button
            type="button"
            className={`blog-chip ${activeCategory === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Tous les sujets
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              className={`blog-chip ${activeCategory === category.slug ? 'is-active' : ''}`}
              onClick={() => setActiveCategory(category.slug)}
            >
              <span className="blog-category-swatch" style={{ backgroundColor: category.color }} />
              {category.name}
            </button>
          ))}
        </div>

        {usingFallback && (
          <div className="blog-side-note" style={{ marginBottom: 22 }}>
            <strong>Mode hors ligne</strong>
            <Paragraph className="blog-muted-copy" style={{ marginBottom: 0, marginTop: 6 }}>
              Le backend n a pas repondu, donc la page affiche les contenus de secours integres au frontend.
            </Paragraph>
          </div>
        )}

        {loading ? (
          <div className="blog-empty">
            <Spin size="large" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="blog-empty">
            <Empty
              description="Aucun article ne correspond a cette recherche pour le moment."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <section className="blog-grid">
            {filteredPosts.map((post) => {
              const category = getCategoryBySlug(post.category, categories);
              const featuredImage =
                post.featuredImage ||
                buildBlogPlaceholder(post.title, getAudienceFromCategory(post.category, categories));

              return (
                <article key={post.id} className="blog-card">
                  <div className="blog-card-cover">
                    <img src={featuredImage} alt={post.featuredImageAlt || post.title} />
                  </div>

                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      {category && (
                        <span className="blog-badge" style={{ backgroundColor: category.color }}>
                          {category.name}
                        </span>
                      )}
                      <span className="blog-muted-copy">{formatBlogDate(post.publishedAt || post.date)}</span>
                    </div>

                    <div>
                      <h2 className="blog-heading blog-card-title">{post.title}</h2>
                      <Paragraph className="blog-card-excerpt" style={{ marginBottom: 0 }}>
                        {post.excerpt || truncateBlogText(stripHtml(post.content), 150)}
                      </Paragraph>
                    </div>

                    <div className="blog-meta-row">
                      <span className="blog-muted-copy">{post.author}</span>
                      <span className="blog-muted-copy">{post.readingTimeMinutes} min de lecture</span>
                    </div>

                    <div className="blog-card-tags">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="blog-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="blog-card-footer">
                      <span className="blog-muted-copy">
                        {getAudienceFromCategory(post.category, categories) === 'youth'
                          ? 'Focus jeunesse'
                          : 'Focus croissance'}
                      </span>
                      <Button
                        type="primary"
                        icon={<ArrowRightOutlined />}
                        iconPosition="end"
                        onClick={() => navigate(`/blog/${post.slug}`)}
                      >
                        Read More
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {!loading && posts.length > 0 && (
          <section className="blog-related">
            <div className="blog-side-note">
              <Title level={4} className="blog-heading" style={{ marginTop: 0, marginBottom: 8 }}>
                Pourquoi ce blog aide vraiment l equipe Train & Dare
              </Title>
              <Paragraph className="blog-muted-copy" style={{ marginBottom: 0 }}>
                Les contenus sont penses pour renforcer la visibilite SEO du site, nourrir les reseaux sociaux, et offrir
                aux visiteurs des points d entree clairs vers vos programmes d accompagnement, de formation et de
                developpement.
              </Paragraph>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Blog;
