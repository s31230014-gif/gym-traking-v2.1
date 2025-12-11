// ==================== HOME PAGE ====================

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  
  // Update stats every time page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateStats();
    }
  });
});

function updateStats() {
  const stats = getSummaryStats();
  
  const totalWorkoutsEl = document.getElementById('totalWorkouts');
  const totalVolumeEl = document.getElementById('totalVolume');
  const totalCategoriesEl = document.getElementById('totalCategories');
  const totalPhotosEl = document.getElementById('totalPhotos');

  if (totalWorkoutsEl) totalWorkoutsEl.textContent = stats.totalWorkouts;
  if (totalVolumeEl) totalVolumeEl.textContent = stats.totalVolume + ' kg';
  if (totalCategoriesEl) totalCategoriesEl.textContent = stats.totalCategories;
  if (totalPhotosEl) totalPhotosEl.textContent = stats.totalPhotos;
}
