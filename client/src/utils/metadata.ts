import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface GenerateMetadataParams {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

export function generatePageMetadata({
  title,
  description,
  path,
  keywords = [],
}: GenerateMetadataParams): Metadata {
  const fullTitle = `${title} | QuizApp`;
  const canonicalUrl = `${siteUrl}${path}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'QuizApp',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}

export const siteMetadata = {
  siteUrl,
  siteName: 'QuizApp',
  defaultTitle: 'QuizApp - Create and Take Interactive Quizzes',
  defaultDescription:
    'Create, share, and take interactive quizzes with friends and colleagues. Build engaging quizzes with multiple choice questions, track scores, and learn together.',
};
