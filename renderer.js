// ═══════════════════════════════════════════════════════
// 🦞 虾哥桌宠 — 交互逻辑
// ═══════════════════════════════════════════════════════

// ── State ──────────────────────────────────────────

const state = {
  showChat: false,
  messages: [],
  isLoading: false,
  emotion: 'idle',
  dragStart: null,
  isDragging: false,
  placeholderIndex: 0,
  idleLevel: 0,
  messageCount: 0,
};

// ── DOM refs ───────────────────────────────────────

const shrimpArea = document.getElementById('shrimp-area');
const chatArea = document.getElementById('chat-area');
const messageList = document.getElementById('message-list');
const sendBtn = document.getElementById('send-btn');
const thinkingDots = document.getElementById('thinking-dots');
const shrimpWrapper = document.getElementById('shrimp-wrapper');

// ── Placeholder rotation ──────────────────────────

const placeholders = [
  '说点啥...',
  '戳我聊天 🦞',
  '想聊什么？',
  '发个消息吧~',
  'Claw 听着呢 👂',
  'Hi~ 👋',
];

function rotatePlaceholder() {
  state.placeholderIndex = (state.placeholderIndex + 1) % placeholders.length;
  const el = document.getElementById('message-input');
  if (el) el.placeholder = placeholders[state.placeholderIndex];
}

let placeholderInterval;

function startPlaceholderRotation() {
  stopPlaceholderRotation();
  placeholderInterval = setInterval(rotatePlaceholder, 8000);
}

function stopPlaceholderRotation() {
  if (placeholderInterval) {
    clearInterval(placeholderInterval);
    placeholderInterval = null;
  }
}

// ── Emotion System ─────────────────────────────────

function setEmotion(emotion) {
  state.emotion = emotion;
  shrimpArea.dataset.emotion = emotion;
}

const EMOTION_TIMERS = {
  happy: 3000,
  thinking: 0,
  surprised: 2000,
  sleepy: 0,
  idle: 0,
};

let emotionTimeout = null;

function setEmotionWithTimeout(emotion, duration) {
  setEmotion(emotion);
  if (emotionTimeout) clearTimeout(emotionTimeout);
  const ms = duration !== null && duration !== undefined ? duration : EMOTION_TIMERS[emotion];
  if (ms > 0) {
    emotionTimeout = setTimeout(() => setEmotion('idle'), ms);
  }
}

// ── Idle System ────────────────────────────────────

let idleTimer = null;

function resetIdleTimer() {
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
  state.idleLevel = 0;
  setEmotion('idle');
  startIdleLevelTimer();
}

function startIdleLevelTimer() {
  if (state.showChat) return;
  const IDLE_THRESHOLDS = [30000, 60000, 180000, 300000];

  function scheduleNext(level) {
    if (level >= IDLE_THRESHOLDS.length) return;
    const delay = level === 0
      ? IDLE_THRESHOLDS[0]
      : IDLE_THRESHOLDS[level] - IDLE_THRESHOLDS[level - 1];

    idleTimer = setTimeout(() => {
      state.idleLevel = level + 1;
      if (state.idleLevel >= 1) setEmotion('sleepy');
      scheduleNext(state.idleLevel);
    }, delay);
  }
  scheduleNext(0);
}


// ── Drag Handling ──────────────────────────────────

shrimpArea.style.webkitAppRegion = 'no-drag';

function getWindowPos() {
  try { return window.electronAPI.getWindowPosition(); }
  catch { return { x: window.screenX || 0, y: window.screenY || 0 }; }
}

function moveWindow(x, y) {
  try { window.electronAPI.moveWindow(x, y); }
  catch { window.moveTo(x, y); }
}

shrimpArea.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  // Jelly squish on press
  shrimpWrapper.classList.remove('jelly-release');
  shrimpWrapper.classList.add('dragging-squish');
  const winPos = getWindowPos();
  state.dragStart = {
    winX: winPos.x, winY: winPos.y,
    mouseX: e.screenX, mouseY: e.screenY,
  };
  state.isDragging = false;
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
  e.preventDefault();
});

function onDragMove(e) {
  if (!state.dragStart) return;
  const dx = e.screenX - state.dragStart.mouseX;
  const dy = e.screenY - state.dragStart.mouseY;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) state.isDragging = true;
  moveWindow(state.dragStart.winX + dx, state.dragStart.winY + dy);
}

function onDragEnd() {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
  state.dragStart = null;
  // Jelly bounce back
  shrimpWrapper.classList.remove('dragging-squish');
  shrimpWrapper.classList.remove('idle-bob');
  // Force reflow for animation restart
  void shrimpWrapper.offsetWidth;
  shrimpWrapper.classList.add('jelly-release');
  setTimeout(() => {
    shrimpWrapper.classList.remove('jelly-release');
    shrimpWrapper.classList.add('idle-bob');
  }, 400);
  if (state.isDragging) {
    setEmotionWithTimeout('happy', 1500);
    // Don't reset isDragging here — let the click handler do it
  }
}

// ── Click to toggle chat ──────────────────────────

// ── Right-click context menu ─────────────────────

shrimpArea.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  try {
    window.electronAPI.showContextMenu();
  } catch {}
});

shrimpArea.addEventListener('click', () => {
  if (state.isDragging) { state.isDragging = false; return; }

  // Mini jelly pop on click
  shrimpWrapper.classList.remove('jelly-release');
  shrimpWrapper.style.transition = 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)';
  shrimpWrapper.style.transform = 'scale(1.06, 0.92)';
  setTimeout(() => {
    shrimpWrapper.style.transform = '';
    shrimpWrapper.style.transition = '';
  }, 120);

  state.showChat = !state.showChat;
  chatArea.classList.toggle('hidden', !state.showChat);

  const height = state.showChat ? 240 : 130;
  try { window.electronAPI.resizeWindow(134, height, true); } catch {}

  if (state.showChat) {
    setEmotion('happy');
    setTimeout(() => { if (!state.isLoading) setEmotion('idle'); }, 2000);
    setTimeout(() => {
      const el = document.getElementById('message-input');
      if (el) el.focus();
    }, 350);
    stopPlaceholderRotation();
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
  } else {
    resetIdleTimer();
    startPlaceholderRotation();
  }
});

// ── Clear input (bulletproof) ─────────────────────

function bulletClearInput() {
  requestAnimationFrame(() => {
    const el = document.getElementById('message-input');
    if (!el) return;
    el.value = '';
    el.setAttribute('value', '');
    const ev = new Event('input', { bubbles: true });
    el.dispatchEvent(ev);
  });
}

// ── Send message ──────────────────────────────────

async function sendMessage(text) {
  state.isLoading = true;
  state.messageCount++;
  thinkingDots.classList.remove('hidden');
  setEmotion('thinking');

  state.messages.push({ role: 'user', content: text });
  renderMessages();
  renderLoading();

  try {
    const reply = await callBridge(state.messages);
    state.messages.push({ role: 'assistant', content: reply });
    setEmotionWithTimeout('happy', 2000);
  } catch (err) {
    state.messages.push({
      role: 'assistant',
      content: `🦞 出错了：${err.message || '无法连接到桥接服务'}`,
    });
    setEmotionWithTimeout('surprised', 1500);
  }

  state.isLoading = false;
  thinkingDots.classList.add('hidden');
  renderMessages();
  messageList.scrollTop = messageList.scrollHeight;
}

async function callBridge(conversation) {
  const resp = await fetch('http://localhost:19999/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'xige-assistant',
      messages: conversation.map(m => ({ role: m.role, content: m.content })),
      stream: false,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`桥接返回 ${resp.status}: ${body.slice(0, 100)}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '（没回复）';
}

// ── Render ─────────────────────────────────────────

function renderMessages() {
  messageList.innerHTML = '';
  state.messages.forEach((msg) => {
    const el = document.createElement('div');
    el.className = `msg ${msg.role}`;
    el.textContent = msg.content;
    messageList.appendChild(el);
  });
}

function renderLoading() {
  const el = document.createElement('div');
  el.className = 'msg loading-msg';
  el.textContent = 'Claw 思考中...';
  messageList.appendChild(el);
}

// ── Input handlers ────────────────────────────────

function handleSendInput() {
  const el = document.getElementById('message-input');
  if (!el) return;
  const v = el.value;
  if (!v.trim() || state.isLoading) return;
  el.value = '';
  el.setAttribute('value', '');
  bulletClearInput();
  sendMessage(v.trim());
}

document.getElementById('message-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    handleSendInput();
  }
  if (e.key === 'Escape') {
    state.showChat = false;
    chatArea.classList.add('hidden');
    try { window.electronAPI.resizeWindow(134, 130, true); } catch {}
    resetIdleTimer();
    startPlaceholderRotation();
  }
});

sendBtn.addEventListener('click', (e) => {
  handleSendInput();
});

// ── Global Escape handler ─────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    state.showChat = false;
    chatArea.classList.add('hidden');
    try { window.electronAPI.resizeWindow(134, 130, true); } catch {}
    resetIdleTimer();
    startPlaceholderRotation();
  }
});

// ── Blink ─────────────────────────────────────────

function randomBlink() {
  const eyes = document.getElementById('eyes');
  if (!eyes) return;
  const nextBlink = 2000 + Math.random() * 5000;
  setTimeout(() => {
    eyes.style.transition = 'none';
    eyes.style.opacity = '0';
    setTimeout(() => {
      eyes.style.transition = 'opacity 0.1s';
      eyes.style.opacity = '1';
    }, 120);
    randomBlink();
  }, nextBlink);
}

setTimeout(randomBlink, 3000);
// ═══════════════════════════════════════════════════════
// ✨ Whimsy Injector — 趣味互动系统
// ═══════════════════════════════════════════════════════

// ── Floating Text ─────────────────────────────────

function showFloatingText(text, duration = 2500) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: rgba(255,255,255,0.9);
    white-space: nowrap;
    pointer-events: none;
    z-index: 9999;
    animation: float-up ${duration}ms ease-out forwards;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 600;
  `;
  document.getElementById('pet-container').appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// Inject float-up keyframes once
(function injectFloatStyle() {
  if (document.getElementById('float-style')) return;
  const s = document.createElement('style');
  s.id = 'float-style';
  s.textContent = `
    @keyframes float-up {
      0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
      25%  { opacity: 1; transform: translateX(-50%) translateY(-6px); }
      60%  { opacity: 0.8; transform: translateX(-50%) translateY(-14px); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-22px); }
    }
  `;
  document.head.appendChild(s);
})();

// ── Bliss / Scared Emotion Extras ─────────────────

let shakeInterval = null;

function startShake(duration = 600) {
  if (shakeInterval) return;
  let count = 0;
  shrimpWrapper.style.transition = 'transform 0.03s';
  shakeInterval = setInterval(() => {
    const offset = count % 2 === 0 ? 3 : -3;
    shrimpWrapper.style.transform = `translateX(${offset}px)`;
    count++;
    if (count >= 12) {
      clearInterval(shakeInterval);
      shakeInterval = null;
      shrimpWrapper.style.transform = '';
      shrimpWrapper.style.transition = '';
    }
  }, 50);
}

// ── Triple-click Easter Egg ───────────────────────

let tapCount = 0;
let tapTimer;

shrimpArea.addEventListener('click', () => {
  tapCount++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => tapCount = 0, 800);

  if (tapCount === 3) {
    tapCount = 0;
    showFloatingText('分身术！✨', 3500);
    setEmotionWithTimeout('happy', 2000);
    try { window.electronAPI.cloneWindow(); } catch {}
  }
});

// ── Danger Word Detection ─────────────────────────

const DANGER_WORDS = ['吃龙虾', '吃你了', '烤龙虾', '蒸龙虾', '红烧龙虾', '清蒸龙虾', '麻辣龙虾'];

function checkDangerWords(text) {
  const found = DANGER_WORDS.find(w => text.includes(w));
  if (!found) return false;
  setEmotionWithTimeout('surprised', 2000);
  startShake(600);
  showFloatingText('😰 你认真的？！', 3500);
  return true;
}

// ── Late Night Mode ───────────────────────────────

let lateNightGreeted = false;

function checkLateNight() {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5 && !lateNightGreeted) {
    lateNightGreeted = true;
    showFloatingText('🌙 深夜模式…', 4000);
  }
}

// ── Patch sendMessage for danger words ────────────

const _origSendMessage = sendMessage;
sendMessage = async function whimsySendMessage(text) {
  checkDangerWords(text);
  return _origSendMessage(text);
};

// ── Enhance drag end with floating text ───────────

const _origOnDragEnd = onDragEnd;
onDragEnd = function whimsyOnDragEnd() {
  const wasDragging = state.isDragging;
  _origOnDragEnd();
  if (wasDragging) {
    const msgs = ['舒服~ 😊', '嘿嘿 ✨', '好！', '再摸摸~', '🦞❤️'];
    showFloatingText(msgs[Math.floor(Math.random() * msgs.length)], 3500);
  }
};

// ── Startup ────────────────────────────────────────

(async function startup() {
  console.log('🦞 Claw Pet v1.0');

  try {
    const resp = await fetch('http://localhost:19999/health');
    if (resp.ok) console.log('  桥接 ✅');
    else console.warn('  桥接 ⚠️');
  } catch {
    console.warn('  桥接未启动');
  }

  startPlaceholderRotation();
  startIdleLevelTimer();
  checkLateNight();
})();
