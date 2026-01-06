/**
 * Flight Search Form State
 *
 * Definisce la struttura dei dati per il wizard OneFlight.
 * I nomi dei campi sono allineati allo schema Kiwi MCP API.
 */

export type CabinClass = 'M' | 'W' | 'C' | 'F';

export interface FlightSearchFormData {
  tripType: 'one-way' | 'round-trip';
  flyFrom: string[]; // Codici aeroporto o nomi città
  flyTo: string[]; // Codici aeroporto o nomi città
  departureDate: string; // Formato dd/mm/yyyy
  returnDate?: string; // Formato dd/mm/yyyy
  departureDateFlexRange: number; // 0-3 giorni di flessibilità
  returnDateFlexRange: number; // 0-3 giorni di flessibilità
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: CabinClass;
  sort: 'price' | 'duration' | 'quality' | 'date';
  curr: string;
  locale: string;
}

export function createInitialFlightSearchFormData(): FlightSearchFormData {
  return {
    tripType: 'round-trip',
    flyFrom: [],
    flyTo: [],
    departureDate: '',
    returnDate: '',
    departureDateFlexRange: 0,
    returnDateFlexRange: 0,
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    cabinClass: 'M',
    sort: 'price',
    curr: 'EUR',
    locale: 'it',
  };
}

export const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  M: 'Economy',
  W: 'Premium Economy',
  C: 'Business',
  F: 'First Class',
};
