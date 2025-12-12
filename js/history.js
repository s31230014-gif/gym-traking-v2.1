// ==================== HISTORY PAGE (clean implementation) ====================

let filteredWorkouts = [];

document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  renderHistory();
  setupEventListeners();
});

function loadCategories() {
  const categoryFilter = document.getElementById('filterCategory');
  if (!categoryFilter) return;

  const categories = storage.getCategories();
  categoryFilter.innerHTML = '<option value="">-- Semua Kategori --</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

function setupEventListeners() {
  const categoryFilter = document.getElementById('filterCategory');
  const dateFilter = document.getElementById('filterDate');
  const saveEditBtn = document.getElementById('saveEditBtn');

  if (categoryFilter) categoryFilter.addEventListener('change', renderHistory);
  if (dateFilter) dateFilter.addEventListener('change', renderHistory);
  if (saveEditBtn) saveEditBtn.addEventListener('click', saveEditWorkout);
}

function renderHistory() {
  const container = document.getElementById('historyList');
  const statusEl = document.getElementById('historyStatus');
  if (!container) return;

  const all = storage.getWorkouts().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (statusEl) statusEl.innerHTML = `<div class="alert alert-light">Total data latihan: <strong>${all.length}</strong></div>`;

  // Apply filters
  const selectedDate = document.getElementById('filterDate')?.value;
  const selectedCategory = document.getElementById('filterCategory')?.value;

  let filtered = all;
  if (selectedDate) filtered = filtered.filter(w => w.date === selectedDate);
  if (selectedCategory) filtered = filtered.filter(w => w.category === selectedCategory);

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-muted">Tidak ada riwayat latihan. <a href="add-workout.html">Tambah latihan</a> untuk mulai menyimpan riwayat.</p>';
    return;
  }

  // Group by category
  const grouped = {};
  filtered.forEach(w => {
    const cat = w.category || 'Tanpa Kategori';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(w);
  });

  // Render each category as a card with a responsive table
  Object.keys(grouped).sort().forEach(category => {
    const slug = slugify(category) || 'no-category';
    const items = grouped[category].sort((a, b) => new Date(b.date) - new Date(a.date));

    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-0">${escapeHtml(category)}</h6>
          <small class="text-muted">${items.length} entri</small>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th>Exercise</th>
                <th class="text-end">Beban (kg)</th>
                <th class="text-end">Reps</th>
                <th class="text-end">Volume</th>
                <th>Tanggal</th>
                <th class="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody id="cat-${slug}"></tbody>
          </table>
        </div>
      </div>
    `;

    container.appendChild(card);

    const tbody = card.querySelector(`#cat-${slug}`);
    items.forEach(w => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(w.exercise)}</strong></td>
        <td class="text-end">${w.weight}</td>
        <td class="text-end">${w.reps}</td>
        <td class="text-end">${w.volume}</td>
        <td>${formatDate(w.date)}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-sm btn-outline-primary" onclick="openEditModal('${w.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteWorkout('${w.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);

      if (w.note) {
        const trNote = document.createElement('tr');
        trNote.innerHTML = `<td colspan="6" class="text-muted small">Catatan: ${escapeHtml(w.note)}</td>`;
        tbody.appendChild(trNote);
      }
    });
  });
}

function openEditModal(id) {
  const workout = storage.getWorkouts().find(w => w.id === id);
  if (!workout) return;

  document.getElementById('editId').value = id;
  document.getElementById('editExercise').value = workout.exercise;
  document.getElementById('editWeight').value = workout.weight;
  document.getElementById('editReps').value = workout.reps;

  // Populate category select in modal
  const editCategory = document.getElementById('editCategory');
  if (editCategory) {
    editCategory.innerHTML = '';
    storage.getCategories().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === workout.category) opt.selected = true;
      editCategory.appendChild(opt);
    });
  }

  // Set date and note
  const editDate = document.getElementById('editDate');
  if (editDate) editDate.value = workout.date ? new Date(workout.date).toISOString().split('T')[0] : '';
  const editNote = document.getElementById('editNote');
  if (editNote) editNote.value = workout.note || '';

  // Show modal
  const modalEl = document.getElementById('editModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function saveEditWorkout() {
  const id = document.getElementById('editId').value;
  const exercise = document.getElementById('editExercise').value.trim();
  const weight = parseFloat(document.getElementById('editWeight').value);
  const reps = parseFloat(document.getElementById('editReps').value);
  const category = document.getElementById('editCategory')?.value || '';
  const date = document.getElementById('editDate')?.value || new Date().toISOString().split('T')[0];
  const note = document.getElementById('editNote')?.value.trim() || '';

  if (!exercise || !weight || !reps) {
    showToast('Isi semua field', 'error');
    return;
  }

  storage.updateWorkout(id, {
    exercise,
    weight,
    reps,
    category,
    date,
    note,
    volume: weight * reps
  });

  showToast('Latihan diperbarui', 'success');
  const modalEl = document.getElementById('editModal');
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (modalInstance) modalInstance.hide();
  renderHistory();
}

function deleteWorkout(id) {
  if (!confirm('Hapus latihan ini?')) return;
  storage.deleteWorkout(id);
  showToast('Latihan dihapus', 'success');
  renderHistory();
}
