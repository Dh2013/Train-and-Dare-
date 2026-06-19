# Digital marketing setup

Ce site contient maintenant les briques suivantes :

- SEO : meta title, meta description, canonical, Open Graph, Twitter card et donnees structurees JSON-LD.
- Google Analytics / Web Analytics : suivi des pages vues, CTA, formulaires, inscriptions et newsletter.
- Conversion & Lead Generation : formulaires contact, inscription, newsletter et landing pages.
- Content marketing & Social Media : blog, boutons de partage social et contenus partageables.
- Avis clients : section d avis sur la page d accueil et sur les landing pages.
- SEA : pages de destination dediees aux campagnes publicitaires.
- Email marketing : route API newsletter et formulaires de capture email.

## Variables Netlify

Ajouter dans Netlify, section Environment variables :

```text
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Remplacer `G-XXXXXXXXXX` par l ID Google Analytics 4.

La variable API est deja configuree dans `netlify.toml` :

```text
VITE_API_URL=/api
```

## Landing pages SEA

Utiliser ces URLs dans Google Ads, Meta Ads ou LinkedIn Ads :

```text
/landing/formation
/landing/education
/landing/coaching
```

## Backend

Le backend expose maintenant :

```text
POST /api/newsletter
```

Payload typique :

```json
{
  "email": "client@example.com",
  "fullName": "Nom Client",
  "source": "homepage-email-marketing",
  "segments": ["adultes"],
  "tags": ["lead-generation"]
}
```

En production, connecter MongoDB sur Render pour conserver durablement les leads newsletter, contact et inscriptions.
