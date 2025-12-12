// ==================== UTILITY FUNCTIONS ====================

// Format date to DD/MM/YYYY
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Format date time
function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('id-ID');
}

// Calculate volume
function calculateVolume(weight, reps) {
  return weight * reps;
}

// Get last weight for same exercise
function getLastWeightForExercise(exercise, category) {
  const workouts = storage.getWorkouts();
  const same = workouts
    .filter(w => w.exercise.toLowerCase() === exercise.toLowerCase() && w.category === category)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return same.length > 0 ? same[0].weight : null;
}

// Resize image for storage
function resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Show toast notification
function showToast(message, type = 'info') {
  const toastHTML = `
    <div class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0 fade show" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  const container = document.body;
  const div = document.createElement('div');
  div.innerHTML = toastHTML;
  container.appendChild(div.firstElementChild);

  const toast = new bootstrap.Toast(div.firstElementChild);
  toast.show();

  setTimeout(() => {
    div.firstElementChild.remove();
  }, 3000);
}

// Get summary stats
function getSummaryStats() {
  const workouts = storage.getWorkouts();
  const categories = storage.getCategories();
  const photos = storage.getPhotos();

  const totalVolume = workouts.reduce((sum, w) => sum + (w.weight * w.reps), 0);
  const totalWorkouts = workouts.length;
  const totalCategories = categories.length;
  const totalPhotos = photos.length;

  return {
    totalWorkouts,
    totalVolume: totalVolume.toFixed(0),
    totalCategories,
    totalPhotos
  };
}

// Get workouts by category
function getWorkoutsByCategory(category) {
  const workouts = storage.getWorkouts();
  return category ? workouts.filter(w => w.category === category) : workouts;
}

// Group workouts by exercise
function groupWorkoutsByExercise(workouts) {
  const grouped = {};
  workouts.forEach(w => {
    if (!grouped[w.exercise]) {
      grouped[w.exercise] = [];
    }
    grouped[w.exercise].push(w);
  });
  return grouped;
}

// Get unique exercises
function getUniqueExercises() {
  const workouts = storage.getWorkouts();
  return [...new Set(workouts.map(w => w.exercise))];
}

// Calculate personal records
function getPersonalRecords(exercise) {
  const workouts = storage.getWorkouts();
  const exerciseWorkouts = workouts.filter(w => w.exercise.toLowerCase() === exercise.toLowerCase());

  if (exerciseWorkouts.length === 0) return null;

  const maxWeight = Math.max(...exerciseWorkouts.map(w => w.weight));
  const maxReps = Math.max(...exerciseWorkouts.map(w => w.reps));
  const maxVolume = Math.max(...exerciseWorkouts.map(w => w.weight * w.reps));

  return { maxWeight, maxReps, maxVolume };
}

// Download JSON data
function downloadJSON(filename, data) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Import JSON file
async function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Simple HTML escaper to prevent injection in rendered fields
function escapeHtml(unsafe) {
  return unsafe
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
}

// Slugify text to be used as safe id attributes
function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
