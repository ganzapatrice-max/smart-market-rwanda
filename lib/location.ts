export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function estimateTime(distanceKm: number) {
  const speed = 30; // km/h city average
  const hours = distanceKm / speed;

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  return `${h > 0 ? h + "h " : ""}${m}min`;
}