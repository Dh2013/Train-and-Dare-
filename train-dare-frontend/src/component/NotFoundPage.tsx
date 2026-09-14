import { Link } from 'react-router-dom';
import Seo from './Seo';
import { pageSeo } from '../seo/pages';

export default function NotFoundPage() {
  return (
    <section style={{ maxWidth: 900, margin: '64px auto', padding: 24 }}>
      <Seo {...pageSeo('/404')} />
      <h1>Page introuvable</h1>
      <p>Cette adresse ne correspond à aucune page de Train & Dare Academy.</p>
      <Link to="/">Revenir à l’accueil</Link>{' · '}<Link to="/blog">Consulter le blog</Link>
    </section>
  );
}
