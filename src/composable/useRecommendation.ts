import type { School } from "@/types/school";
import { useRouting } from "./useRouting";

export interface RecommendationResult {
  lat: number;
  lng: number;
  totalDistance: number;
  totalDuration: number;
  averageDistance: number;
  averageDuration: number;
  schools: School[];
}

export const useRecommendation = () => {
  const { calculateRoute } = useRouting();

  /**
   * Calculate optimal location for dapur based on selected schools
   * Menggunakan centroid (rata-rata koordinat) sebagai starting point
   */
  const calculateOptimalLocation = async (
    schools: School[]
  ): Promise<RecommendationResult | null> => {
    if (schools.length === 0) return null;

    // Calculate centroid (geometric center)
    const centroid = calculateCentroid(schools);

    // Calculate routes from centroid to all schools
    let totalDistance = 0;
    let totalDuration = 0;
    let successCount = 0;

    for (const school of schools) {
      const route = await calculateRoute(
        [centroid.lat, centroid.lng],
        [school.lat, school.long]
      );

      if (route) {
        totalDistance += route.distance;
        totalDuration += route.duration;
        successCount++;
      }
    }

    if (successCount === 0) return null;

    return {
      lat: centroid.lat,
      lng: centroid.lng,
      totalDistance,
      totalDuration,
      averageDistance: totalDistance / successCount,
      averageDuration: totalDuration / successCount,
      schools,
    };
  };

  /**
   * Calculate centroid (geometric center) of schools
   */
  const calculateCentroid = (
    schools: School[]
  ): { lat: number; lng: number } => {
    const sumLat = schools.reduce((sum, school) => sum + school.lat, 0);
    const sumLng = schools.reduce((sum, school) => sum + school.long, 0);

    return {
      lat: sumLat / schools.length,
      lng: sumLng / schools.length,
    };
  };

  /**
   * Format recommendation summary
   */
  const formatRecommendationSummary = (
    result: RecommendationResult
  ): string => {
    const avgDistanceKm = (result.averageDistance / 1000).toFixed(2);
    const avgDurationMin = Math.round(result.averageDuration / 60);

    return (
      `Lokasi optimal untuk ${result.schools.length} sekolah:\n` +
      `Koordinat: ${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}\n` +
      `Rata-rata jarak: ${avgDistanceKm} km\n` +
      `Rata-rata waktu tempuh: ${avgDurationMin} menit`
    );
  };

  return {
    calculateOptimalLocation,
    calculateCentroid,
    formatRecommendationSummary,
  };
};
