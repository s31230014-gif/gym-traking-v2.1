// ==================== CHARTS PAGE ====================

let volumeChart = null;
let maxWeightChart = null;
let maxRepsChart = null;
let comparisonChart = null;

document.addEventListener('DOMContentLoaded', () => {
  loadExercises();
  setupEventListeners();
  
  // Default: show first exercise if available
  const exercises = getUniqueExercises();
  if (exercises.length > 0) {
    document.getElementById('exerciseSelect').value = exercises[0];
    renderCharts();
  }
});

function setupEventListeners() {
  const exerciseSelect = document.getElementById('exerciseSelect');
  if (exerciseSelect) {
    exerciseSelect.addEventListener('change', renderCharts);
    // allow multi-select for comparison
    exerciseSelect.setAttribute('multiple', '');
  }
}

function loadExercises() {
  const exerciseSelect = document.getElementById('exerciseSelect');
  if (!exerciseSelect) return;

  const exercises = getUniqueExercises();
  exerciseSelect.innerHTML = '';

  if (exercises.length === 0) {
    exerciseSelect.innerHTML = '<option disabled>Belum ada data latihan</option>';
    return;
  }

  exercises.forEach(exercise => {
    const option = document.createElement('option');
    option.value = exercise;
    option.textContent = exercise;
    exerciseSelect.appendChild(option);
  });
}

function renderCharts() {
  const selectedOptions = Array.from(document.getElementById('exerciseSelect').selectedOptions).map(o => o.value).filter(Boolean);
  if (selectedOptions.length === 0) return;

  // If multiple exercises selected -> comparison chart
  if (selectedOptions.length > 1) {
    renderComparisonChart(selectedOptions);
    return;
  }

  const selectedExercise = selectedOptions[0];
  const workouts = storage.getWorkouts()
    .filter(w => w.exercise.toLowerCase() === selectedExercise.toLowerCase())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (workouts.length === 0) {
    showToast('Tidak ada data untuk latihan ini', 'error');
    return;
  }

  // Group by exercise and date for chart
  const chartData = {};
  workouts.forEach(w => {
    const dateKey = formatDate(w.date);
    if (!chartData[dateKey]) {
      chartData[dateKey] = {
        date: dateKey,
        workouts: []
      };
    }
    chartData[dateKey].workouts.push(w);
  });

  const labels = Object.keys(chartData);
  const volumes = labels.map(date => {
    const total = chartData[date].workouts.reduce((sum, w) => sum + w.volume, 0);
    return total;
  });
  const maxWeights = labels.map(date => Math.max(...chartData[date].workouts.map(w => w.weight)));
  const maxReps = labels.map(date => Math.max(...chartData[date].workouts.map(w => w.reps)));

  // Render volume chart
  renderVolumeChart(labels, volumes);

  // Render max weight chart
  renderMaxWeightChart(labels, maxWeights);

  // Render max reps chart
  renderMaxRepsChart(labels, maxReps);

  // Update stats
  updateChartStats(workouts);
}

function renderComparisonChart(exercises) {
  // Build datasets per exercise over common date axis
  const allWorkouts = storage.getWorkouts().sort((a,b) => new Date(a.date) - new Date(b.date));
  const dateSet = new Set();
  exercises.forEach(ex => {
    allWorkouts.filter(w => w.exercise.toLowerCase() === ex.toLowerCase()).forEach(w => dateSet.add(formatDate(w.date)));
  });
  const labels = Array.from(dateSet).sort((a,b) => new Date(a) - new Date(b));

  const datasets = exercises.map((ex, idx) => {
    const color = ['#8C6F4E','#D9C7A5','#3E2F1C','#E8D9C4','#7A5D42'][idx % 5];
    const data = labels.map(date => {
      const sum = allWorkouts.filter(w => w.exercise.toLowerCase() === ex.toLowerCase() && formatDate(w.date) === date)
        .reduce((s,w) => s + w.weight, 0);
      return sum || null;
    });
    return {
      label: ex,
      data,
      borderColor: color,
      backgroundColor: color + '33',
      tension: 0.3,
      fill: false,
      pointRadius: 4
    };
  });

  const ctx = document.getElementById('volumeChart');
  if (!ctx) return;
  if (volumeChart) volumeChart.destroy();
  if (comparisonChart) comparisonChart.destroy();

  comparisonChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: true } }
    }
  });
}

function renderVolumeChart(labels, data) {
  const ctx = document.getElementById('volumeChart');
  if (!ctx) return;

  if (volumeChart) volumeChart.destroy();

  volumeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Volume (kg)',
        data: data,
        borderColor: '#6C757D',
        backgroundColor: 'rgba(108, 117, 125, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#6C757D',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }
        },
        x: {
          ticks: { font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }
        }
      }
    }
  });
}

function renderMaxWeightChart(labels, data) {
  const ctx = document.getElementById('maxWeightChart');
  if (!ctx) return;

  if (maxWeightChart) maxWeightChart.destroy();

  maxWeightChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Beban Maksimal (kg)',
        data: data,
        backgroundColor: '#E9ECEF',
        borderColor: '#6C757D',
        borderWidth: 2,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }
        },
        x: {
          ticks: { font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }
        }
      }
    }
  });
}

function renderMaxRepsChart(labels, data) {
  const ctx = document.getElementById('maxRepsChart');
  if (!ctx) return;

  if (maxRepsChart) maxRepsChart.destroy();

  maxRepsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Reps Maksimal',
        data: data,
        backgroundColor: '#F8F9FA',
        borderColor: '#6C757D',
        borderWidth: 2,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }
        },
        x: {
          ticks: { font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }
        }
      }
    }
  });
}

function updateChartStats(workouts) {
  const totalSets = workouts.length;
  const totalVolume = workouts.reduce((sum, w) => sum + w.volume, 0);
  const maxWeight = Math.max(...workouts.map(w => w.weight));
  const maxReps = Math.max(...workouts.map(w => w.reps));

  const totalSetsEl = document.getElementById('totalSets');
  const totalVolumeStatsEl = document.getElementById('totalVolumeStats');
  const maxWeightEl = document.getElementById('maxWeight');
  const maxRepsEl = document.getElementById('maxReps');

  if (totalSetsEl) totalSetsEl.textContent = totalSets;
  if (totalVolumeStatsEl) totalVolumeStatsEl.textContent = totalVolume.toFixed(0) + ' kg';
  if (maxWeightEl) maxWeightEl.textContent = maxWeight + ' kg';
  if (maxRepsEl) maxRepsEl.textContent = maxReps;
}
