'use client';

import { useTranslations } from 'next-intl';
/**
 * Coach Profile Form Component
 *
 * Premium glass UI form for editing coach profile with auto-save
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../card';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Switch } from '../switch';
import { Textarea } from '../textarea';
import { Avatar } from '../avatar';
import { Heading, Text } from '../typography';
import { coachApi, coachKeys, type CoachProfile } from '@giulio-leone/lib-api';
import { cn } from '@giulio-leone/lib-design-system';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Link2,
  Settings,
  Loader2,
  Check,
  AlertCircle,
  Linkedin,
  Instagram,
  Globe,
  X,
  Plus,
  Shield,
  ShieldCheck,
  ShieldX,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore, useRealtimeSubscription, useMagicAnimation } from '@giulio-leone/lib-stores';

import { logger } from '@giulio-leone/lib-shared';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type CoachProfileFormState = {
  bio: string;
  credentials: string[];
  coachingStyle: string;
  linkedinUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  isPubliclyVisible: boolean;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const emptyForm: CoachProfileFormState = {
  bio: '',
  credentials: [],
  coachingStyle: '',
  linkedinUrl: '',
  instagramUrl: '',
  websiteUrl: '',
  isPubliclyVisible: false,
};

const DEBOUNCE_MS = 800;
const BIO_MAX_LENGTH = 500;
const STYLE_MAX_LENGTH = 300;

// ----------------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------------

const FloatingDock = ({
  items,
  activeTab,
  onTabChange,
}: {
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) => (
  <div className="scrollbar-hide mx-auto flex max-w-[95vw] touch-pan-x items-center gap-0.5 overflow-x-auto rounded-2xl border border-white/40 bg-white/70 p-1 shadow-xl shadow-black/5 backdrop-blur-xl sm:max-w-fit sm:gap-1 sm:rounded-3xl sm:p-1.5 dark:border-white/5 dark:bg-black/60">
    {items.map((item) => {
      const isActive = activeTab === item.id;
      const Icon = item.icon;

      return (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          type="button"
          className={cn(
            'group relative flex-shrink-0 rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-300 outline-none select-none sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm',
            isActive
              ? 'text-white'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
          )}
        >
          {isActive && (
            <motion.div
              layoutId="coach-floating-pill"
              className="absolute inset-0 rounded-xl bg-neutral-900 shadow-md sm:rounded-2xl dark:bg-white"
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
            <Icon
              size={14}
              className={cn(
                'transition-colors sm:h-[18px] sm:w-[18px]',
                isActive
                  ? 'text-white dark:text-black'
                  : 'text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200'
              )}
            />
            <span
              className={cn(
                'hidden font-semibold sm:inline',
                isActive ? 'text-white dark:text-black' : ''
              )}
            >
              {item.label}
            </span>
          </div>
        </button>
      );
    })}
  </div>
);

const GlassPill = ({ label, value }: { label: string; value: string }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex flex-col items-center justify-center rounded-lg border border-white/20 bg-white/40 px-2 py-1.5 shadow-sm shadow-black/5 backdrop-blur-md transition-all hover:bg-white/60 sm:rounded-xl sm:px-4 sm:py-2.5 sm:shadow-md dark:border-white/5 dark:bg-white/5 dark:shadow-black/10 dark:hover:bg-white/10"
  >
    <span className="text-[8px] font-bold tracking-widest text-neutral-500 uppercase sm:text-[10px] dark:text-neutral-400">
      {label}
    </span>
    <span className="text-sm font-black text-neutral-900 sm:text-lg dark:text-white">{value}</span>
  </motion.div>
);

const CredentialChip = ({ credential, onRemove }: { credential: string; onRemove: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="group flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:border-indigo-700"
  >
    <span>{credential}</span>
    <Button
      variant="ghost"
      onClick={onRemove}
      className="h-auto p-0.5 opacity-60 transition-opacity hover:bg-indigo-200 hover:opacity-100 dark:hover:bg-indigo-800 rounded-full"
    >
      <X size={12} />
    </Button>
  </motion.div>
);

const VerificationBadge = ({ status }: { status: string }) => {
  const config = {
    PENDING: {
      icon: Shield,
      label: 'In attesa',
      className:
        'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    },
    APPROVED: {
      icon: ShieldCheck,
      label: 'Verificato',
      className:
        'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    },
    REJECTED: {
      icon: ShieldX,
      label: 'Non verificato',
      className:
        'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    },
  }[status] || {
    icon: Shield,
    label: 'Sconosciuto',
    className:
      'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-950 dark:text-neutral-400 dark:border-neutral-800',
  };

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        config.className
      )}
    >
      <Icon size={14} />
      <span>{config.label}</span>
    </div>
  );
};

const SaveStatusIndicator = ({ status }: { status: SaveStatus }) => {
  const t = useTranslations('coach');
  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed right-6 bottom-6 z-50 md:right-10 md:bottom-10"
        >
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-2xl backdrop-blur-xl',
              status === 'saving' &&
                'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300',
              status === 'saved' &&
                'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300',
              status === 'error' &&
                'border-red-500/30 bg-red-500/10 text-red-600 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-300'
            )}
          >
            {status === 'saving' && (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm font-semibold">Salvataggio...</span>
              </>
            )}
            {status === 'saved' && (
              <>
                <Check size={20} />
                <span className="text-sm font-semibold">Salvato</span>
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle size={20} />
                <span className="text-sm font-semibold">
                  {t('coach_profile_form.errore_di_salvataggio')}
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CharacterCounter = ({ current, max }: { current: number; max: number }) => {
  const percentage = (current / max) * 100;
  const isWarning = percentage >= 80;
  const isError = percentage >= 100;

  return (
    <span
      className={cn(
        'text-xs font-medium transition-colors',
        isError
          ? 'text-red-500 dark:text-red-400'
          : isWarning
            ? 'text-amber-500 dark:text-amber-400'
            : 'text-neutral-400 dark:text-neutral-500'
      )}
    >
      {current}/{max}
    </span>
  );
};

const UrlValidationIcon = ({
  url,
  type,
}: {
  url: string;
  type: 'linkedin' | 'instagram' | 'website';
}) => {
  if (!url) return null;

  const patterns = {
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\//i,
    instagram: /^https?:\/\/(www\.)?instagram\.com\//i,
    website: /^https?:\/\/.+\..+/i,
  };

  const isValid = patterns[type].test(url);

  return (
    <div className={cn('ml-2', isValid ? 'text-emerald-500' : 'text-red-400')}>
      {isValid ? <Check size={16} /> : <AlertCircle size={16} />}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export interface CoachProfileFormProps {
  initialProfile: CoachProfile | null;
  isLoading?: boolean;
}

export function CoachProfileForm({ initialProfile, isLoading }: CoachProfileFormProps) {
  const t = useTranslations('coach');
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'settings'>('profile');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [newCredential, setNewCredential] = useState('');
  const [isProfileNew, setIsProfileNew] = useState(() => !initialProfile);

  // Debounce refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Magic animation for realtime updates
  const { animationClass, trigger: triggerMagic } = useMagicAnimation({
    type: 'shimmer',
    duration: 1500,
  });

  useEffect(() => {
    setIsProfileNew(!initialProfile);
  }, [initialProfile]);

  const derivedInitialForm = useMemo<CoachProfileFormState>(() => {
    if (!initialProfile) {
      return emptyForm;
    }
    return {
      bio: initialProfile.bio || '',
      credentials: Array.isArray(initialProfile.credentials)
        ? initialProfile.credentials
        : initialProfile.credentials
          ? String(initialProfile.credentials)
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
      coachingStyle: initialProfile.coachingStyle || '',
      linkedinUrl: initialProfile.linkedinUrl || '',
      instagramUrl: initialProfile.instagramUrl || '',
      websiteUrl: initialProfile.websiteUrl || '',
      isPubliclyVisible: initialProfile.isPubliclyVisible || false,
    };
  }, [initialProfile]);

  const [formData, setFormData] = useState<CoachProfileFormState>(derivedInitialForm);
  const [initialFormData, setInitialFormData] = useState<CoachProfileFormState>(derivedInitialForm);

  useEffect(() => {
    setFormData(derivedInitialForm);
    setInitialFormData(derivedInitialForm);
  }, [derivedInitialForm]);

  const hasChanges = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialFormData),
    [formData, initialFormData]
  );

  // Mutations
  const createProfileMutation = useMutation({
    mutationFn: (data: Partial<CoachProfile>) => coachApi.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachKeys.profile() });
      setIsProfileNew(false);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<CoachProfile>) => coachApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachKeys.profile() });
    },
  });

  // Build payload
  const buildPayload = useCallback(
    (data: CoachProfileFormState): Partial<CoachProfile> => ({
      bio: data.bio || undefined,
      credentials: data.credentials.length > 0 ? data.credentials : undefined,
      coachingStyle: data.coachingStyle || undefined,
      linkedinUrl: data.linkedinUrl || undefined,
      instagramUrl: data.instagramUrl || undefined,
      websiteUrl: data.websiteUrl || undefined,
      isPubliclyVisible: data.isPubliclyVisible,
    }),
    []
  );

  // Perform save
  const performSave = useCallback(
    async (data: CoachProfileFormState) => {
      setSaveStatus('saving');
      const payload = buildPayload(data);

      try {
        if (isProfileNew) {
          await createProfileMutation.mutateAsync(payload);
        } else {
          await updateProfileMutation.mutateAsync(payload);
        }
        setInitialFormData(data);
        setSaveStatus('saved');

        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch {
        setSaveStatus('error');
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }
    },
    [buildPayload, isProfileNew, createProfileMutation, updateProfileMutation]
  );

  // Debounced auto-save
  useEffect(() => {
    if (!hasChanges) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSave(formData);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [formData, hasChanges, performSave]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  // Supabase Realtime subscription for coach_profiles
  useRealtimeSubscription<Record<string, unknown>>({
    table: 'coach_profiles',
    filter: initialProfile?.id ? `id=eq.${initialProfile.id}` : undefined,
    enabled: !!initialProfile?.id && !!user?.id,
    onUpdate: () => {
      // Invalidate React Query cache to refetch
      queryClient.invalidateQueries({ queryKey: coachKeys.profile() });
      // Trigger magic animation
      triggerMagic();
    },
    onError: (error) => {
      logger.error('[Coach Profile Realtime] Error:', error);
    },
  });

  // Handlers
  const handleAddCredential = () => {
    const trimmed = newCredential.trim();
    if (trimmed && !formData.credentials.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        credentials: [...prev.credentials, trimmed],
      }));
      setNewCredential('');
    }
  };

  const handleRemoveCredential = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index),
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profilo', icon: User },
    { id: 'social', label: 'Social & Link', icon: Link2 },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-500 border-t-white/20" />
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="mb-6 flex flex-col items-center gap-4 sm:mb-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-50 blur-md transition duration-500 group-hover:opacity-100" />
            <Avatar
              src={user?.profileImage || undefined}
              fallback={user?.name?.slice(0, 2).toUpperCase() || 'C'}
              className="relative h-16 w-16 border-2 border-white shadow-lg sm:h-20 sm:w-20 dark:border-neutral-900"
            />
          </div>

          {/* Info */}
          <div>
            <Heading level={2} size="xl" weight="bold" className="text-neutral-900 sm:text-2xl dark:text-white">
              {user?.name || 'Coach'}
            </Heading>
            <div className="mt-1 flex items-center gap-2">
              <VerificationBadge status={initialProfile?.verificationStatus || 'PENDING'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          <GlassPill label="Credenziali" value={String(formData.credentials.length)} />
          <GlassPill
            label={t('coach_profile_form.visibilita')}
            value={formData.isPubliclyVisible ? 'Pubblico' : 'Privato'}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-2 z-40 mb-6 sm:top-4 sm:mb-8">
        <FloatingDock
          items={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as 'profile' | 'social' | 'settings')}
        />
      </div>

      {/* Tab Content */}
      <div className={cn('min-h-[500px]', animationClass)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Bio */}
                <Card
                  variant="glass"
                  className="border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-black/30"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Label htmlFor="bio" className="text-base font-semibold">
                      Biografia
                    </Label>
                    <CharacterCounter current={formData.bio.length} max={BIO_MAX_LENGTH} />
                  </div>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev) => ({
                        ...prev,
                        bio: e.target.value.slice(0, BIO_MAX_LENGTH),
                      }))
                    }
                    placeholder={t(
                      'coach.coach_profile_form.racconta_la_tua_storia_come_coach_la_tua'
                    )}
                    rows={5}
                    className="bg-white/50 backdrop-blur-sm dark:bg-black/20"
                  />
                  <Text size="xs" className="mt-2 text-neutral-500 dark:text-neutral-400">
                    {t('coach_profile_form.descrivi_la_tua_esperienza_e_il_tuo_appr')}
                  </Text>
                </Card>

                {/* Credentials */}
                <Card
                  variant="glass"
                  className="border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-black/30"
                >
                  <Label className="mb-4 block text-base font-semibold">
                    {t('coach_profile_form.credenziali_certificazioni')}
                  </Label>

                  {/* Existing Credentials */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <AnimatePresence mode="popLayout">
                      {formData.credentials.map((cred, index) => (
                        <CredentialChip
                          key={cred}
                          credential={cred}
                          onRemove={() => handleRemoveCredential(index)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add New Credential */}
                  <div className="flex gap-2">
                    <Input
                      value={newCredential}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewCredential(e.target.value)
                      }
                      placeholder={t(
                        'coach.coach_profile_form.aggiungi_credenziale_es_personal_trainer'
                      )}
                      className="flex-1 bg-white/50 backdrop-blur-sm dark:bg-black/20"
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCredential();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCredential}
                      disabled={!newCredential.trim()}
                      className="shrink-0"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </Card>

                {/* Coaching Style */}
                <Card
                  variant="glass"
                  className="border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-black/30"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Label htmlFor="coachingStyle" className="text-base font-semibold">
                      {t('coach_profile_form.stile_di_coaching')}
                    </Label>
                    <CharacterCounter
                      current={formData.coachingStyle.length}
                      max={STYLE_MAX_LENGTH}
                    />
                  </div>
                  <Textarea
                    id="coachingStyle"
                    value={formData.coachingStyle}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev) => ({
                        ...prev,
                        coachingStyle: e.target.value.slice(0, STYLE_MAX_LENGTH),
                      }))
                    }
                    placeholder={t(
                      'coach.coach_profile_form.descrivi_il_tuo_approccio_al_coaching_la'
                    )}
                    rows={4}
                    className="bg-white/50 backdrop-blur-sm dark:bg-black/20"
                  />
                </Card>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <Card
                variant="glass"
                className="border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-black/30"
              >
                <Heading level={3} size="lg" weight="semibold" className="mb-6">
                  {t('coach_profile_form.social_media_link')}
                </Heading>
                <div className="space-y-5">
                  {/* LinkedIn */}
                  <div>
                    <Label htmlFor="linkedinUrl" className="mb-2 flex items-center gap-2">
                      <Linkedin size={18} className="text-[#0A66C2]" />
                      LinkedIn
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                        }
                        placeholder="https://linkedin.com/in/tuoprofilo"
                        className="flex-1 bg-white/50 backdrop-blur-sm dark:bg-black/20"
                      />
                      <UrlValidationIcon url={formData.linkedinUrl} type="linkedin" />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <Label htmlFor="instagramUrl" className="mb-2 flex items-center gap-2">
                      <Instagram size={18} className="text-[#E4405F]" />
                      Instagram
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="instagramUrl"
                        type="url"
                        value={formData.instagramUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev) => ({ ...prev, instagramUrl: e.target.value }))
                        }
                        placeholder="https://instagram.com/tuoprofilo"
                        className="flex-1 bg-white/50 backdrop-blur-sm dark:bg-black/20"
                      />
                      <UrlValidationIcon url={formData.instagramUrl} type="instagram" />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <Label htmlFor="websiteUrl" className="mb-2 flex items-center gap-2">
                      <Globe size={18} className="text-indigo-500" />
                      {t('coach_profile_form.sito_web')}
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="websiteUrl"
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))
                        }
                        placeholder="https://tuosito.com"
                        className="flex-1 bg-white/50 backdrop-blur-sm dark:bg-black/20"
                      />
                      <UrlValidationIcon url={formData.websiteUrl} type="website" />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Visibility */}
                <Card
                  variant="glass"
                  className="border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-black/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'rounded-xl p-3 transition-colors',
                          formData.isPubliclyVisible
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                        )}
                      >
                        {formData.isPubliclyVisible ? <Eye size={24} /> : <EyeOff size={24} />}
                      </div>
                      <div>
                        <Label htmlFor="isPubliclyVisible" className="text-base font-semibold">
                          {t('coach_profile_form.visibilita_pubblica')}
                        </Label>
                        <Text size="sm" className="mt-1 text-neutral-600 dark:text-neutral-400">
                          {t('coach_profile_form.rendi_il_tuo_profilo_visibile_nel_market')}
                        </Text>
                      </div>
                    </div>
                    <Switch
                      id="isPubliclyVisible"
                      checked={formData.isPubliclyVisible}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev) => ({
                          ...prev,
                          isPubliclyVisible: e.target.checked,
                        }))
                      }
                    />
                  </div>
                </Card>

                {/* Verification Status */}
                <Card
                  variant="glass"
                  className="border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-black/30"
                >
                  <h3 className="mb-4 text-lg font-semibold">
                    {t('coach_profile_form.stato_verifica')}
                  </h3>
                  <div className="flex items-center gap-4">
                    <VerificationBadge status={initialProfile?.verificationStatus || 'PENDING'} />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {initialProfile?.verificationStatus === 'APPROVED'
                        ? 'Il tuo profilo è stato verificato e approvato.'
                        : initialProfile?.verificationStatus === 'REJECTED'
                          ? 'La tua richiesta di verifica è stata rifiutata.'
                          : 'La tua richiesta di verifica è in attesa di approvazione.'}
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Save Status Indicator */}
      <SaveStatusIndicator status={saveStatus} />
    </>
  );
}
