import { useTranslation } from 'react-i18next';

/**
 * Schema messages are i18n keys (`validation.*`) so forms follow the active
 * language; API errors arrive ready to display and pass through untouched.
 */
export function useFieldError() {
  const { t } = useTranslation();
  return (message?: string) =>
    !message ? undefined : message.startsWith('validation.') ? t(message) : message;
}
