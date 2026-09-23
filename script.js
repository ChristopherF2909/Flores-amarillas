const note = document.querySelector('#note');
const musicButton = document.querySelector('#music');
const flowerMessage = document.querySelector('#flower-message');
const centerFlower = document.querySelector('.flower-two');

function revealMessage() {
  note.hidden = false;
  flowerMessage.textContent = '¡Un mensaje especial para ti! 💛';
  note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Melodía suave generada aquí mismo, sin archivos de audio externos.
let audioContext;
let musicTimer;
let noteIndex = 0;
const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
function playNote() {
  if (!audioContext || audioContext.state !== 'running') return;
  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = 'sine';
  oscillator.frequency.value = melody[noteIndex++ % melody.length];
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
  oscillator.connect(volume);
  volume.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 1.15);
}
function startMusic() {
  if (musicTimer) return;
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume().then(() => {
    if (musicTimer) return;
    playNote();
    musicTimer = setInterval(playNote, 650);
    musicButton.textContent = '♫ Pausar música';
    musicButton.setAttribute('aria-pressed', 'true');
  }).catch(() => {
    musicButton.textContent = '♫ Toca para activar música';
  });
}

// El navegador puede bloquear sonido automático. Se intenta al cargar y se
// vuelve a intentar en la primera interacción si hace falta.
startMusic();
function startOnFirstInteraction() {
  if (!musicTimer) startMusic();
  if (musicTimer) {
    document.removeEventListener('pointerdown', startOnFirstInteraction);
    document.removeEventListener('keydown', startOnFirstInteraction);
  }
}
document.addEventListener('pointerdown', startOnFirstInteraction);
document.addEventListener('keydown', startOnFirstInteraction);

musicButton.addEventListener('click', async () => {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = undefined;
    await audioContext.suspend();
    musicButton.textContent = '♫ Reanudar música';
    musicButton.setAttribute('aria-pressed', 'false');
  } else {
    startMusic();
  }
});

// Solo el centro de la flor del medio abre la dedicatoria.
centerFlower.addEventListener('click', (event) => {
  if (event.target.closest('b')) revealMessage();
});

const surprises = [
  'Eres una persona muy especial 💛',
  'Toca el centro de esta flor para leer tu mensaje 🌼',
  '¡Te quiero muchísimo, hermanita! ✨'
];
document.querySelectorAll('.flower').forEach((flower, index) => {
  flower.addEventListener('click', (event) => {
    flower.classList.remove('bloom');
    void flower.offsetWidth;
    flower.classList.add('bloom');
    if (index !== 1 || !event.target.closest('b')) flowerMessage.textContent = surprises[index];
    for (let i = 0; i < 7; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.textContent = '✦';
      petal.style.setProperty('--drift', `${Math.random() * 100 - 50}px`);
      petal.style.left = `${flower.offsetLeft + 38}px`;
      petal.style.top = `${flower.offsetTop + 38}px`;
      document.querySelector('.bouquet').append(petal);
      petal.addEventListener('animationend', () => petal.remove());
    }
  });
});
