// ==================== WEIGHT (BODY WEIGHT) PAGE ====================
let weightChart = null;

document.addEventListener('DOMContentLoaded', () => {
  setupWeightListeners();
  renderWeightList();
  renderWeightChart();
});

function setupWeightListeners() {
  const form = document.getElementById('weightForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveWeight();
    });
  }
}

function saveWeight() {
  const date = document.getElementById('weightDate').value;
  const value = parseFloat(document.getElementById('weightValue').value);
  if (!date || !value) {
    showToast('Isi tanggal dan berat', 'error');
    return;
  }

  storage.addWeight({ date, weight: value });
  showToast('Berat disimpan', 'success');
  document.getElementById('weightDate').value = '';
  document.getElementById('weightValue').value = '';
  renderWeightList();
  renderWeightChart();
}

function renderWeightList() {
  const container = document.getElementById('weightList');
  if (!container) return;
  const items = storage.getWeights().sort((a,b) => new Date(b.date) - new Date(a.date));
  if (items.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada data berat badan.</p>';
    return;
  }

  container.innerHTML = '<div class="list-group">' + items.map(it => `
    <div class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <div class="fw-bold">${formatDate(it.date)}</div>
        <div class="small text-muted">${it.weight} kg</div>
      </div>
      <div>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editWeight('${it.id}')">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteWeight('${it.id}')">Hapus</button>
      </div>
    </div>
  `).join('') + '</div>';
}

function editWeight(id) {
  const item = storage.getWeights().find(w => w.id === id);
  if (!item) return;
  document.getElementById('weightDate').value = new Date(item.date).toISOString().split('T')[0];
  document.getElementById('weightValue').value = item.weight;
  // replace save behavior: update instead of add
  const saveBtn = document.getElementById('saveWeightBtn');
  saveBtn.textContent = 'Update';
  saveBtn.onclick = (e) => {
    e.preventDefault();
    storage.updateWeight(id, { date: document.getElementById('weightDate').value, weight: parseFloat(document.getElementById('weightValue').value) });
    saveBtn.textContent = 'Simpan';
    saveBtn.onclick = null;
    document.getElementById('weightDate').value = '';
    document.getElementById('weightValue').value = '';
    renderWeightList();
    renderWeightChart();
    showToast('Berat diperbarui', 'success');
  };
}

function deleteWeight(id) {
  if (!confirm('Hapus data berat ini?')) return;
  storage.deleteWeight(id);
  renderWeightList();
  renderWeightChart();
  showToast('Data berat dihapus', 'success');
}

function renderWeightChart() {
  const items = storage.getWeights().sort((a,b) => new Date(a.date) - new Date(b.date));
  const labels = items.map(i => formatDate(i.date));
  const data = items.map(i => i.weight);

  const ctx = document.getElementById('weightChart');
  if (!ctx) return;
  if (weightChart) weightChart.destroy();

  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Berat Badan (kg)',
        data,
        borderColor: '#3E2F1C',
        backgroundColor: 'rgba(62,47,28,0.05)',
        tension: 0.3,
        fill: true,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}
