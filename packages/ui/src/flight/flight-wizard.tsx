'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AirplaneTilt,
  Users,
  ArrowRight,
  AirplaneTakeoff,
  AirplaneLanding,
  Sparkle,
  MagnifyingGlass,
  CalendarBlank,
  CaretRight,
  CaretLeft,
  ArrowsLeftRight,
  SuitcaseRolling,
  Check,
} from '@phosphor-icons/react';
import { WizardRadioGroup, DateRangePicker } from '@giulio-leone/ui';
import { cn } from '@giulio-leone/lib-design-system';
import { useTranslations } from 'next-intl';

import type { FlightSearchFormData, CabinClass } from './form';
import { createInitialFlightSearchFormData } from './form';
import { useSmartFlightSearch } from './use-smart-flight-search';
import { FlightResults } from './flight-results';
import { AirportCombobox } from './airport-combobox';
import type { Airport } from './types';

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const parseDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return undefined;
  const [dayStr, monthStr, yearStr] = parts;
  if (!dayStr || !monthStr || !yearStr) return undefined;

  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const year = parseInt(yearStr, 10);
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? undefined : date;
};

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// ----------------------------------------------------------------------------
// Premium Trip Type Card Component
// ----------------------------------------------------------------------------

interface TripTypeCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function TripTypeCard({ selected, onSelect, icon, title, description }: TripTypeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative overflow-hidden rounded-3xl border-2 p-6 text-left transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        selected
          ? [
              'border-blue-500/80 shadow-2xl',
              // Light mode selected
              'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50',
              // Dark mode selected
              'dark:border-blue-500/50 dark:bg-blue-600/20',
              'dark:shadow-blue-500/20',
            ]
          : [
              'border-neutral-200 hover:border-neutral-300',
              // Light mode
              'bg-white hover:bg-neutral-50 hover:shadow-xl',
              // Dark mode
              'dark:border-white/10 dark:bg-white/5',
              'dark:hover:bg-white/10',
            ]
      )}
    >
      {/* Glow effect on hover */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500',
          'bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10',
          'group-hover:opacity-100',
          selected && 'opacity-100'
        )}
      />

      {/* Animated background pattern */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500',
          'group-hover:opacity-30 dark:group-hover:opacity-10',
          selected && 'opacity-40 dark:opacity-20'
        )}
        style={{
          backgroundImage: `radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`,
        }}
      />

      {/* Icon */}
      <motion.div
        animate={{
          scale: selected ? 1.05 : 1,
          rotate: selected ? [0, -5, 5, 0] : 0,
        }}
        transition={{ duration: 0.4 }}
        className={cn(
          'relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
          selected
            ? [
                'bg-gradient-to-br from-blue-500 to-indigo-600',
                'text-white shadow-xl shadow-blue-500/40',
                'dark:shadow-blue-500/30',
              ]
            : [
                'bg-neutral-100 text-neutral-500',
                'group-hover:bg-neutral-200 group-hover:text-neutral-700',
                'dark:bg-neutral-800 dark:text-neutral-400',
                'dark:group-hover:bg-neutral-700 dark:group-hover:text-neutral-300',
              ]
        )}
      >
        {icon}
      </motion.div>

      {/* Content */}
      <h3
        className={cn(
          'text-xl font-bold tracking-tight transition-colors',
          selected ? 'text-blue-900 dark:text-blue-100' : 'text-neutral-900 dark:text-white'
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'mt-2 text-sm leading-relaxed transition-colors',
          selected
            ? 'text-blue-700/80 dark:text-blue-100/70'
            : 'text-neutral-500 dark:text-neutral-400'
        )}
      >
        {description}
      </p>

      {/* Selection indicator */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'absolute right-5 bottom-5 flex h-7 w-7 items-center justify-center rounded-full',
              'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
              'shadow-lg shadow-blue-500/40'
            )}
          >
            <Check className="h-4 w-4" weight="bold" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ----------------------------------------------------------------------------
// Premium Step Components
// ----------------------------------------------------------------------------

interface StepTripTypeProps {
  data: FlightSearchFormData;
  update: (val: Partial<FlightSearchFormData>) => void;
  t: ReturnType<typeof useTranslations>;
}

const StepTripType = ({ data, update, t }: StepTripTypeProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <TripTypeCard
        selected={data.tripType === 'round-trip'}
        onSelect={() => update({ tripType: 'round-trip' })}
        icon={<ArrowsLeftRight className="h-7 w-7" weight="duotone" />}
        title={t('wizard.tripTypes.roundTrip.title')}
        description={t('wizard.tripTypes.roundTrip.description')}
      />
      <TripTypeCard
        selected={data.tripType === 'one-way'}
        onSelect={() => update({ tripType: 'one-way' })}
        icon={<ArrowRight className="h-7 w-7" weight="duotone" />}
        title={t('wizard.tripTypes.oneWay.title')}
        description={t('wizard.tripTypes.oneWay.description')}
      />
    </div>
  </div>
);

interface StepRouteProps {
  data: FlightSearchFormData;
  update: (val: Partial<FlightSearchFormData>) => void;
  t: ReturnType<typeof useTranslations>;
  initialAirports: Airport[];
  searchAirports: (query: string) => Promise<Airport[]>;
}

const StepRoute = ({ data, update, initialAirports, searchAirports, t }: StepRouteProps) => (
  <div className="space-y-6">
    {/* Premium Route Selection */}
    <div className="relative">
      {/* Connection line (decorative) */}
      <div
        className={cn(
          'pointer-events-none absolute top-[3.25rem] right-12 left-12 hidden h-0.5 md:block',
          'bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-indigo-500/0',
          'dark:via-blue-400/20'
        )}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Departure */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl',
                'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
                'shadow-xl shadow-blue-500/30 dark:shadow-blue-500/20'
              )}
            >
              <AirplaneTakeoff className="h-6 w-6" weight="fill" />
            </div>
            <div>
              <label
                className={cn(
                  'text-xs font-bold tracking-widest uppercase',
                  'text-neutral-500 dark:text-neutral-400'
                )}
              >
                {t('wizard.labels.departureFrom')}
              </label>
            </div>
          </div>

          <AirportCombobox
            value={data.flyFrom}
            onChange={(codes) => update({ flyFrom: codes })}
            placeholder={t('wizard.placeholders.selectAirports')}
            searchPlaceholder={t('wizard.placeholders.searchDeparture')}
            hint={t('wizard.hints.multipleAirports')}
            initialAirports={initialAirports}
            searchAirports={searchAirports}
            translations={{
              selected: t('wizard.airport.selected'),
              noResults: t('wizard.airport.noResults'),
              loading: t('wizard.airport.loading'),
              typeToSearch: t('wizard.airport.typeToSearch'),
              clearAll: t('wizard.airport.clearAll'),
              popularAirports: t('wizard.airport.popularAirports'),
              searchResults: t('wizard.airport.searchResults'),
            }}
          />
        </div>

        {/* Destination */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl',
                'bg-gradient-to-br from-indigo-500 to-purple-600 text-white',
                'shadow-xl shadow-indigo-500/30 dark:shadow-indigo-500/20'
              )}
            >
              <AirplaneLanding className="h-6 w-6" weight="fill" />
            </div>
            <div>
              <label
                className={cn(
                  'text-xs font-bold tracking-widest uppercase',
                  'text-neutral-500 dark:text-neutral-400'
                )}
              >
                {t('wizard.labels.destination')}
              </label>
            </div>
          </div>

          <AirportCombobox
            value={data.flyTo}
            onChange={(codes) => update({ flyTo: codes })}
            placeholder={t('wizard.placeholders.selectAirports')}
            searchPlaceholder={t('wizard.placeholders.searchDestination')}
            hint={t('wizard.hints.multipleDestinations')}
            initialAirports={initialAirports}
            searchAirports={searchAirports}
            translations={{
              selected: t('wizard.airport.selected'),
              noResults: t('wizard.airport.noResults'),
              loading: t('wizard.airport.loading'),
              typeToSearch: t('wizard.airport.typeToSearch'),
              clearAll: t('wizard.airport.clearAll'),
              popularAirports: t('wizard.airport.popularAirports'),
              searchResults: t('wizard.airport.searchResults'),
            }}
          />
        </div>
      </div>
    </div>
  </div>
);

interface StepDatesProps {
  data: FlightSearchFormData;
  update: (val: Partial<FlightSearchFormData>) => void;
  t: ReturnType<typeof useTranslations>;
}

const StepDates = ({ data, update, t }: StepDatesProps) => {
  const departureDate = parseDate(data.departureDate);
  const returnDate = parseDate(data.returnDate || '');
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const handleDepartureDateChange = (date: Date | undefined) => {
    update({ departureDate: date ? formatDate(date) : '' });
  };

  const handleReturnDateChange = (date: Date | undefined) => {
    update({ returnDate: date ? formatDate(date) : '' });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Picker - Integrated */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl',
              'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
              'shadow-xl shadow-amber-500/30 dark:shadow-amber-500/20'
            )}
          >
            <CalendarBlank className="h-6 w-6" weight="fill" />
          </div>
          <div>
            <label
              className={cn(
                'text-xs font-bold tracking-widest uppercase',
                'text-neutral-500 dark:text-neutral-400'
              )}
            >
              {t('wizard.labels.travelDates')}
            </label>
          </div>
        </div>

        <DateRangePicker
          departureDate={departureDate}
          returnDate={returnDate}
          onDepartureDateChange={handleDepartureDateChange}
          onReturnDateChange={handleReturnDateChange}
          minDate={today}
          isOneWay={data.tripType === 'one-way'}
          showPresets
          translations={{
            selectDate: t('wizard.placeholders.selectDate'),
            today: t('wizard.quickSelect.today'),
            previousMonth: t('wizard.navigation.previousMonth'),
            nextMonth: t('wizard.navigation.nextMonth'),
            weekdays: { short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] },
            months: [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ],
            departureDate: t('wizard.labels.departureDate'),
            returnDate: t('wizard.labels.returnDate'),
            selectDeparture: t('wizard.placeholders.selectDeparture'),
            selectReturn: t('wizard.placeholders.selectReturn'),
            duration: t('wizard.labels.duration'),
            nights: t('wizard.labels.nights'),
            presets: {
              weekend: t('wizard.presets.weekend'),
              oneWeek: t('wizard.presets.oneWeek'),
              twoWeeks: t('wizard.presets.twoWeeks'),
              threeWeeks: t('wizard.presets.threeWeeks'),
            },
          }}
        />
      </div>

      {/* Flexibility Options */}
      <div
        className={cn(
          'rounded-2xl border p-6',
          'border-neutral-200 bg-neutral-50',
          'dark:border-white/10 dark:bg-white/5'
        )}
      >
        <div className="mb-5 flex items-center gap-3">
          <Sparkle className="h-5 w-5 text-amber-500" weight="duotone" />
          <label className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
            {t('wizard.labels.dateFlexibility')}
          </label>
        </div>
        <WizardRadioGroup
          options={[
            { id: 0, label: t('wizard.flexibility.exact') },
            { id: 1, label: t('wizard.flexibility.plusMinus1') },
            { id: 2, label: t('wizard.flexibility.plusMinus2') },
            { id: 3, label: t('wizard.flexibility.plusMinus3') },
          ]}
          value={data.departureDateFlexRange}
          onChange={(val) => update({ departureDateFlexRange: val, returnDateFlexRange: val })}
          className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
        />
      </div>
    </div>
  );
};

interface StepOptionsProps {
  data: FlightSearchFormData;
  update: (val: Partial<FlightSearchFormData>) => void;
  t: ReturnType<typeof useTranslations>;
}

const StepOptions = ({ data, update, t }: StepOptionsProps) => (
  <div className="space-y-6">
    {/* Passengers & Cabin Class */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Passengers */}
      <div
        className={cn(
          'rounded-2xl border p-6',
          'border-neutral-200 bg-white',
          'dark:border-white/10 dark:bg-white/5'
        )}
      >
        <div className="mb-5 flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl',
              'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
              'shadow-xl shadow-emerald-500/30 dark:shadow-emerald-500/20'
            )}
          >
            <Users className="h-6 w-6" weight="fill" />
          </div>
          <label className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
            {t('wizard.labels.passengers')}
          </label>
        </div>

        <div className="flex items-center justify-center gap-8">
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              update({
                passengers: { ...data.passengers, adults: Math.max(1, data.passengers.adults - 1) },
              })
            }
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold transition-colors',
              'border-2 border-neutral-200 bg-white text-neutral-700',
              'hover:border-neutral-300 hover:bg-neutral-50',
              'dark:border-neutral-600 dark:bg-neutral-700 dark:text-white',
              'dark:hover:border-neutral-500 dark:hover:bg-neutral-600'
            )}
          >
            -
          </motion.button>

          <div className="flex flex-col items-center">
            <motion.span
              key={data.passengers.adults}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black text-neutral-900 dark:text-white"
            >
              {data.passengers.adults}
            </motion.span>
            <span className="mt-1 text-sm font-medium text-neutral-400">
              {data.passengers.adults === 1 ? 'Adult' : 'Adults'}
            </span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              update({ passengers: { ...data.passengers, adults: data.passengers.adults + 1 } })
            }
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold transition-colors',
              'border-2 border-neutral-200 bg-white text-neutral-700',
              'hover:border-neutral-300 hover:bg-neutral-50',
              'dark:border-neutral-600 dark:bg-neutral-700 dark:text-white',
              'dark:hover:border-neutral-500 dark:hover:bg-neutral-600'
            )}
          >
            +
          </motion.button>
        </div>
      </div>

      {/* Cabin Class */}
      <div
        className={cn(
          'rounded-2xl border p-6',
          'border-neutral-200 bg-white',
          'dark:border-white/10 dark:bg-white/5'
        )}
      >
        <div className="mb-5 flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl',
              'bg-gradient-to-br from-violet-500 to-purple-600 text-white',
              'shadow-xl shadow-violet-500/30 dark:shadow-violet-500/20'
            )}
          >
            <SuitcaseRolling className="h-6 w-6" weight="fill" />
          </div>
          <label className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
            {t('wizard.labels.cabinClass')}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'M', label: 'Economy', icon: '💺' },
            { id: 'W', label: 'Premium', icon: '✨' },
            { id: 'C', label: 'Business', icon: '💼' },
            { id: 'F', label: 'First', icon: '👑' },
          ].map((cabin) => (
            <motion.button
              key={cabin.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => update({ cabinClass: cabin.id as CabinClass })}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                data.cabinClass === cabin.id
                  ? [
                      'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
                      'shadow-lg shadow-blue-500/30',
                    ]
                  : [
                      'border border-neutral-200 bg-neutral-50 text-neutral-700',
                      'hover:border-neutral-300 hover:bg-neutral-100',
                      'dark:border-white/10 dark:bg-white/5 dark:text-neutral-200',
                      'dark:hover:bg-white/10',
                    ]
              )}
            >
              <span className="text-lg">{cabin.icon}</span>
              <span>{cabin.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>

    {/* Sort Preference */}
    <div
      className={cn(
        'rounded-2xl border p-6',
        'border-neutral-200 bg-neutral-50',
        'dark:border-white/10 dark:bg-white/5'
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <MagnifyingGlass className="h-5 w-5 text-blue-500" weight="duotone" />
        <label className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
          {t('wizard.labels.sortBy')}
        </label>
      </div>
      <WizardRadioGroup
        options={[
          { id: 'price', label: t('wizard.sort.price') },
          { id: 'duration', label: t('wizard.sort.duration') },
          { id: 'quality', label: t('wizard.sort.quality') },
        ]}
        value={data.sort}
        onChange={(val) => update({ sort: val as FlightSearchFormData['sort'] })}
        className="grid w-full grid-cols-3 gap-2"
      />
    </div>
  </div>
);

// ----------------------------------------------------------------------------
// Main Wizard Component
// ----------------------------------------------------------------------------

export interface FlightWizardProps {
  /** Server action to get popular airports (initial load) - REQUIRED */
  getPopularAirports: () => Promise<Airport[]>;
  /** Server action to search airports - REQUIRED */
  searchAirports: (query: string) => Promise<Airport[]>;
  /** Initial values to pre-fill the form (e.g., from a saved search) */
  initialValues?: Partial<FlightSearchFormData>;
  /** Skip to a specific step (0-3) */
  initialStep?: number;
}

export function FlightWizard({
  getPopularAirports,
  searchAirports,
  initialValues,
  initialStep = 0,
}: FlightWizardProps) {
  const t = useTranslations('flight');
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<FlightSearchFormData>(() => ({
    ...createInitialFlightSearchFormData(),
    ...initialValues,
  }));
  const [airports, setAirports] = useState<Airport[]>([]);
  const { isSearching, results, search, reset, error, progress, userMessage, events } =
    useSmartFlightSearch();

  // Load initial popular airports
  useEffect(() => {
    const loadAirports = async () => {
      try {
        const data = await getPopularAirports();
        setAirports(data);
      } catch (err) {
        console.error('Failed to load airports:', err);
      }
    };
    loadAirports();
  }, [getPopularAirports]);

  // Search airports using server action
  const handleSearchAirports = useCallback(
    async (query: string): Promise<Airport[]> => {
      return searchAirports(query);
    },
    [searchAirports]
  );

  const handleUpdate = (val: Partial<FlightSearchFormData>) => {
    setFormData((prev) => ({ ...prev, ...val }));
  };

  const steps = [
    {
      title: t('wizard.steps.tripType.title'),
      description: t('wizard.steps.tripType.description'),
      icon: AirplaneTilt,
    },
    {
      title: t('wizard.steps.route.title'),
      description: t('wizard.steps.route.description'),
      icon: AirplaneTakeoff,
    },
    {
      title: t('wizard.steps.dates.title'),
      description: t('wizard.steps.dates.description'),
      icon: CalendarBlank,
    },
    {
      title: t('wizard.steps.options.title'),
      description: t('wizard.steps.options.description'),
      icon: Users,
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await search(formData);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleReset = () => {
    reset();
    setCurrentStep(0);
  };

  const canNext = useMemo(() => {
    if (currentStep === 1) return formData.flyFrom.length > 0 && formData.flyTo.length > 0;
    if (currentStep === 2) {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(formData.departureDate)) return false;
      if (formData.tripType === 'round-trip' && !dateRegex.test(formData.returnDate || ''))
        return false;
    }
    return true;
  }, [currentStep, formData]);

  // View switch: results or wizard
  if (results || isSearching) {
    const flightResults = results
      ? results.tripType === 'one-way'
        ? { tripType: 'one-way' as const, flights: results.outbound }
        : {
            tripType: 'round-trip' as const,
            outbound: results.outbound,
            return: results.return ?? [],
          }
      : null;

    return (
      <div className="animate-in fade-in mx-auto w-full max-w-6xl px-4 duration-500">
        <FlightResults
          results={flightResults}
          isSearching={isSearching}
          onReset={handleReset}
          analysis={results?.analysis}
          recommendation={results?.recommendation}
          alternatives={results?.alternatives}
          progress={progress}
          userMessage={userMessage}
          events={events}
        />
        {error && (
          <div
            className={cn(
              'mt-4 rounded-xl border p-4 text-center text-sm font-bold',
              'border-red-200 bg-red-50 text-red-600',
              'dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
            )}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  const currentStepInfo = steps[currentStep];

  if (!currentStepInfo) {
    return null;
  }

  return (
    <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden bg-neutral-50 px-4 py-6 dark:bg-neutral-950">
      {/* Premium Background Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient orbs - enhanced for dark mode */}
        <div
          className={cn(
            'absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full blur-[120px]',
            'bg-blue-500/15 dark:bg-blue-500/10'
          )}
        />
        <div
          className={cn(
            'absolute top-[20%] -right-[15%] h-[40%] w-[40%] rounded-full blur-[100px]',
            'bg-indigo-500/15 dark:bg-indigo-500/10'
          )}
        />
        <div
          className={cn(
            'absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full blur-[100px]',
            'bg-purple-500/10 dark:bg-purple-500/8'
          )}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(currentColor 1px, transparent 1px),
              linear-gradient(90deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Premium Step Indicator */}
      <div className="mx-auto mb-8 flex items-center gap-3">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex items-center gap-3">
              <motion.button
                type="button"
                onClick={() => index <= currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                whileHover={index <= currentStep ? { scale: 1.05 } : undefined}
                whileTap={index <= currentStep ? { scale: 0.95 } : undefined}
                animate={{
                  scale: isActive ? 1 : 0.9,
                }}
                className={cn(
                  'relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  isActive && [
                    'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
                    'shadow-xl shadow-blue-500/40 dark:shadow-blue-500/30',
                  ],
                  isCompleted && [
                    'bg-blue-100 text-blue-600',
                    'dark:bg-blue-500/20 dark:text-blue-300',
                  ],
                  !isActive &&
                    !isCompleted && [
                      'bg-neutral-100 text-neutral-400',
                      'dark:bg-white/5 dark:text-neutral-500',
                    ],
                  index > currentStep && 'cursor-not-allowed opacity-50'
                )}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" strokeWidth={2.5} />
                ) : (
                  <StepIcon className="h-6 w-6" />
                )}
              </motion.button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-8 rounded-full transition-colors',
                    index < currentStep
                      ? 'bg-blue-400 dark:bg-blue-500/60'
                      : 'bg-neutral-200 dark:bg-neutral-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content Card */}
      <div className="mx-auto w-full max-w-3xl flex-1">
        <motion.div
          layout
          className={cn(
            'rounded-3xl border p-8 backdrop-blur-xl',
            'border-neutral-200/80 bg-white/90 shadow-2xl shadow-neutral-500/5',
            'dark:border-neutral-700/60 dark:bg-neutral-900/95 dark:shadow-black/20'
          )}
        >
          {/* Step Header */}
          <div className="mb-8 text-center">
            <motion.h2
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white"
            >
              {currentStepInfo.title}
            </motion.h2>
            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-neutral-500 dark:text-neutral-400"
            >
              {currentStepInfo.description}
            </motion.p>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {currentStep === 0 && <StepTripType data={formData} update={handleUpdate} t={t} />}
              {currentStep === 1 && (
                <StepRoute
                  data={formData}
                  update={handleUpdate}
                  initialAirports={airports}
                  searchAirports={handleSearchAirports}
                  t={t}
                />
              )}
              {currentStep === 2 && <StepDates data={formData} update={handleUpdate} t={t} />}
              {currentStep === 3 && <StepOptions data={formData} update={handleUpdate} t={t} />}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <motion.button
              type="button"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all',
                'text-neutral-600 hover:text-neutral-900',
                'dark:text-neutral-400 dark:hover:text-white',
                currentStep === 0 && 'invisible'
              )}
            >
              <CaretLeft className="h-4 w-4" weight="bold" />
              Back
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!canNext}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-bold transition-all',
                'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
                'shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40',
                'dark:shadow-blue-500/20 dark:hover:shadow-blue-500/30',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'
              )}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <MagnifyingGlass className="h-4 w-4" weight="bold" />
                  {t('wizard.actions.searchFlights')}
                </>
              ) : (
                <>
                  Continue
                  <CaretRight className="h-4 w-4" weight="bold" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
