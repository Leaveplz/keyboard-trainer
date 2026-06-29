const gameLayer = document.querySelector("#gameLayer");
const scoreEl = document.querySelector("#score");
const streakEl = document.querySelector("#streak");
const timerEl = document.querySelector("#timer");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const soundButton = document.querySelector("#soundButton");
const speedRange = document.querySelector("#speedRange");
const durationSelect = document.querySelector("#durationSelect");
const phrasePanel = document.querySelector("#phrasePanel");
const phraseText = document.querySelector("#phraseText");
const typedPreview = document.querySelector("#typedPreview");
const leftPreview = document.querySelector("#leftPreview");
const toast = document.querySelector("#toast");
const modeButtons = [...document.querySelectorAll(".mode-card")];

const sets = {
  letters: "абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split(""),
  symbols: [".", ",", "!", "?", ":", ";", "-", "—", "…", "«", "»", "(", ")", "+", "-", "=", "*", "/"],
  numbers: "0123456789@<>".split(""),
};

const phrases = [
  "Эх, — подумал ёжик, прислушиваясь к этой симфонии, — как же прекрасно жить в таком мире!",
  "Смотри, какие удивительные грибы, какой у них яркий цвет!",
  "Да, — ответил Петя, — вот этот, с красной шляпкой и в белых точках, — мухомор.",
  "Осторожно, он несъедобный и даже ядовитый!",
  "Вокруг шумели деревья, пели птицы, где-то вдалеке была слышна кукушка: ку-ку, ку-ку…",
  "А вот и подберёзовики! — обрадовалась Маша.",
  "Она аккуратно срезала пару крепких грибов и положила их в свою корзинку.",
  "Отлично, теперь можно идти к ручью: там, кажется, есть земляника.",
];

const colors = ["#f25d50", "#1eb7cf", "#96d80b", "#ffcf33", "#9b72e7", "#ff8c42"];
const layoutHints = {
  q: "й",
  w: "ц",
  e: "у",
  r: "к",
  t: "е",
  y: "н",
  u: "г",
  i: "ш",
  o: "щ",
  p: "з",
  "[": "х",
  "]": "ъ",
  a: "ф",
  s: "ы",
  d: "в",
  f: "а",
  g: "п",
  h: "р",
  j: "о",
  k: "л",
  l: "д",
  ";": "ж",
  "'": "э",
  z: "я",
  x: "ч",
  c: "с",
  v: "м",
  b: "и",
  n: "т",
  m: "ь",
  ",": "б",
  ".": "ю",
};

let mode = "letters";
let score = 0;
let streak = 0;
let secondsLeft = Number(durationSelect.value);
let isPaused = false;
let soundOn = true;
let spawnTimer = null;
let countdownTimer = null;
let activePhrase = "";
let phraseIndex = 0;
let typed = "";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function normalizeKey(key) {
  if (key === "Dead") return "";
  return key;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1900);
}

function playTone(type) {
  if (!soundOn) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = playTone.ctx || new AudioContext();
  playTone.ctx = ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = type === "good" ? 660 : 180;
  osc.type = type === "good" ? "triangle" : "sawtooth";
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.13);
}

function updateStats() {
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  timerEl.textContent = secondsLeft;
}

function setMode(nextMode) {
  mode = nextMode;
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  resetGame();
}

function clearBalloons() {
  gameLayer.innerHTML = "";
}

function makeBalloon(symbol) {
  const balloon = document.createElement("button");
  const sizeOffset = mode === "numbers" ? 8 : 0;
  balloon.className = "balloon";
  balloon.type = "button";
  balloon.textContent = symbol;
  balloon.dataset.symbol = symbol;
  balloon.style.background = pick(colors);
  balloon.style.left = `${rand(7, 82)}%`;
  balloon.style.top = `${rand(8, 66)}%`;
  balloon.style.width = `${92 + sizeOffset}px`;
  balloon.style.height = `${116 + sizeOffset}px`;
  balloon.style.animationDuration = `${rand(2.1, 3.4)}s`;
  balloon.addEventListener("click", () => popBalloon(balloon, true));
  gameLayer.append(balloon);
}

function spawnBalloon() {
  if (isPaused || mode === "phrases") return;
  const list = sets[mode];
  makeBalloon(pick(list));
  const maxBalloons = 5 + Number(speedRange.value);
  while (gameLayer.children.length > maxBalloons) {
    gameLayer.firstElementChild.remove();
    streak = 0;
  }
  updateStats();
}

function popBalloon(balloon, isMouse = false) {
  balloon.classList.add("pop");
  score += isMouse ? 1 : 2;
  streak += 1;
  playTone("good");
  updateStats();
  setTimeout(() => balloon.remove(), 210);
}

function markMiss() {
  streak = 0;
  playTone("bad");
  document.querySelectorAll(".balloon").forEach((balloon) => {
    balloon.classList.add("miss");
    setTimeout(() => balloon.classList.remove("miss"), 260);
  });
  updateStats();
}

function handleBalloonKey(key) {
  const balloon = [...document.querySelectorAll(".balloon")].find((item) => item.dataset.symbol === key);
  if (balloon) {
    popBalloon(balloon);
  } else if (key.length === 1) {
    const hintedLetter = layoutHints[key.toLowerCase()];
    const hasRussianTarget = hintedLetter && [...document.querySelectorAll(".balloon")].some((item) => item.dataset.symbol.toLowerCase() === hintedLetter);
    if (mode === "letters" && hasRussianTarget) {
      showToast(`Похоже, включена английская раскладка. Нужна буква «${hintedLetter}».`);
    }
    markMiss();
  }
}

function choosePhrase() {
  activePhrase = phrases[phraseIndex % phrases.length];
  phraseIndex += 1;
  typed = "";
  phraseText.textContent = activePhrase;
  renderPhrase();
}

function renderPhrase() {
  typedPreview.textContent = typed;
  leftPreview.textContent = activePhrase.slice(typed.length);
}

function handlePhraseKey(event) {
  if (event.key === "Backspace") {
    typed = typed.slice(0, -1);
    renderPhrase();
    return;
  }
  const key = normalizeKey(event.key);
  if (key.length !== 1) return;

  const expected = activePhrase[typed.length];
  if (key === expected) {
    typed += key;
    score += key === " " ? 2 : 1;
    streak += 1;
    playTone("good");
    if (typed === activePhrase) {
      score += 20;
      showToast("Предложение готово! Следующее.");
      choosePhrase();
    } else {
      renderPhrase();
    }
  } else {
    streak = 0;
    playTone("bad");
    showToast(expected === " " ? "Здесь нужен пробел" : `Нужен символ: ${expected}`);
  }
  updateStats();
}

function startTimers() {
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  const spawnDelay = 1350 - Number(speedRange.value) * 260;
  spawnTimer = setInterval(spawnBalloon, spawnDelay);
  countdownTimer = setInterval(() => {
    if (isPaused) return;
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      secondsLeft = 0;
      isPaused = true;
      showToast(`Время вышло! Очки: ${score}`);
    }
    updateStats();
  }, 1000);
}

function resetGame() {
  score = 0;
  streak = 0;
  secondsLeft = Number(durationSelect.value);
  isPaused = false;
  pauseButton.textContent = "Ⅱ";
  pauseButton.setAttribute("aria-label", "Пауза");
  clearBalloons();
  phrasePanel.classList.toggle("visible", mode === "phrases");
  gameLayer.style.display = mode === "phrases" ? "none" : "block";
  if (mode === "phrases") {
    choosePhrase();
  } else {
    for (let i = 0; i < 4; i += 1) spawnBalloon();
  }
  updateStats();
  startTimers();
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey || isPaused) return;
  if ([" ", "Backspace"].includes(event.key)) event.preventDefault();
  if (mode === "phrases") {
    handlePhraseKey(event);
  } else {
    handleBalloonKey(normalizeKey(event.key));
  }
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

startButton.addEventListener("click", resetGame);

pauseButton.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "▶" : "Ⅱ";
  pauseButton.setAttribute("aria-label", isPaused ? "Продолжить" : "Пауза");
});

soundButton.addEventListener("click", () => {
  soundOn = !soundOn;
  soundButton.textContent = soundOn ? "♪" : "×";
  soundButton.setAttribute("aria-label", soundOn ? "Звук включен" : "Звук выключен");
});

speedRange.addEventListener("input", startTimers);
durationSelect.addEventListener("change", resetGame);

resetGame();
