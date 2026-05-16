/**
 * DMRC Fare Calculator
 * Based on official DMRC fare chart (distance-based slabs)
 * https://www.delhimetrorail.com/fares
 */

// Fare slabs based on number of stations travelled
// Source: DMRC official fare chart
const FARE_SLABS = [
  { maxStops: 2,  fare: 10 },
  { maxStops: 5,  fare: 20 },
  { maxStops: 12, fare: 30 },
  { maxStops: 21, fare: 40 },
  { maxStops: 32, fare: 50 },
  { maxStops: Infinity, fare: 60 },
];

// Airport Express Line has different fares
const AIRPORT_EXPRESS_FARE = 60; // New Delhi to Dwarka Sec 21

export function calculateFare(totalStops, usesAirportLine = false) {
  if (usesAirportLine) return AIRPORT_EXPRESS_FARE;

  for (const slab of FARE_SLABS) {
    if (totalStops <= slab.maxStops) return slab.fare;
  }
  return 60;
}

export function calculateRoundTripFare(totalStops, usesAirportLine = false) {
  return calculateFare(totalStops, usesAirportLine) * 2;
}

// Token vs Smart Card savings
export function getFareSummary(totalStops, usesAirportLine = false) {
  const tokenFare = calculateFare(totalStops, usesAirportLine);
  const smartCardFare = Math.round(tokenFare * 0.9); // 10% discount on smart card

  return {
    token: tokenFare,
    smartCard: smartCardFare,
    smartCardSaving: tokenFare - smartCardFare,
    roundTrip: tokenFare * 2,
    roundTripSmartCard: smartCardFare * 2,
  };
}
