import { Helmet } from 'react-helmet-async';
import branding from '../config/branding';

const SEO = ({ title, description, image, url, type = 'website' }) => {
  const siteName = branding.company?.name || 'Real Estate';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = branding.company?.tagline || 'Find your dream property';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
