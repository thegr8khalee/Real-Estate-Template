// services/gmail.service.js
// Thin adapter — preserves the existing { sendEmail, verifyConnection } interface so
// callers don't need to change, but delegates to the Zoho SMTP service. This removes
// the heavy `googleapis` dependency (~180 MB unzipped on Vercel).
import zohoMailService from './zoho.service.js';

export const sendEmail = ({ to, subject, text, html /* , from (ignored) */ }) =>
  zohoMailService.sendEmail({ to, subject, html: html || text, text });

export const verifyConnection = () => zohoMailService.verifyConnection();

export default { sendEmail, verifyConnection };
