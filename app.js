const screens = {
  menu: document.querySelector("#menuScreen"),
  game: document.querySelector("#gameScreen"),
  result: document.querySelector("#resultScreen"),
};

const gameLayer = document.querySelector("#gameLayer");
const scoreEl = document.querySelector("#score");
const streakEl = document.querySelector("#streak");
const timerEl = document.querySelector("#timer");
const startButton = document.querySelector("#startButton");
const againButton = document.querySelector("#againButton");
const menuButton = document.querySelector("#menuButton");
const resultMenuButton = document.querySelector("#resultMenuButton");
const pauseButton = document.querySelector("#pauseButton");
const hintButton = document.querySelector("#hintButton");
const speedRange = document.querySelector("#speedRange");
const durationSelect = document.querySelector("#durationSelect");
const spawnStyleSelect = document.querySelector("#spawnStyleSelect");
const spawnStyleLabel = document.querySelector("#spawnStyleLabel");
const phraseTopicSelect = document.querySelector("#phraseTopicSelect");
const phraseTopicLabel = document.querySelector("#phraseTopicLabel");
const floatModeCheck = document.querySelector("#floatModeCheck");
const floatModeRow = document.querySelector("#floatModeRow");
const penaltyCheck = document.querySelector("#penaltyCheck");
const soundCheck = document.querySelector("#soundCheck");
const phrasePanel = document.querySelector("#phrasePanel");
const phraseText = document.querySelector("#phraseText");
const typedPreview = document.querySelector("#typedPreview");
const leftPreview = document.querySelector("#leftPreview");
const toast = document.querySelector("#toast");
const modeButtons = [...document.querySelectorAll(".mode-card")];
const finalScore = document.querySelector("#finalScore");
const finalStreak = document.querySelector("#finalStreak");
const resultText = document.querySelector("#resultText");

const sets = {
  letters: "абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split(""),
  symbols: [".", ",", "!", "?", ":", ";", "-", "\"", "'", "(", ")", "+", "=", "*", "/", "@", "<", ">"],
  numbers: "0123456789".split(""),
};

const phraseTopics = {
  hedgehog: [
    "Эх, - подумал ежик, - как тихо и красиво сегодня в лесу!",
  ],
  mushroom: [
    "\"Смотри, это мухомор: яркий, красивый, но ядовитый!\" - сказала Маша.",
  ],
  stream: [
    "\"Пойдем к ручью: там, кажется, растет земляника\", - предложил Петя.",
  ],
  forest: [
    "Вокруг шумели деревья, пели птицы, а где-то далеко куковала кукушка.",
  ],
  basket: [
    "Маша аккуратно положила крепкий гриб в корзинку и улыбнулась.",
  ],
};

const keyHints = {
  " ": "Пробел",
  ".": "точка: клавиша .",
  ",": "запятая: клавиша ,",
  "!": "Shift + 1",
  "?": "Shift + 7",
  ":": "Shift + 6",
  ";": "Shift + 4",
  "-": "клавиша -",
  "\"": "Shift + 2",
  "'": "клавиша '",
  "(": "Shift + 9",
  ")": "Shift + 0",
  "+": "Shift + =",
  "=": "клавиша =",
  "*": "Shift + 8",
  "/": "клавиша /",
  "@": "английская раскладка: Shift + 2",
  "<": "английская раскладка: Shift + ,",
  ">": "английская раскладка: Shift + .",
};

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

const russianCodeMap = {
  Backquote: "ё",
  KeyQ: "й",
  KeyW: "ц",
  KeyE: "у",
  KeyR: "к",
  KeyT: "е",
  KeyY: "н",
  KeyU: "г",
  KeyI: "ш",
  KeyO: "щ",
  KeyP: "з",
  BracketLeft: "х",
  BracketRight: "ъ",
  KeyA: "ф",
  KeyS: "ы",
  KeyD: "в",
  KeyF: "а",
  KeyG: "п",
  KeyH: "р",
  KeyJ: "о",
  KeyK: "л",
  KeyL: "д",
  Semicolon: "ж",
  Quote: "э",
  KeyZ: "я",
  KeyX: "ч",
  KeyC: "с",
  KeyV: "м",
  KeyB: "и",
  KeyN: "т",
  KeyM: "ь",
  Comma: "б",
  Period: "ю",
};

const colors = ["#f25d50", "#1eb7cf", "#96d80b", "#ffcf33", "#9b72e7", "#ff8c42"];

let mode = "letters";
let score = 0;
let streak = 0;
let bestStreak = 0;
let secondsLeft = Number(durationSelect.value);
let isPaused = false;
let isPlaying = false;
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

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function playTone(type) {
  if (!soundCheck.checked) return;
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

function normalizeKey(key) {
  if (key === "Dead") return "";
  return key;
}

function keyCandidates(event) {
  const key = normalizeKey(event.key);
  const candidates = new Set();
  if (key) candidates.add(key);

  const physicalRussian = russianCodeMap[event.code];
  const looksLikeLatinLayout = /^[a-z\[\]',.;`]$/i.test(key);
  if (physicalRussian && looksLikeLatinLayout) {
    candidates.add(event.shiftKey ? physicalRussian.toUpperCase() : physicalRussian);
  }

  return [...candidates];
}

function symbolsMatch(typedSymbol, targetSymbol) {
  if (typedSymbol === targetSymbol) return true;
  return false;
}

function updateStats() {
  bestStreak = Math.max(bestStreak, streak);
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  timerEl.textContent = secondsLeft;
}

function updateModeControls() {
  const balloonMode = mode !== "phrases";
  spawnStyleLabel.style.display = balloonMode ? "grid" : "none";
  floatModeRow.style.display = balloonMode ? "flex" : "none";
  phraseTopicLabel.style.display = mode === "phrases" ? "grid" : "none";
  hintButton.disabled = mode !== "phrases";
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setMode(nextMode) {
  mode = nextMode;
  updateModeControls();
}

function clearTimers() {
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  spawnTimer = null;
  countdownTimer = null;
}

function clearBalloons() {
  gameLayer.innerHTML = "";
}

function makeBalloon(symbol) {
  const balloon = document.createElement("div");
  const sizeOffset = mode === "numbers" ? 8 : 0;
  balloon.className = "balloon";
  balloon.textContent = symbol;
  balloon.dataset.symbol = symbol;
  balloon.style.background = pick(colors);
  balloon.style.left = `${rand(7, 84)}%`;
  balloon.style.width = `${92 + sizeOffset}px`;
  balloon.style.height = `${116 + sizeOffset}px`;

  if (floatModeCheck.checked) {
    balloon.classList.add("float");
    balloon.style.setProperty("--rise-duration", `${8.5 - Number(speedRange.value) * 1.4}s`);
    balloon.addEventListener("animationend", (event) => {
      if (event.animationName !== "rise" || !balloon.isConnected || !isPlaying) return;
      balloon.remove();
      if (spawnStyleSelect.value === "single" && mode !== "phrases") {
        spawnBalloon();
      }
    });
  } else {
    balloon.style.top = `${rand(8, 66)}%`;
    balloon.style.animationDuration = `${rand(2.1, 3.4)}s`;
  }

  gameLayer.append(balloon);
  return balloon;
}

function spawnBalloon() {
  if (isPaused || !isPlaying || mode === "phrases") return;

  const list = sets[mode];
  if (spawnStyleSelect.value === "single") {
    if (gameLayer.children.length === 0) {
      makeBalloon(pick(list));
    }
    return;
  }

  const amount = Math.random() > 0.68 ? 2 : 1;
  for (let i = 0; i < amount; i += 1) {
    makeBalloon(pick(list));
  }

  const maxBalloons = 4 + Number(speedRange.value) * 2;
  while (gameLayer.children.length > maxBalloons) {
    gameLayer.firstElementChild.remove();
  }
}

function popBalloon(balloon) {
  balloon.classList.add("pop");
  score += 2;
  streak += 1;
  playTone("good");
  updateStats();
  setTimeout(() => {
    balloon.remove();
    if (spawnStyleSelect.value === "single" && mode !== "phrases" && isPlaying && !isPaused) {
      spawnBalloon();
    }
  }, 210);
}

function markMiss(message) {
  streak = 0;
  if (penaltyCheck.checked) {
    score = Math.max(0, score - 1);
  }
  playTone("bad");
  document.querySelectorAll(".balloon").forEach((balloon) => {
    balloon.classList.add("miss");
    setTimeout(() => balloon.classList.remove("miss"), 260);
  });
  if (message) showToast(message);
  updateStats();
}

function handleBalloonKey(key) {
  const keys = Array.isArray(key) ? key : [key];
  const balloon = [...document.querySelectorAll(".balloon")].find((item) => keys.some((candidate) => symbolsMatch(candidate, item.dataset.symbol)));
  if (balloon) {
    popBalloon(balloon);
    return;
  }

  if (!keys.some((candidate) => candidate.length === 1)) return;

  const hintedLetter = keys.map((candidate) => layoutHints[candidate.toLowerCase()]).find(Boolean);
  const hasRussianTarget = hintedLetter && [...document.querySelectorAll(".balloon")].some((item) => item.dataset.symbol.toLowerCase() === hintedLetter);
  if (mode === "letters" && hasRussianTarget) {
    markMiss(`Похоже, включена английская раскладка. Нужна буква "${hintedLetter}".`);
  } else {
    markMiss("Попробуй другую клавишу.");
  }
}

function choosePhrase() {
  const phrases = phraseTopics[phraseTopicSelect.value] || phraseTopics.hedgehog;
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

function expectedPhraseChar() {
  return activePhrase[typed.length] || "";
}

function showPhraseHint() {
  const expected = expectedPhraseChar();
  if (!expected) {
    showToast("Предложение уже готово.");
    return;
  }
  showToast(keyHints[expected] || `Нажми клавишу "${expected}".`);
}

function handlePhraseKey(event) {
  if (event.key === "Backspace") {
    typed = typed.slice(0, -1);
    renderPhrase();
    return;
  }

  const key = normalizeKey(event.key);
  if (key.length !== 1) return;

  const expected = expectedPhraseChar();
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
    if (penaltyCheck.checked) {
      score = Math.max(0, score - 1);
    }
    playTone("bad");
    showToast(expected === " " ? "Здесь нужен пробел." : `Нужен символ: ${expected}. Подсказка: ${keyHints[expected] || "посмотри на клавиатуру"}.`);
  }
  updateStats();
}

function startTimers() {
  clearTimers();

  if (mode !== "phrases" && spawnStyleSelect.value === "many") {
    const spawnDelay = 1400 - Number(speedRange.value) * 260;
    spawnTimer = setInterval(spawnBalloon, spawnDelay);
  }

  countdownTimer = setInterval(() => {
    if (isPaused || !isPlaying) return;
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      secondsLeft = 0;
      finishGame();
    }
    updateStats();
  }, 1000);
}

function startGame() {
  score = 0;
  streak = 0;
  bestStreak = 0;
  phraseIndex = 0;
  secondsLeft = Number(durationSelect.value);
  isPaused = false;
  isPlaying = true;
  pauseButton.textContent = "Ⅱ";
  pauseButton.setAttribute("aria-label", "Пауза");
  clearBalloons();
  updateModeControls();
  phrasePanel.classList.toggle("visible", mode === "phrases");
  gameLayer.style.display = mode === "phrases" ? "none" : "block";

  if (mode === "phrases") {
    choosePhrase();
  } else if (spawnStyleSelect.value === "single") {
    spawnBalloon();
  } else {
    const initial = 3 + Number(speedRange.value);
    for (let i = 0; i < initial; i += 1) spawnBalloon();
  }

  updateStats();
  showScreen("game");
  startTimers();
}

function finishGame() {
  isPlaying = false;
  isPaused = true;
  clearTimers();
  clearBalloons();
  finalScore.textContent = score;
  finalStreak.textContent = bestStreak;
  resultText.textContent = score >= 80 ? "Супер! Пальцы работали очень быстро." : "Хорошая тренировка! Еще один раунд сделает результат выше.";
  showScreen("result");
}

function goToMenu() {
  isPlaying = false;
  isPaused = false;
  clearTimers();
  clearBalloons();
  showScreen("menu");
}

document.addEventListener("keydown", (event) => {
  if (!isPlaying || isPaused || event.ctrlKey || event.altKey || event.metaKey) return;
  if ([" ", "Backspace"].includes(event.key)) event.preventDefault();
  if (mode === "phrases") {
    handlePhraseKey(event);
  } else {
    handleBalloonKey(keyCandidates(event));
  }
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

startButton.addEventListener("click", startGame);
againButton.addEventListener("click", startGame);
menuButton.addEventListener("click", goToMenu);
resultMenuButton.addEventListener("click", goToMenu);
hintButton.addEventListener("click", showPhraseHint);

pauseButton.addEventListener("click", () => {
  if (!isPlaying) return;
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "▶" : "Ⅱ";
  pauseButton.setAttribute("aria-label", isPaused ? "Продолжить" : "Пауза");
  if (!isPaused && mode !== "phrases" && gameLayer.children.length === 0) {
    spawnBalloon();
  }
});

speedRange.addEventListener("input", () => {
  if (!isPlaying || mode === "phrases" || spawnStyleSelect.value === "single") return;
  startTimers();
});

spawnStyleSelect.addEventListener("change", () => {
  if (!isPlaying || mode === "phrases") return;
  clearBalloons();
  if (spawnStyleSelect.value === "single") {
    clearInterval(spawnTimer);
    spawnTimer = null;
    spawnBalloon();
  } else {
    for (let i = 0; i < 3; i += 1) spawnBalloon();
    startTimers();
  }
});

updateModeControls();
showScreen("menu");
