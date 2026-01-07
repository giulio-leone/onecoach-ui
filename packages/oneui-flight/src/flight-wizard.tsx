'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Calendar, Users, ArrowRight, PlaneTakeoff, PlaneLanding, Brain } from 'lucide-react';
import {
  WizardStepper,
  WizardContainer,
  WizardActions,
  SelectionCard,
  WizardRadioGroup,
  Button,
  Combobox,
  DatePicker,
  Switch,
  type ComboboxOption,
} from '@onecoach/ui';
import { useTranslations } from 'next-intl';
import { cn } from '@onecoach/lib-design-system';

import type { FlightSearchFormData, CabinClass } from './form';
import { createInitialFlightSearchFormData } from './form';
import { useFlightSearch } from '@onecoach/hooks';
import { FlightResults, type FlightSearchResponse } from './flight-results';
import { SmartAnalysisPanel } from './smart-analysis-panel';
import { useSmartFlightSearch } from './use-smart-flight-search';
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
// Step Components
// ----------------------------------------------------------------------------

const StepTripType = ({
  data,
  update,
  t,
}: {
  data: FlightSearchFormData;
  update: (val: Partial<FlightSearchFormData>) => void;
  t: ReturnType<typeof useTranslations>;
}) => (
  <div className="space-y-8 py-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SelectionCard
        title={t('wizard.tripTypes.roundTrip.title')}
        description={t('wizard.tripTypes.roundTrip.description')}
        selected={data.tripType === 'round-trip'}
        onPress={() => update({ tripType: 'round-trip' })}
        icon={<Plane className="h-6 w-6" />}
      />
      <SelectionCard
        title={t('wizard.tripTypes.oneWay.title')}
        description={t('wizard.tripTypes.oneWay.description')}
        selected={data.tripType === 'one-way'}
        onPress={() => update({ tripType: 'one-way' })}
        icon={<ArrowRight className="h-6 w-6" />}
      />
    </div>
  </div>
);

const StepRoute = ({
  data,
  update,
  airports = [],
  t,
}: {
  data: FlightSearchFormData;
  update: (val: Partial<FlightSearchFormData>) => void;
  airports?: ComboboxOption[];
  t: ReturnType<typeof useTranslations>;
}) => (
  <div className="space-y-8 py-4">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-black tracking-widest text-neutral-500 uppercase">
          <PlaneTakeoff className="h-3 w-3" /> {t('wizard.labels.departureFrom')}
        </label>
        <Combobox
          options={airports}
          value={data.flyFrom}
          onChange={(value) => update({ flyFrom: value as string[] })}
          placeholder={t('wizard.placeholders.selectAirports')}
          searchPlaceholder={t('wizard.placeholders.searchDeparture')}
          className="h-14"
          multiple={true}
        />
        <p className="text-[10px] font-medium text-neutral-400">
          {t('wizard.hints.multipleAirports')}
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-black tracking-widest text-neutral-500 uppercase">
          <PlaneLanding className="h-3 w-3" /> {t('wizard.labels.destination')}
        </label>
        <Combobox
          options={airports}
          value={data.flyTo}
          onChange={(value) => update({ flyTo: value as string[] })}
          placeholder={t('wizard.placeholders.selectAirports')}
          searchPlaceholder={t('wizard.placeholders.searchDestination')}
          className="h-14"
          multiple={true}
        />
        <p className="text-[10px] font-medium text-neutral-400">
          {t('wizard.hints.multipleDestinations')}
        </p>
      </div>
    </div>
  </div>
);

const StepDates = ({
  data,
  update,
  t,
}: {
  data: FlightSearchFormData;
  update: (val: Partial<FlightSearchFormData>) => void;
  t: ReturnType<typeof useTranslations>;
}) => (
  <div className="space-y-8 py-4">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-black tracking-widest text-neutral-500 uppercase">
          <Calendar className="h-3 w-3" /> {t('wizard.labels.departureDate')}
        </label>
        <DatePicker
          placeholder="25/08/2025"
          value={parseDate(data.departureDate)}
          onChange={(date: Date | undefined) =>
            update({ departureDate: date ? formatDate(date) : '' })
          }
          minDate={new Date()}
          className="h-14 w-full rounded-2xl border-2 text-lg font-bold"
        />
      </div>

      {data.tripType === 'round-trip' && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-black tracking-widest text-neutral-500 uppercase">
            <Calendar className="h-3 w-3" /> {t('wizard.labels.returnDate')}
          </label>
          <DatePicker
            placeholder="01/09/2025"
            value={parseDate(data.returnDate || '')}
            onChange={(date: Date | undefined) =>
              update({ returnDate: date ? formatDate(date) : '' })
            }
            minDate={parseDate(data.departureDate) || new Date()}
            className="h-14 w-full rounded-2xl border-2 text-lg font-bold"
          />
        </div>
      )}
    </div>

    <div className="space-y-4">
      <label className="text-xs font-black tracking-widest text-neutral-500 uppercase">
        {t('wizard.labels.dateFlexibility')}
      </label>
      <WizardRadioGroup
        options={[
          { id: 0, label: t('wizard.flexibility.exact') },
          { id: 1, label: t('wizard.flexibility.plusMinus1') },
          { id: 2, label: t('wizard.flexibility.plusMinus2') },
          { id: 3, label: t('wizard.flexibility.plusMinus3') },
        ]}
        value={data.departureDateFlexRange}
        onChange={(val) => update({ departureDateFlexRange: val, returnDateFlexRange: val })}
        className="grid w-full grid-cols-2 sm:flex"
      />
    </div>
  </div>
);

const StepOptions = ({
  data,
  update,
  t,
  useSmartSearch,
  onSmartSearchChange,
}: {
  data: FlightSearchFormData;
  update: (val: Partial<FlightSearchFormData>) => void;
  t: ReturnType<typeof useTranslations>;
  useSmartSearch: boolean;
  onSmartSearchChange: (value: boolean) => void;
}) => (
  <div className="space-y-8 py-4">
    {/* Smart Search Toggle */}
    <div className={cn(
      'rounded-2xl border-2 p-4 transition-all',
      useSmartSearch 
        ? 'border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5' 
        : 'border-neutral-200 dark:border-neutral-700'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
            useSmartSearch 
              ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
          )}>
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900 dark:text-white">
              {t('smartSearch.aiAnalysis') || 'AI Smart Search'}
            </p>
            <p className="text-xs text-neutral-500">
              {useSmartSearch 
                ? (t('smartSearch.poweredByAgent') || 'AI analysis & recommendations enabled')
                : 'Standard search mode'
              }
            </p>
          </div>
        </div>
        <Switch 
          checked={useSmartSearch} 
          onCheckedChange={onSmartSearchChange}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-xs font-black tracking-widest text-neutral-500 uppercase">
          <Users className="h-3 w-3" /> {t('wizard.labels.passengers')}
        </label>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="h-12 w-12 rounded-xl"
            onClick={() =>
              update({
                passengers: { ...data.passengers, adults: Math.max(1, data.passengers.adults - 1) },
              })
            }
          >
            {' '}
            -{' '}
          </Button>
          <span className="w-8 text-center text-2xl font-black">{data.passengers.adults}</span>
          <Button
            variant="outline"
            className="h-12 w-12 rounded-xl"
            onClick={() =>
              update({ passengers: { ...data.passengers, adults: data.passengers.adults + 1 } })
            }
          >
            {' '}
            +{' '}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black tracking-widest text-neutral-500 uppercase">
          {t('wizard.labels.cabinClass')}
        </label>
        <WizardRadioGroup
          options={[
            { id: 'M', label: 'Economy' },
            { id: 'W', label: 'Premium' },
            { id: 'C', label: 'Business' },
            { id: 'F', label: 'First' },
          ]}
          value={data.cabinClass}
          onChange={(val) => update({ cabinClass: val as CabinClass })}
          className="grid w-full grid-cols-2 sm:flex"
        />
      </div>
    </div>

    <div className="space-y-4">
      <label className="text-xs font-black tracking-widest text-neutral-500 uppercase">
        {t('wizard.labels.sortBy')}
      </label>
      <WizardRadioGroup
        options={[
          { id: 'price', label: t('wizard.sort.price') },
          { id: 'duration', label: t('wizard.sort.duration') },
          { id: 'quality', label: t('wizard.sort.quality') },
        ]}
        value={data.sort}
        onChange={(val) => update({ sort: val as any })}
        className="grid w-full grid-cols-3 sm:flex"
      />
    </div>
  </div>
);

// ----------------------------------------------------------------------------
// Main Wizard Component
// ----------------------------------------------------------------------------

export interface FlightWizardProps {
  getAirports?: () => Promise<Airport[]>;
}

export function FlightWizard({ getAirports }: FlightWizardProps) {
  const t = useTranslations('flight');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FlightSearchFormData>(
    createInitialFlightSearchFormData()
  );
  const [airports, setAirports] = useState<ComboboxOption[]>([]);
  const [useSmartSearch, setUseSmartSearch] = useState(true); // Default to smart search
  
  // Standard search hook
  const standardSearch = useFlightSearch();
  
  // Smart search hook (AI-powered)
  const smartSearch = useSmartFlightSearch();
  
  // Use the appropriate search based on toggle
  const isSearching = useSmartSearch ? smartSearch.isSearching : standardSearch.isSearching;
  const error = useSmartSearch ? smartSearch.error : standardSearch.error;
  const standardResults = standardSearch.results;
  const smartResults = smartSearch.results;

  useEffect(() => {
    const loadAirports = async () => {
      if (!getAirports) return;
      
      const data = await getAirports();
      setAirports(
        data.map((a) => ({
          value: a.code,
          label: `${a.city} (${a.code}) - ${a.name}`,
        }))
      );
    };
    loadAirports();
  }, [getAirports]);

  const handleUpdate = (val: Partial<FlightSearchFormData>) => {
    setFormData((prev) => ({ ...prev, ...val }));
  };

  const steps = [
    {
      title: t('wizard.steps.tripType.title'),
      description: t('wizard.steps.tripType.description'),
    },
    { title: t('wizard.steps.route.title'), description: t('wizard.steps.route.description') },
    { title: t('wizard.steps.dates.title'), description: t('wizard.steps.dates.description') },
    { title: t('wizard.steps.options.title'), description: t('wizard.steps.options.description') },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Use appropriate search based on toggle
      if (useSmartSearch) {
        await smartSearch.search({
          flyFrom: formData.flyFrom,
          flyTo: formData.flyTo,
          departureDate: formData.departureDate,
          returnDate: formData.tripType === 'round-trip' ? formData.returnDate : undefined,
          preferences: {
            priority: formData.sort as 'price' | 'duration' | 'convenience',
            preferDirectFlights: true,
          },
        });
      } else {
        await standardSearch.search(formData);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleReset = () => {
    if (useSmartSearch) {
      smartSearch.reset();
    } else {
      standardSearch.reset();
    }
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
  const hasResults = useSmartSearch ? !!smartResults : !!standardResults;
  
  if (hasResults || isSearching) {
    // Map smart results to standard format for FlightResults component
    const displayResults = useSmartSearch && smartResults 
      ? {
          tripType: smartResults.tripType,
          outbound: smartResults.outbound,
          return: smartResults.return,
          flights: smartResults.tripType === 'one-way' ? smartResults.outbound : undefined,
        }
      : standardResults;
    
    return (
      <div className="animate-in fade-in mx-auto w-full max-w-6xl px-4 duration-500">
        {/* Smart Analysis Panel - shown only for smart search */}
        {useSmartSearch && smartResults && (
          <SmartAnalysisPanel
            analysis={smartResults.analysis}
            recommendation={smartResults.recommendation}
            alternatives={smartResults.alternatives}
            className="mb-6"
          />
        )}
        
        <FlightResults 
          results={displayResults as FlightSearchResponse} 
          isSearching={isSearching} 
          onReset={handleReset} 
        />
        
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-bold text-red-600">
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
    <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[60%] w-[60%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={(index) => setCurrentStep(index)}
        className="mb-4"
      />

      <WizardContainer
        header={
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
              {currentStepInfo.title}
            </h2>
            <p className="font-medium text-neutral-500 dark:text-neutral-400">
              {currentStepInfo.description}
            </p>
          </div>
        }
        footer={
          <WizardActions
            onBack={handleBack}
            onNext={handleNext}
            canBack={currentStep > 0}
            canNext={canNext}
            isLastStep={currentStep === steps.length - 1}
            generateLabel={t('wizard.actions.searchFlights')}
          />
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {currentStep === 0 && <StepTripType data={formData} update={handleUpdate} t={t} />}
            {currentStep === 1 && (
              <StepRoute data={formData} update={handleUpdate} airports={airports} t={t} />
            )}
            {currentStep === 2 && <StepDates data={formData} update={handleUpdate} t={t} />}
            {currentStep === 3 && (
              <StepOptions 
                data={formData} 
                update={handleUpdate} 
                t={t}
                useSmartSearch={useSmartSearch}
                onSmartSearchChange={setUseSmartSearch}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </WizardContainer>
    </div>
  );
}
