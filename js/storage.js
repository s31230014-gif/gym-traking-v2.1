// ==================== LOCALSTORAGE HANDLER ====================
class GymStorage {
  constructor() {
    this.WORKOUTS_KEY = 'gym_workouts';
    this.CATEGORIES_KEY = 'gym_categories';
    this.PHOTOS_KEY = 'gym_photos';
    this.WEIGHTS_KEY = 'gym_weights';
  }

  // ========== WORKOUTS ==========
  getWorkouts() {
    try {
      const data = localStorage.getItem(this.WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading workouts:', e);
      return [];
    }
  }

  addWorkout(workout) {
    const workouts = this.getWorkouts();
    workout.id = Date.now().toString();
    workouts.push(workout);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
    return workout;
  }

  updateWorkout(id, updates) {
    let workouts = this.getWorkouts();
    workouts = workouts.map(w => w.id === id ? { ...w, ...updates } : w);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  deleteWorkout(id) {
    let workouts = this.getWorkouts();
    workouts = workouts.filter(w => w.id !== id);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  // ========== CATEGORIES ==========
  getCategories() {
    try {
      const data = localStorage.getItem(this.CATEGORIES_KEY);
      return data ? JSON.parse(data) : ['Upper Body', 'Lower Body', 'Cardio'];
    } catch (e) {
      return ['Upper Body', 'Lower Body', 'Cardio'];
    }
  }

  addCategory(name) {
    const categories = this.getCategories();
    if (!categories.includes(name)) {
      categories.push(name);
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    }
  }

  deleteCategory(name) {
    let categories = this.getCategories();
    categories = categories.filter(c => c !== name);
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

  // ========== PHOTOS ==========
  getPhotos() {
    try {
      const data = localStorage.getItem(this.PHOTOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  addPhoto(photo) {
    const photos = this.getPhotos();
    photo.id = Date.now().toString();
    photos.push(photo);
    localStorage.setItem(this.PHOTOS_KEY, JSON.stringify(photos));
    return photo;
  }

  deletePhoto(id) {
    let photos = this.getPhotos();
    photos = photos.filter(p => p.id !== id);
    localStorage.setItem(this.PHOTOS_KEY, JSON.stringify(photos));
  }

  // ========== BACKUP & RESTORE ==========
  exportData() {
    return {
      workouts: this.getWorkouts(),
      categories: this.getCategories(),
      photos: this.getPhotos(),
      weights: this.getWeights(),
      exportDate: new Date().toISOString()
    };
  }

  importData(data) {
    if (data.workouts) localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(data.workouts));
    if (data.categories) localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(data.categories));
    if (data.photos) localStorage.setItem(this.PHOTOS_KEY, JSON.stringify(data.photos));
    if (data.weights) localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(data.weights));
  }

  // ========== WEIGHTS (body weight tracking) ==========
  getWeights() {
    try {
      const data = localStorage.getItem(this.WEIGHTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading weights:', e);
      return [];
    }
  }

  addWeight(entry) {
    const weights = this.getWeights();
    entry.id = Date.now().toString();
    weights.push(entry);
    localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(weights));
    return entry;
  }

  updateWeight(id, updates) {
    let weights = this.getWeights();
    weights = weights.map(w => w.id === id ? { ...w, ...updates } : w);
    localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(weights));
  }

  deleteWeight(id) {
    let weights = this.getWeights();
    weights = weights.filter(w => w.id !== id);
    localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(weights));
  }
}

// Global instance
const storage = new GymStorage();
