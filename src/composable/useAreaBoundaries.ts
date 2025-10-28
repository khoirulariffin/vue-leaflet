import type { School } from "@/types/school";
import { featureCollection, point, convex } from "@turf/turf";

export interface AreaBoundary {
  id: string;
  name: string;
  type: "province" | "city" | "district";
  coordinates: [number, number][];
  color: string;
  schools: School[];
}

export const useAreaBoundaries = () => {
  const generateConvexHull = (schools: School[]): [number, number][] | null => {
    if (schools.length < 3) return null;

    try {
      const points = schools
        .filter((s) => s.lat && s.long)
        .map((s) => point([s.long, s.lat]));

      if (points.length < 3) return null;

      const collection = featureCollection(points);
      const hull = convex(collection);

      if (!hull) {
        console.warn("Convex hull failed, using bounding box");
        // Fallback to bounding box
        const lats = schools.map((s) => s.lat);
        const lngs = schools.map((s) => s.long);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        return [
          [minLat, minLng],
          [maxLat, minLng],
          [maxLat, maxLng],
          [minLat, maxLng],
        ];
      }

      const coordinates = hull.geometry.coordinates[0] as [number, number][];
      // Convert from [lng, lat] to [lat, lng] for Leaflet
      return coordinates.map(([lng, lat]) => [lat, lng]);
    } catch (error) {
      console.error("Error generating convex hull:", error);
      // Fallback to bounding box on error
      const lats = schools.map((s) => s.lat);
      const lngs = schools.map((s) => s.long);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      return [
        [minLat, minLng],
        [maxLat, minLng],
        [maxLat, maxLng],
        [minLat, maxLng],
      ];
    }
  };

  const generateProvinceBoundaries = (schools: School[]): AreaBoundary[] => {
    const provinceMap = new Map<number, School[]>();

    schools.forEach((school) => {
      if (!provinceMap.has(school.province_id)) {
        provinceMap.set(school.province_id, []);
      }
      provinceMap.get(school.province_id)!.push(school);
    });

    console.log("Province map size:", provinceMap.size);

    const boundaries: AreaBoundary[] = [];
    const colors = [
      "#ef4444",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
    ];
    let colorIndex = 0;

    provinceMap.forEach((provinceSchools, provinceId) => {
      const coordinates = generateConvexHull(provinceSchools);
      console.log(
        `Province ${provinceId}: ${provinceSchools.length} schools, hull:`,
        coordinates ? "generated" : "null"
      );
      if (coordinates && provinceSchools.length > 0) {
        const firstSchool = provinceSchools[0];
        if (firstSchool) {
          boundaries.push({
            id: `province-${provinceId}`,
            name: firstSchool.province_name,
            type: "province",
            coordinates,
            color: colors[colorIndex % colors.length] ?? "#6b7280",
            schools: provinceSchools,
          });
          colorIndex++;
        }
      }
    });

    console.log("Total province boundaries:", boundaries.length);
    return boundaries;
  };

  const generateCityBoundaries = (schools: School[]): AreaBoundary[] => {
    const cityMap = new Map<number, School[]>();

    schools.forEach((school) => {
      if (!cityMap.has(school.city_id)) {
        cityMap.set(school.city_id, []);
      }
      cityMap.get(school.city_id)!.push(school);
    });

    const boundaries: AreaBoundary[] = [];
    const colors = [
      "#fbbf24",
      "#34d399",
      "#60a5fa",
      "#a78bfa",
      "#f472b6",
      "#fb923c",
    ];
    let colorIndex = 0;

    cityMap.forEach((citySchools, cityId) => {
      const coordinates = generateConvexHull(citySchools);
      if (coordinates && citySchools.length > 0) {
        const firstSchool = citySchools[0];
        if (firstSchool) {
          boundaries.push({
            id: `city-${cityId}`,
            name: firstSchool.city_name,
            type: "city",
            coordinates,
            color: colors[colorIndex % colors.length] ?? "#6b7280",
            schools: citySchools,
          });
          colorIndex++;
        }
      }
    });

    return boundaries;
  };

  const generateDistrictBoundaries = (schools: School[]): AreaBoundary[] => {
    const districtMap = new Map<number, School[]>();

    schools.forEach((school) => {
      if (!districtMap.has(school.district_id)) {
        districtMap.set(school.district_id, []);
      }
      districtMap.get(school.district_id)!.push(school);
    });

    const boundaries: AreaBoundary[] = [];
    const colors = [
      "#fcd34d",
      "#6ee7b7",
      "#93c5fd",
      "#c4b5fd",
      "#f9a8d4",
      "#fdba74",
    ];
    let colorIndex = 0;

    districtMap.forEach((districtSchools, districtId) => {
      const coordinates = generateConvexHull(districtSchools);
      if (coordinates && districtSchools.length > 0) {
        const firstSchool = districtSchools[0];
        if (firstSchool) {
          boundaries.push({
            id: `district-${districtId}`,
            name: firstSchool.district,
            type: "district",
            coordinates,
            color: colors[colorIndex % colors.length] ?? "#6b7280",
            schools: districtSchools,
          });
          colorIndex++;
        }
      }
    });

    return boundaries;
  };

  return {
    generateProvinceBoundaries,
    generateCityBoundaries,
    generateDistrictBoundaries,
  };
};
