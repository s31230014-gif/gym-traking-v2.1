// ==================== CATEGORIES PAGE ====================

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  setupEventListeners();
});

function setupEventListeners() {
  const form = document.getElementById('addCategoryForm');
  const input = document.getElementById('categoryInput');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      addCategory();
    });
  }

  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addCategory();
    });
  }
}

function addCategory() {
  const input = document.getElementById('categoryInput');
  if (!input) return;

  const name = input.value.trim();
  if (!name) {
    showToast('Masukkan nama kategori', 'error');
    return;
  }

  const categories = storage.getCategories();
  if (categories.includes(name)) {
    showToast('Kategori sudah ada', 'error');
    return;
  }

  storage.addCategory(name);
  showToast('Kategori ditambahkan', 'success');
  input.value = '';
  renderCategories();
}

function renderCategories() {
  const container = document.getElementById('categoriesList');
  if (!container) return;

  const categories = storage.getCategories();
  const workouts = storage.getWorkouts();

  container.innerHTML = '';

  categories.forEach(category => {
    const count = workouts.filter(w => w.category === category).length;
    
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="card-title">${category}</h5>
              <p class="card-text text-muted">${count} latihan</p>
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (categories.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada kategori. Buat kategori baru untuk memulai!</p>';
  }
}

function deleteCategory(name) {
  if (!confirm(`Hapus kategori "${name}"? Latihan dalam kategori ini tidak akan dihapus.`)) {
    return;
  }

  storage.deleteCategory(name);
  showToast('Kategori dihapus', 'success');
  renderCategories();
}
