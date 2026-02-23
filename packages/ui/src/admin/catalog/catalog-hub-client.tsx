'use client';

import { CatalogHeader, CatalogGrid, ResourceCard } from '@giulio-leone/ui';
import { Dumbbell, UtensilsCrossed, FileText, ArrowRight, type LucideIcon } from 'lucide-react';
import { useRouter } from '@giulio-leone/ui';
import { useTranslations, useLocale } from 'next-intl';

interface CatalogHubClientProps {
  stats: {
    exercisesCount: number;
    foodsCount: number;
    policiesCount: number;
  };
}

type CatalogItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  stats: string;
  available: boolean;
};

export function CatalogHubClient({ stats }: CatalogHubClientProps) {
  const t = useTranslations('admin.catalog');
  const locale = useLocale();
  const router = useRouter();
  const countFormatter = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US');

  const headerStats = [
    { label: t('stats.exercises'), value: countFormatter.format(stats.exercisesCount) },
    { label: t('stats.foods'), value: countFormatter.format(stats.foodsCount) },
    { label: t('stats.policies'), value: countFormatter.format(stats.policiesCount) },
  ];

  const catalogItems: CatalogItem[] = [
    {
      id: 'exercises',
      title: t('items.exercises.title'),
      description: t('items.exercises.description'),
      href: '/admin/exercises',
      icon: Dumbbell,
      color: 'text-blue-500',
      stats: t('items.count', { count: countFormatter.format(stats.exercisesCount) }),
      available: true,
    },
    {
      id: 'foods',
      title: t('items.foods.title'),
      description: t('items.foods.description'),
      href: '/admin/foods',
      icon: UtensilsCrossed,
      color: 'text-green-500',
      stats: t('items.count', { count: countFormatter.format(stats.foodsCount) }),
      available: true,
    },
    {
      id: 'policies',
      title: t('items.policies.title'),
      description: t('items.policies.description'),
      href: '/admin/policies',
      icon: FileText,
      color: 'text-purple-500',
      stats: t('items.docsCount', { count: countFormatter.format(stats.policiesCount) }),
      available: true,
    },
  ];

  return (
    <div className="container mx-auto max-w-[1600px] px-4 py-8">
      <CatalogHeader title={t('title')} description={t('description')} stats={headerStats} />

      <CatalogGrid emptyState={<p className="text-center text-neutral-500">{t('emptyState')}</p>}>
        {catalogItems.map((item: CatalogItem) => (
          <ResourceCard
            key={item.id}
            title={item.title}
            subtitle={item.description}
            imageSrc={null}
            status={item.available ? 'active' : 'inactive'}
            stats={[{ label: t('items.elements'), value: item.stats }]}
            actions={[
              {
                label: t('items.open'),
                icon: <ArrowRight size={16} />,
                onClick: () => router.push(item.href),
              },
            ]}
            href={item.href}
          />
        ))}
      </CatalogGrid>
    </div>
  );
}
