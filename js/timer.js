// ==================== TIMER PAGE ====================

let timerInterval = null;
let timeLeft = 0;
let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
  drawClock();
  setupEventListeners();
});

function setupEventListeners() {
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const minutesInput = document.getElementById('timerMinutes');
  const secondsInput = document.getElementById('timerSeconds');

  if (startBtn) {
    startBtn.addEventListener('click', toggleTimer);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetTimer);
  }

  if (minutesInput) {
    minutesInput.addEventListener('change', () => {
      if (!isRunning) updateTimerDisplay();
    });
  }

  if (secondsInput) {
    secondsInput.addEventListener('change', () => {
      if (!isRunning) updateTimerDisplay();
    });
  }
}

function getInitialTime() {
  const minutes = parseInt(document.getElementById('timerMinutes')?.value) || 1;
  const seconds = parseInt(document.getElementById('timerSeconds')?.value) || 0;
  return minutes * 60 + seconds;
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const timerDisplay = document.getElementById('timerDisplay');
  if (timerDisplay) {
    timerDisplay.textContent = display;
  }

  drawClock();
}

function drawClock() {
  const canvas = document.getElementById('timerCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const radius = canvas.width / 2;
  const centerX = radius;
  const centerY = radius;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background circle
  ctx.fillStyle = '#F7F2E9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer circle
  ctx.strokeStyle = '#8C6F4E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = '#8C6F4E';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Hour markers
  ctx.strokeStyle = '#8C6F4E';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * Math.PI / 180;
    const x1 = centerX + (radius - 20) * Math.sin(angle);
    const y1 = centerY - (radius - 20) * Math.cos(angle);
    const x2 = centerX + (radius - 5) * Math.sin(angle);
    const y2 = centerY - (radius - 5) * Math.cos(angle);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Calculate hand positions
  const initialTime = getInitialTime();
  const progress = initialTime > 0 ? timeLeft / initialTime : 0;
  const angle = progress * Math.PI * 2 - Math.PI / 2;

  // Hand (second hand style)
  ctx.strokeStyle = '#E8D9C4';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + (radius - 20) * Math.cos(angle),
    centerY + (radius - 20) * Math.sin(angle)
  );
  ctx.stroke();

  // Numbers
  ctx.fillStyle = '#3E2F1C';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30) * Math.PI / 180;
    const x = centerX + (radius - 35) * Math.sin(angle);
    const y = centerY - (radius - 35) * Math.cos(angle);
    ctx.fillText(i, x, y);
  }
}

function toggleTimer() {
  const startBtn = document.getElementById('startBtn');
  if (!startBtn) return;

  if (!isRunning) {
    // Start timer
    if (timeLeft === 0) {
      timeLeft = getInitialTime();
    }

    isRunning = true;
    startBtn.textContent = 'Jeda';
    startBtn.classList.replace('btn-success', 'btn-warning');

    document.getElementById('timerMinutes').disabled = true;
    document.getElementById('timerSeconds').disabled = true;

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.textContent = 'Mulai';
        startBtn.classList.replace('btn-warning', 'btn-success');
        document.getElementById('timerMinutes').disabled = false;
        document.getElementById('timerSeconds').disabled = false;
        
        // Vibrate and sound notification
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        playTimerSound();
      }
    }, 1000);
  } else {
    // Pause timer
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = 'Lanjut';
    startBtn.classList.replace('btn-warning', 'btn-success');
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = 0;
  
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.textContent = 'Mulai';
    startBtn.classList.replace('btn-warning', 'btn-success');
  }

  document.getElementById('timerMinutes').disabled = false;
  document.getElementById('timerSeconds').disabled = false;
  
  updateTimerDisplay();
}

function playTimerSound() {
  // Play beep sound using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}
