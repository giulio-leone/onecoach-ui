'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, X, Dumbbell, Plus, Heart, Clock, SlidersHorizontal, Play } from 'lucide-react';

import { logger } from '@giulio-leone/lib-shared';
import type { Exercise } from '@giulio-leone/types/workout';
import type { MuscleGroup, ExerciseCategory } from '@giulio-leone/types';

/** Shape returned by /api/exercises/autocomplete */
interface AutocompleteExercise {
  id: string;
  slug: string;
  name: string;
  exerciseTypeName: string | null;
  overview: string | null;
  videoUrl: string | null;
  muscles: Array<{ id: string; name: string; slug: string; role: string }>;
  equipments: Array<{ id: string; name: string; slug: string }>;
}

const EXERCISE_TYPE_TO_CATEGORY: Record<string, ExerciseCategory> = {
  strength: 'strength',
  cardio: 'cardio',
  flexibility: 'flexibility',
  balance: 'balance',
};

const MUSCLE_SLUG_TO_GROUP: Record<string, MuscleGroup> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  biceps: 'arms',
  triceps: 'arms',
  forearms: 'arms',
  quadriceps: 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  calves: 'legs',
  abs: 'core',
};

function mapApiExercise(ex: AutocompleteExercise): Omit<Exercise, 'setGroups' | 'notes' | 'typeLabel' | 'repRange' | 'formCues'> {
  const categoryKey = (ex.exerciseTypeName ?? '').toLowerCase();
  const category: ExerciseCategory = EXERCISE_TYPE_TO_CATEGORY[categoryKey] ?? 'strength';
  const muscleGroups = Array.from(
    new Set(ex.muscles.map((m) => MUSCLE_SLUG_TO_GROUP[m.slug] ?? 'full-body'))
  ) as MuscleGroup[];
  return {
    id: ex.id,
    catalogExerciseId: ex.id,
    name: ex.name,
    description: ex.overview ?? '',
    category,
    muscleGroups,
    equipment: ex.equipments.map((e) => e.slug),
    videoUrl: ex.videoUrl ?? undefined,
  };
}

const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full-body',
];

const ALL_CATEGORIES: ExerciseCategory[] = [
  'strength', 'cardio', 'flexibility', 'balance', 'endurance', 'core',
];

const COMMON_EQUIPMENT = [
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine',
  'bodyweight', 'band', 'smith-machine',
];

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

type Tab = 'all' | 'recent' | 'favorites';

// localStorage helpers
function getRecentIds(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('onecoach:recent-exercises') || '[]'); } catch { return []; }
}
function addRecent(id: string) {
  if (typeof window === 'undefined') return;
  const r = getRecentIds().filter((x) => x !== id);
  r.unshift(id);
  localStorage.setItem('onecoach:recent-exercises', JSON.stringify(r.slice(0, 20)));
}
function getFavIds(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('onecoach:favorite-exercises') || '[]'); } catch { return []; }
}
function toggleFav(id: string): boolean {
  const favs = getFavIds();
  const idx = favs.indexOf(id);
  if (idx >= 0) { favs.splice(idx, 1); localStorage.setItem('onecoach:favorite-exercises', JSON.stringify(favs)); return false; }
  favs.push(id);
  localStorage.setItem('onecoach:favorite-exercises', JSON.stringify(favs));
  return true;
}

function parseYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

/**
 * ExerciseSelector - Multi-filter exercise picker with recent/favorites and video thumbnails.
 */
export function ExerciseSelector({ isOpen, onClose, onSelect }: ExerciseSelectorProps) {
  const t = useTranslations('workouts.builder.selector');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ExerciseCategory[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [exercises, setExercises] = useState<Omit<Exercise, 'setGroups' | 'notes' | 'typeLabel' | 'repRange' | 'formCues'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Reload localStorage state on open
  useEffect(() => {
    if (!isOpen) return;
    setFavIds(getFavIds());
    setRecentIds(getRecentIds());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchExercises = async () => {
      setIsLoading(true);
      try {
        const q = searchQuery.trim();
        let url: string;

        if (q.length >= 2) {
          // Search mode: use autocomplete with BM25
          const params = new URLSearchParams({ q, locale, limit: '30' });
          if (selectedMuscles.length > 0) params.set('muscles', selectedMuscles.join(','));
          if (selectedEquipment.length > 0) params.set('equipments', selectedEquipment.join(','));
          url = `/api/exercises/autocomplete?${params.toString()}`;
        } else if (q.length > 0) {
          // Too short for search
          setExercises([]);
          setIsLoading(false);
          return;
        } else {
          // Browse mode: list all exercises
          const params = new URLSearchParams({ locale, pageSize: '50' });
          if (selectedMuscles.length > 0) params.set('muscles', selectedMuscles.join(','));
          if (selectedEquipment.length > 0) params.set('equipments', selectedEquipment.join(','));
          url = `/api/exercises?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        const data: AutocompleteExercise[] = json.data ?? [];
        setExercises(data.map(mapApiExercise));
      } catch (error: unknown) {
        logger.error('Failed to fetch exercises', error);
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    };
    const debounce = setTimeout(fetchExercises, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isOpen, locale, selectedMuscles, selectedEquipment]);

  // Multi-filter
  const filteredExercises = useMemo(() => {
    let result = exercises;
    const q = searchQuery.toLowerCase().trim();

    if (q) {
      result = result.filter((ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        const muscles = (ex.muscleGroups || []).join(' ').toLowerCase();
        return name.includes(q) || desc.includes(q) || muscles.includes(q);
      });
    }

    if (selectedMuscles.length > 0) {
      result = result.filter((ex) =>
        selectedMuscles.some((m) => (ex.muscleGroups || []).includes(m)),
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((ex) =>
        ex.category && selectedCategories.includes(ex.category),
      );
    }

    if (selectedEquipment.length > 0) {
      result = result.filter((ex) =>
        selectedEquipment.some((e) => (ex.equipment || []).includes(e)),
      );
    }

    // Tab filtering
    if (activeTab === 'recent') {
      const recentSet = new Set(recentIds);
      result = result.filter((ex) => recentSet.has(ex.catalogExerciseId || ex.id));
    } else if (activeTab === 'favorites') {
      const favSet = new Set(favIds);
      result = result.filter((ex) => favSet.has(ex.catalogExerciseId || ex.id));
    }

    return result;
  }, [exercises, searchQuery, selectedMuscles, selectedCategories, selectedEquipment, activeTab, recentIds, favIds]);

  const activeFilterCount = selectedMuscles.length + selectedCategories.length + selectedEquipment.length;

  const toggleMuscle = useCallback((m: MuscleGroup) => {
    setSelectedMuscles((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  }, []);

  const toggleCategory = useCallback((c: ExerciseCategory) => {
    setSelectedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }, []);

  const toggleEquip = useCallback((e: string) => {
    setSelectedEquipment((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  }, []);

  const handleFavToggle = useCallback((catalogId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFav(catalogId);
    setFavIds(getFavIds());
  }, []);

  const handleSelect = (ex: Omit<Exercise, 'setGroups' | 'notes' | 'typeLabel' | 'repRange' | 'formCues'>) => {
    const catalogId = ex.catalogExerciseId || ex.id;
    if (!catalogId) {
      logger.error('[ExerciseSelector] Cannot determine catalogExerciseId for:', ex);
      return;
    }
    addRecent(catalogId);
    setRecentIds(getRecentIds());

    const newExercise: Exercise = {
      id: `exercise_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      catalogExerciseId: catalogId,
      name: ex.name,
      description: ex.description ?? '',
      category: ex.category,
      muscleGroups: ex.muscleGroups,
      setGroups: [
        {
          id: `setgroup_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          count: 3,
          baseSet: {
            reps: 10,
            weight: 0,
            weightLbs: 0,
            rest: 60,
            intensityPercent: 0,
            rpe: 8,
          },
          sets: [],
        },
      ],
      notes: '',
      typeLabel: '',
      repRange: '',
      formCues: [],
      equipment: ex.equipment || [],
    };
    onSelect(newExercise);
  };

  const clearAllFilters = () => {
    setSelectedMuscles([]);
    setSelectedCategories([]);
    setSelectedEquipment([]);
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 pt-8 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-neutral-950 shadow-2xl ring-1 ring-neutral-800 sm:h-[82vh] sm:rounded-3xl">
        {/* Header */}
        <div className="border-b border-neutral-800 p-4 pb-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{t('title')}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              aria-label={t('close')}
            >
              <X size={24} className="text-neutral-400" />
            </button>
          </div>

          {/* Search bar + filter toggle */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-neutral-900 p-2 ring-1 ring-transparent focus-within:ring-primary-500">
              <Search size={18} className="ml-2 text-neutral-500" />
              <input
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1">
                  <X size={14} className="text-neutral-500" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-1 rounded-xl p-3 transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={18} />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Tabs: All / Recent / Favorites */}
          <div className="mt-3 flex gap-1 rounded-lg bg-neutral-900 p-1">
            {(['all', 'recent', 'favorites'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab === 'recent' && <Clock size={12} />}
                {tab === 'favorites' && <Heart size={12} />}
                {tab === 'all' && <Dumbbell size={12} />}
                {t(`tabs.${tab}`)}
              </button>
            ))}
          </div>

          {/* Muscle group pills (always visible) */}
          <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
            {ALL_MUSCLE_GROUPS.map((muscle) => (
              <button
                key={muscle}
                onClick={() => toggleMuscle(muscle)}
                className={`rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors ${
                  selectedMuscles.includes(muscle)
                    ? 'border-primary-500 bg-primary-600 text-white'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                <span className="text-sm capitalize">{t(`muscles.${muscle}`)}</span>
              </button>
            ))}
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-3 space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
              {/* Category filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">{t('filters.category')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        selectedCategories.includes(cat)
                          ? 'border-violet-500 bg-violet-600/30 text-violet-300'
                          : 'border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {t(`categories.${cat}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">{t('filters.equipment')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_EQUIPMENT.map((eq) => (
                    <button
                      key={eq}
                      onClick={() => toggleEquip(eq)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        selectedEquipment.includes(eq)
                          ? 'border-amber-500 bg-amber-600/30 text-amber-300'
                          : 'border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {t(`equipment.${eq}`)}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  {t('filters.clearAll')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-3 pb-16 sm:pb-8">
              {filteredExercises.map((ex) => {
                const catalogId = ex.catalogExerciseId || ex.id;
                const isFav = favIds.includes(catalogId);
                const ytId = ex.videoUrl ? parseYouTubeId(ex.videoUrl) : null;

                return (
                  <button
                    key={ex.id}
                    onClick={() => handleSelect(ex)}
                    className="hover:bg-neutral-850 flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-left transition-colors hover:border-primary-500/60 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none sm:gap-4 sm:p-4"
                  >
                    {/* Video thumbnail or icon */}
                    {ytId ? (
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play size={12} className="text-white" fill="white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500/10">
                        <Dumbbell size={24} className="text-primary-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-white">{ex.name}</div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <span className="truncate capitalize">{ex.muscleGroups?.join(', ')}</span>
                        {ex.equipment && ex.equipment.length > 0 && (
                          <>
                            <span className="text-neutral-600">·</span>
                            <span className="truncate capitalize">{ex.equipment.join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Favorite toggle */}
                    <button
                      onClick={(e) => handleFavToggle(catalogId, e)}
                      className="shrink-0 p-1"
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        size={18}
                        className={isFav ? 'fill-red-500 text-red-500' : 'text-neutral-600 hover:text-red-400'}
                      />
                    </button>

                    <Plus size={20} className="shrink-0 text-primary-400" />
                  </button>
                );
              })}
              {filteredExercises.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-neutral-500">
                  <Dumbbell size={48} className="mb-4 opacity-40" />
                  <p>{t('noResults')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
