// ==================== GALLERY PAGE ====================

document.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  setupEventListeners();
});

function setupEventListeners() {
  const uploadBtn = document.getElementById('uploadPhotoBtn');
  const photoFile = document.getElementById('photoFile');

    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
      uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        uploadPhoto();
      });
  }

  if (photoFile) {
    photoFile.addEventListener('change', (e) => {
      const fileName = e.target.files[0]?.name || 'Pilih file';
      document.getElementById('fileName')?.setAttribute('data-file', fileName);
    });
  }
}

async function uploadPhoto() {
  const photoFile = document.getElementById('photoFile');
  const photoNote = document.getElementById('photoNote');

  if (!photoFile || !photoFile.files.length) {
    showToast('Pilih foto terlebih dahulu', 'error');
    return;
  }

  const file = photoFile.files[0];
  
  // Validate file type
  // Validate file type (some browsers may leave type blank for HEIC)
  const allowedExt = /\.(png|jpe?g|heic)$/i;
  const isImageType = file.type && file.type.startsWith('image/');
  const hasAllowedExt = allowedExt.test(file.name || '');

  if (!isImageType && !hasAllowedExt) {
    showToast('File harus berupa gambar (PNG/JPG/HEIC)', 'error');
    return;
  }

  try {
    const base64 = await resizeImage(file, 800, 800, 0.8);
    
    const photo = {
      data: base64,
      note: photoNote?.value || '',
      date: new Date().toISOString(),
      filename: file.name,
      mime: file.type || ''
    };

    storage.addPhoto(photo);
    showToast('Foto berhasil diunggah', 'success');
    
    photoFile.value = '';
    photoNote.value = '';
    renderGallery();
  } catch (error) {
    console.error('Error uploading photo:', error);
    showToast('Gagal mengunggah foto', 'error');
  }
}

function renderGallery() {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  const photos = storage.getPhotos().sort((a, b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = '';

  if (photos.length === 0) {
    container.innerHTML = '<p class="text-muted col-12">Belum ada foto. Unggah foto progres Anda!</p>';
    return;
  }

  photos.forEach(photo => {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6';
    col.innerHTML = `
      <div class="position-relative" style="cursor: pointer;">
        <img src="${photo.data}" 
             class="img-fluid rounded" 
             style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover;" 
             onclick="openPhotoModal('${photo.id}')">
        <div class="position-absolute bottom-0 start-0 end-0 p-2" style="background: rgba(0,0,0,0.5);">
          <small class="text-white">${formatDate(photo.date)}</small>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function openPhotoModal(id) {
  const photo = storage.getPhotos().find(p => p.id === id);
  if (!photo) return;

  const modalImage = document.getElementById('modalImage');
  const photoDate = document.getElementById('photoDate');
  const photoNoteDisplay = document.getElementById('photoNoteDisplay');
  const deletePhotoBtn = document.getElementById('deletePhotoBtn');

  if (modalImage) modalImage.src = photo.data;
  if (photoDate) photoDate.textContent = formatDateTime(photo.date);
  if (photoNoteDisplay) photoNoteDisplay.textContent = photo.note || 'Tidak ada catatan';
  if (deletePhotoBtn) deletePhotoBtn.onclick = () => deletePhoto(id);

  const modal = new bootstrap.Modal(document.getElementById('imageModal'));
  modal.show();
}

function deletePhoto(id) {
  if (!confirm('Hapus foto ini?')) return;

  storage.deletePhoto(id);
  showToast('Foto dihapus', 'success');

  const modal = bootstrap.Modal.getInstance(document.getElementById('imageModal'));
  if (modal) modal.hide();

  renderGallery();
}
