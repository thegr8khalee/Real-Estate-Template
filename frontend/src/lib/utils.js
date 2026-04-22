export function formatTime(date) {
  return new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: 'long', // or 'short' or '2-digit'
    day: '2-digit',
  }).format(new Date(date));
}

import branding from '../config/branding';

export const formatPrice = (price) =>
  new Intl.NumberFormat(branding.currency.locale, {
    style: 'currency',
    currency: branding.currency.code,
    minimumFractionDigits: branding.currency.decimals,
    maximumFractionDigits: branding.currency.decimals,
  }).format(price);

export function formatDistanceToNow(date) {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return formatTime(past);
}