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
  const workouts = storage.getWorkouts();
  const weights = storage.getWeights();
  
  const totalWorkoutsEl = document.getElementById('totalWorkouts');
  const totalVolumeEl = document.getElementById('totalVolume');
  const totalCategoriesEl = document.getElementById('totalCategories');
  const totalPhotosEl = document.getElementById('totalPhotos');
  const lastWorkoutEl = document.getElementById('lastWorkout');
  const currentWeightEl = document.getElementById('currentWeight');
  const weeklyVolumeEl = document.getElementById('weeklyVolume');

  if (totalWorkoutsEl) totalWorkoutsEl.textContent = stats.totalWorkouts;
  if (totalVolumeEl) totalVolumeEl.textContent = stats.totalVolume + ' kg';
  if (totalCategoriesEl) totalCategoriesEl.textContent = stats.totalCategories;
  if (totalPhotosEl) totalPhotosEl.textContent = stats.totalPhotos;
  
  // Last workout
  if (lastWorkoutEl) {
    if (workouts.length > 0) {
      const last = workouts[workouts.length - 1];
      const date = new Date(last.date).toLocaleDateString('id-ID');
      lastWorkoutEl.textContent = `${last.exercise} (${date})`;
    } else {
      lastWorkoutEl.textContent = 'Belum ada latihan';
    }
  }
  
  // Current weight
  if (currentWeightEl) {
    if (weights.length > 0) {
      const latest = weights.sort((a,b) => new Date(b.date) - new Date(a.date))[0];
      currentWeightEl.textContent = `${latest.weight} kg (${new Date(latest.date).toLocaleDateString('id-ID')})`;
    } else {
      currentWeightEl.textContent = 'Belum ada data';
    }
  }
  
  // Weekly volume
  if (weeklyVolumeEl) {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisWeekWorkouts = workouts.filter(w => new Date(w.date) >= startOfWeek);
    const weeklyVolume = thisWeekWorkouts.reduce((sum, w) => sum + (w.weight * w.reps), 0);
    weeklyVolumeEl.textContent = weeklyVolume.toFixed(0) + ' kg';
  }
}
