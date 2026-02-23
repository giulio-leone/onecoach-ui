/**
 * @giulio-leone/ui/flight
 *
 * Flight search and booking UI components for OneCoach.
 * Provides flight search wizard, results display, and booking cards.
 *
 * @packageDocumentation
 */

// =============================================================================
// Flight Search Components
// =============================================================================
export { FlightSearchCard, type FlightSearchCardProps } from './flight-search-card';
export { FlightWizard, type FlightWizardProps } from './flight-wizard';
export {
  AirportCombobox,
  type AirportComboboxProps,
  type AirportComboboxTranslations,
} from './airport-combobox';

// =============================================================================
// Flight Results & Cards
// =============================================================================
export { FlightResults, type FlightResultsProps } from './flight-results';
export { FlightCard, type Flight, type FlightDirection } from './flight-card';
export { RouteGroup, type RouteGroupProps } from './route-group';
export {
  SmartAnalysisPanel,
  type SmartAnalysisPanelProps,
  type FlightAnalysis,
  type FlightRecommendation,
} from './smart-analysis-panel';

// =============================================================================
// Form Utilities & Types
// =============================================================================
export {
  createInitialFlightSearchFormData,
  type FlightSearchFormData,
  type CabinClass,
} from './form';

// =============================================================================
// Types
// =============================================================================
export type { Airport } from './types';

// =============================================================================
// Saved Trips
// =============================================================================
export { SavedTripsDashboard } from './saved-trips-dashboard';

// =============================================================================
// Generation Progress
// =============================================================================
export { FlightGeneratingCard, type FlightGeneratingCardProps } from './flight-generating-card';
