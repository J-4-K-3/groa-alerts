// newsSummarizer.js

const normalizeText = (value = '') =>
  String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toSentenceCase = (value = '') => {
  const text = normalizeText(value);
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const buildNewsSummary = (article = {}) => {
  const title = normalizeText(article.title || '');
  const description = normalizeText(article.description || article.summary || article.content || '');
  const content = normalizeText(article.content || article.description || article.summary || '');

  if (description) {
    const short = description.length > 220 ? `${description.slice(0, 220).trim()}...` : description;
    return toSentenceCase(short);
  }

  if (content) {
    const short = content.length > 220 ? `${content.slice(0, 220).trim()}...` : content;
    return toSentenceCase(short);
  }

  if (title) {
    return `${title} is being tracked by G.R.O.A monitoring feeds and cross-checked against multiple public reports.`;
  }

  return 'Fresh reporting is being monitored from multiple public sources and summarized for quick review.';
};

export const buildNewsDetail = (article = {}) => {
  const body = normalizeText(article.content || article.description || article.summary || '');
  if (!body) {
    return buildNewsSummary(article);
  }

  return body.length > 800 ? `${body.slice(0, 800).trim()}...` : body;
};