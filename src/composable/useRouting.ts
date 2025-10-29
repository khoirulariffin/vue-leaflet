/* eslint-disable @typescript-eslint/no-explicit-any */
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

export interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  route: [number, number][]; // coordinates
}

export const useRouting = () => {
  /**
   * Calculate route using OSRM (Open Source Routing Machine)
   * Menggunakan Dijkstra's algorithm untuk mencari rute terpendek
   */
  const calculateRoute = async (
    from: [number, number],
    to: [number, number]
  ): Promise<RouteResult | null> => {
    return new Promise((resolve) => {
      let tempMap: L.Map | null = null;
      let tempDiv: HTMLDivElement | null = null;
      let router: L.Routing.Control | null = null;
      let resolved = false;

      const cleanup = () => {
        if (resolved) return; // Prevent double cleanup

        try {
          if (router && tempMap) {
            try {
              tempMap.removeControl(router);
            } catch {
              // Ignore if already removed
            }
          }
          if (tempMap) {
            try {
              tempMap.off(); // Remove all event listeners
              tempMap.remove();
            } catch {
              // Ignore if already removed
            }
          }
          if (tempDiv && tempDiv.parentNode) {
            tempDiv.parentNode.removeChild(tempDiv);
          }
        } catch {
          // Silent cleanup errors
        }
      };

      const resolveAndCleanup = (result: RouteResult | null) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve(result);
      };

      try {
        // Create temporary map element (not visible)
        tempDiv = document.createElement("div");
        tempDiv.id = `temp-map-${Date.now()}`; // Unique ID
        tempDiv.style.display = "none";
        tempDiv.style.width = "100px";
        tempDiv.style.height = "100px";
        document.body.appendChild(tempDiv);

        tempMap = L.map(tempDiv, {
          zoomControl: false,
          attributionControl: false,
        }).setView(from, 13);

        // Add a tile layer (required for routing to work properly)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
          tempMap
        );

        // Use OSRM routing service
        router = L.Routing.control({
          waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
          router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
            profile: "driving", // driving, walking, cycling
          }),
          show: false,
          addWaypoints: false,
          routeWhileDragging: false,
          fitSelectedRoutes: false,
          showAlternatives: false,
        } as any); // Type assertion untuk avoid TypeScript error

        router.on("routesfound", (e) => {
          const routes = e.routes;
          if (routes && routes.length > 0) {
            const route = routes[0];
            const coordinates = route.coordinates.map(
              (coord: L.LatLng) => [coord.lat, coord.lng] as [number, number]
            );

            const result: RouteResult = {
              distance: route.summary.totalDistance, // meters
              duration: route.summary.totalTime, // seconds
              route: coordinates,
            };

            resolveAndCleanup(result);
          } else {
            resolveAndCleanup(null);
          }
        });

        router.on("routingerror", (e) => {
          console.error("Routing error:", e);
          resolveAndCleanup(null);
        });

        // Add router to temp map to trigger calculation
        router.addTo(tempMap);

        // Timeout fallback
        setTimeout(() => {
          resolveAndCleanup(null);
        }, 30000); // 30 seconds timeout
      } catch (error) {
        console.error("Error calculating route:", error);
        resolveAndCleanup(null);
      }
    });
  };

  /**
   * Format distance untuk display
   */
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  /**
   * Format duration untuk display
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  };

  return {
    calculateRoute,
    formatDistance,
    formatDuration,
  };
};
