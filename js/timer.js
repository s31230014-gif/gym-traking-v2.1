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
  // Circular background with subtle inner shadow
  const grad = ctx.createRadialGradient(centerX - radius*0.2, centerY - radius*0.25, radius*0.1, centerX, centerY, radius);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.25, '#F8F9FA');
  grad.addColorStop(1, '#E9ECEF');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
  ctx.fill();

  // Outer ring
  ctx.strokeStyle = '#6C757D';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 12, 0, Math.PI * 2);
  ctx.stroke();


  // Hour markers
  ctx.strokeStyle = '#6C757D';
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

  // Draw progress arc instead of a single thick hand
  const initialTime = getInitialTime();
  const progress = initialTime > 0 ? (initialTime - timeLeft) / initialTime : 0;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + progress * Math.PI * 2;

  // Background arc
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(108,117,125,0.12)';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.arc(centerX, centerY, radius - 40, startAngle, startAngle + Math.PI * 2);
  ctx.stroke();

  // Foreground progress arc
  ctx.beginPath();
  ctx.strokeStyle = '#6C757D';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.arc(centerX, centerY, radius - 40, startAngle, endAngle);
  ctx.stroke();

  // Draw a thin hand (jarum) pointing to the current endAngle for familiarity
  const handLength = radius - 60;
  const handAngle = endAngle; // points where the progress ends
  ctx.beginPath();
  ctx.strokeStyle = '#3E2F1C';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + handLength * Math.cos(handAngle), centerY + handLength * Math.sin(handAngle));
  ctx.stroke();

  // (removed center dot to avoid obstructing numbers)

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
