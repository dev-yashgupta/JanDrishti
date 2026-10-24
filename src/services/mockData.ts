/**
 * mockData.ts — minimal fallback data
 *
 * This file is retained only so the ReportProblemPage can show
 * category options while the real /api/categories request is in-flight.
 * It is NOT imported by any page component directly — categories are
 * loaded via useCategories() from the real API.
 *
 * This file may be removed once the app always runs with the backend.
 */

export const FALLBACK_CATEGORY_SLUGS = [
  'roads-infrastructure',
  'water-supply',
  'sanitation-waste',
  'healthcare',
  'education',
  'electricity',
  'public-safety',
  'environment',
  'drainage-flooding',
  'public-transport',
  'housing',
  'other',
] as const;

// Empty paginated helper kept for type compatibility
export function mockPaginated<T>(items: T[], page = 1, perPage = 10) {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    page,
    per_page: perPage,
    total_pages: Math.ceil(items.length / perPage),
  };
}
