'use client';

import { QuickActionsGrid } from '@onecoach/ui';
import {
  Users,
  TrendingUp,
  Dumbbell,
  Apple,
  CreditCard,
  ShoppingCart,
  FileText,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export function AdminQuickActions() {
  const quickActions = [
    {
      id: 'users',
      label: 'Gestisci Utenti',
      href: '/admin/users',
      icon: Users,
      description: 'Anagrafica e ruoli',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'exercises',
      label: 'Catalogo Esercizi',
      href: '/admin/exercises',
      icon: Dumbbell,
      description: 'Gestione esercizi',
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'coach-dashboard',
      label: 'Coach Dashboard',
      href: '/coach/dashboard',
      icon: GraduationCap,
      description: 'Accesso rapido agli strumenti coach',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      id: 'foods',
      label: 'Catalogo Alimenti',
      href: '/admin/foods',
      icon: Apple,
      description: 'Database nutrizionale',
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'subscriptions',
      label: 'Abbonamenti',
      href: '/admin/subscriptions',
      icon: CreditCard,
      description: 'Piani e pagamenti',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'commerce',
      label: 'Checkout & Cart',
      href: '/admin/checkout',
      icon: ShoppingCart,
      description: 'Configura checkout, carrelli e offerte',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      description: 'Report dettagliati',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      id: 'coach-analytics',
      label: 'Coach Analytics',
      href: '/coach/analytics',
      icon: TrendingUp,
      description: 'Performance piani e vendite coach',
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'ai-settings',
      label: 'AI Settings',
      href: '/admin/ai-settings',
      icon: Sparkles,
      description: 'Provider, modelli, billing',
      color: 'from-violet-500 to-indigo-600',
    },
    {
      id: 'prompts',
      label: 'System Prompts',
      href: '/admin/prompts',
      icon: FileText,
      description: 'Gestione prompt AI',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <QuickActionsGrid
      actions={quickActions}
      className="grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    />
  );
}
