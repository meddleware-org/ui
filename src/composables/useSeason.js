export function useSeason() {
  if (typeof document === 'undefined') return;
  const month = new Date().getMonth();
  const season =
    month >= 2 && month <= 4 ? 'spring' :
    month >= 5 && month <= 7 ? 'summer' :
    month >= 8 && month <= 10 ? 'autumn' : 'winter';
  document.documentElement.dataset.season = season;
}
