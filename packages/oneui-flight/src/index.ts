/**
 * @onecoach/ui-flight
 *
 * Flight search and booking UI components for OneCoach.
 * Provides flight search wizard, results display, and booking cards.
 *
 * @packageDocumentation
 */

// =============================================================================
// Flight Search Components
// =============================================================================
export { FlightSearchCard } from './flight-search-card';
export { FlightWizard, type FlightWizardProps } from './flight-wizard';

// =============================================================================
// Flight Results & Cards
// =============================================================================
export { FlightResults, type FlightResultsProps } from './flight-results';
export { FlightCard, type Flight, type FlightDirection } from './flight-card';
export { RouteGroup, type RouteGroupProps } from './route-group';

// =============================================================================
// Form Utilities & Types
// =============================================================================
export {
  createInitialFlightSearchFormData,
  type FlightSearchFormData,
  type CabinClass,
} from './form';
export type { Airport } from './types';
