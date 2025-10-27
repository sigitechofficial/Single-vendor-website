import { useQuery } from "@tanstack/react-query";
import { locationAPI } from "../utilities/api";
import { googleApiKey } from "../utilities/URL";

// Hook for fetching countries and cities
export const useCountriesAndCities = () => {
  return useQuery({
    queryKey: ["countries-cities"],
    queryFn: () => locationAPI.getCountriesAndCities(),
    staleTime: 60 * 60 * 1000, // 1 hour for static location data
    gcTime: 2 * 60 * 60 * 1000, // 2 hours cache
  });
};

// Hook for geocoding coordinates to address
export const useGeocodeAddress = (lat, lng) => {
  return useQuery({
    queryKey: ["geocode", lat, lng],
    queryFn: () =>
      locationAPI.getAddressFromCoordinates(lat, lng, googleApiKey),
    enabled: !!lat && !!lng,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours for geocoded addresses
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days cache
  });
};

