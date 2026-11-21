// The season palette: `data-season` on <html> picks one of the four optional palettes in design-tokens' seasons.css. `theme-init.js` does the
// same before first paint, and a test keeps the two in step (the month boundaries below are the contract).
/**
 * Map the calendar month to a season name and set `data-season` on <html>. Call once at app init.
 * The seasons follow the northern-hemisphere meteorological calendar: spring March to May, summer June to August, autumn September to
 * November, winter December to February.
 */
export function useSeason(): void {
  // No document (a server render): nothing to set.
  if (typeof document === 'undefined') return;
  // getMonth() is zero-based, so 2 is March and 4 is May.
  const month = new Date().getMonth();
  const season =
    month >= 2 && month <= 4 ? 'spring' :
    month >= 5 && month <= 7 ? 'summer' :
    month >= 8 && month <= 10 ? 'autumn' : 'winter';
  document.documentElement.dataset.season = season;
}
