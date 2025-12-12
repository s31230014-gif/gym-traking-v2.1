// ==================== ADD WORKOUT PAGE ====================

document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  setupEventListeners();
  setDefaultDate();
});

function loadCategories() {
  const categorySelect = document.getElementById('categorySelect');
  if (!categorySelect) return;

  const categories = storage.getCategories();
  categorySelect.innerHTML = '<option value="">-- Pilih Kategori --</option>';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function setDefaultDate() {
  const dateInput = document.getElementById('workoutDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

function setupEventListeners() {

  const form = document.getElementById('addWorkoutForm');
  const exerciseInput = document.getElementById('exerciseName');
  const categorySelect = document.getElementById('categorySelect');
  const weightInput = document.getElementById('weight');
  const repsInput = document.getElementById('reps');
  const volumeDisplay = document.getElementById('volumeDisplay');
  const lastWeightDisplay = document.getElementById('lastWeightDisplay');
  // Show last weight when exercise changes
  if (exerciseInput && categorySelect) {
    [exerciseInput, categorySelect].forEach(el => {
      el.addEventListener('change', showLastWeight);
      el.addEventListener('input', showLastWeight);
    });
  }

  // Auto-calculate volume
  if (weightInput && repsInput) {
    [weightInput, repsInput].forEach(el => {
      el.addEventListener('input', calculateAndDisplayVolume);
    });
  }

  // Save workout via form submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveWorkout();
    });

    form.addEventListener('reset', () => {
      setDefaultDate();
      if (volumeDisplay) volumeDisplay.textContent = '0 kg';
      if (lastWeightDisplay) lastWeightDisplay.textContent = '-';
    });
  }
}

function showLastWeight() {
  const exerciseInput = document.getElementById('exerciseName');
  const categorySelect = document.getElementById('categorySelect');
  const lastWeightDisplay = document.getElementById('lastWeightDisplay');

  if (!exerciseInput || !categorySelect || !lastWeightDisplay) return;

  const exercise = exerciseInput.value.trim();
  const category = categorySelect.value;

  if (exercise && category) {
    const lastWeight = getLastWeightForExercise(exercise, category);
    lastWeightDisplay.textContent = lastWeight ? lastWeight + ' kg' : 'Baru';
  } else {
    lastWeightDisplay.textContent = '-';
  }
}

function calculateAndDisplayVolume() {
  const weightInput = document.getElementById('weight');
  const repsInput = document.getElementById('reps');
  const volumeDisplay = document.getElementById('volumeDisplay');

  if (!weightInput || !repsInput || !volumeDisplay) return;

  const weight = parseFloat(weightInput.value) || 0;
  const reps = parseFloat(repsInput.value) || 0;
  const volume = calculateVolume(weight, reps);

  volumeDisplay.textContent = volume.toFixed(0) + ' kg';
}

function saveWorkout() {
  const form = document.getElementById('addWorkoutForm');
  if (!form) return;

  const category = document.getElementById('categorySelect').value;
  const exercise = document.getElementById('exerciseName').value.trim();
  const weight = parseFloat(document.getElementById('weight').value);
  const reps = parseFloat(document.getElementById('reps').value);
  const note = document.getElementById('workoutNote')?.value.trim() || '';
  const date = document.getElementById('workoutDate').value;

  if (!category || !exercise || !weight || !reps || !date) {
    showToast('Isi semua field terlebih dahulu', 'error');
    return;
  }

  const workout = {
    category,
    exercise,
    weight,
    reps,
    date,
    volume: weight * reps,
    note,
    timestamp: new Date().toISOString()
  };

  storage.addWorkout(workout);
  showToast('Latihan berhasil disimpan', 'success');
  
  form.reset();
  setDefaultDate();
  document.getElementById('volumeDisplay').textContent = '0 kg';
  document.getElementById('lastWeightDisplay').textContent = '-';
}
