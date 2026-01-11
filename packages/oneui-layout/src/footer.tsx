/**
 * Footer Component
 *
 * Footer riutilizzabile con link alle policy
 */

import { Link } from 'app/navigation';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('layout.footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white py-6 sm:py-8 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center text-sm text-neutral-600 sm:flex-row sm:justify-between sm:text-left dark:text-neutral-400">
          <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
            <Link
              href="/policy/privacy-policy"
              className="transition-colors hover:text-neutral-900 hover:underline dark:text-neutral-100 dark:hover:text-neutral-100"
            >
              {t('privacy')}
            </Link>
            <Link
              href="/policy/terms-conditions"
              className="transition-colors hover:text-neutral-900 hover:underline dark:text-neutral-100 dark:hover:text-neutral-100"
            >
              {t('terms')}
            </Link>
            <Link
              href="/policy/gdpr"
              className="transition-colors hover:text-neutral-900 hover:underline dark:text-neutral-100 dark:hover:text-neutral-100"
            >
              {t('gdpr')}
            </Link>
            <Link
              href="/policy/content-policy"
              className="transition-colors hover:text-neutral-900 hover:underline dark:text-neutral-100 dark:hover:text-neutral-100"
            >
              {t('content_policy')}
            </Link>
          </div>
          <div className="text-center sm:text-right">{t('copyright', { year: currentYear })}</div>
        </div>
      </div>
    </footer>
  );
}
