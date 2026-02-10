let ctx: AudioContext | null = null;
let doorOpenBuffer: AudioBuffer | null = null;
let doorCloseBuffer: AudioBuffer | null = null;
let imNotifyBuffer: AudioBuffer | null = null;

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

// Unlock AudioContext on first user interaction
function unlock() {
  const audio = getContext();
  if (audio.state === 'suspended') void audio.resume();
  document.removeEventListener('click', unlock);
  document.removeEventListener('keydown', unlock);
}
document.addEventListener('click', unlock);
document.addEventListener('keydown', unlock);

async function loadBuffer(src: string): Promise<AudioBuffer> {
  const res = await fetch(src);
  const arrayBuf = await res.arrayBuffer();
  return getContext().decodeAudioData(arrayBuf);
}

// Preload sounds (silently ignore failures — playBuffer handles null buffers gracefully)
void loadBuffer('/sounds/door_open.mp3')
  .then((buf) => {
    doorOpenBuffer = buf;
  })
  .catch(() => {});
void loadBuffer('/sounds/door_closed.mp3')
  .then((buf) => {
    doorCloseBuffer = buf;
  })
  .catch(() => {});
void loadBuffer('/sounds/im_notify.wav')
  .then((buf) => {
    imNotifyBuffer = buf;
  })
  .catch(() => {});

function playBuffer(buffer: AudioBuffer | null) {
  if (!buffer) return;
  const audio = getContext();
  if (audio.state === 'suspended') return;
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  source.start();
}

export function playDoorOpen() {
  playBuffer(doorOpenBuffer);
}

export function playDoorClose() {
  playBuffer(doorCloseBuffer);
}

export function playImNotify() {
  playBuffer(imNotifyBuffer);
}

// Dial-up sound — preloaded eagerly like the other sounds.
let dialupBuffer: AudioBuffer | null = null;
const dialupReadyListeners: Array<() => void> = [];
void loadBuffer('/sounds/dialup.mp3')
  .then((buf) => {
    dialupBuffer = buf;
    for (const cb of dialupReadyListeners) cb();
    dialupReadyListeners.length = 0;
  })
  .catch(() => {});

// ── Dialup auto-start on OAuth callback ────────────────────────────
// Start the playback chain at MODULE LOAD time (before React even renders)
// so the dialup is the very first thing that happens after the redirect.
// ConnectingScreen adopts the running cleanup via claimDialup().
let dialupCleanup: (() => void) | null = null;

function startDialup(): () => void {
  let source: AudioBufferSourceNode | null = null;
  let stopped = false;

  function play() {
    if (stopped || source || !dialupBuffer) return;
    const audio = getContext();
    if (audio.state !== 'running') return;
    source = audio.createBufferSource();
    source.buffer = dialupBuffer;
    source.connect(audio.destination);
    source.start();
  }

  // Try immediately
  play();

  // Retry when AudioContext unlocks (user's first click/keydown)
  const audio = getContext();
  const onStateChange = () => {
    play();
  };
  audio.addEventListener('statechange', onStateChange);

  // Retry when buffer finishes loading
  if (!dialupBuffer) {
    dialupReadyListeners.push(play);
  }

  return () => {
    stopped = true;
    audio.removeEventListener('statechange', onStateChange);
    try {
      source?.stop();
    } catch {
      // Already stopped
    }
    source = null;
  };
}

// Fire immediately at module load if returning from OAuth
if (sessionStorage.getItem('protoimsg:oauth_pending') === '1') {
  // Optimistically try to unlock AudioContext right away
  const audio = getContext();
  if (audio.state === 'suspended') void audio.resume();

  dialupCleanup = startDialup();
}

// Called from ConnectingScreen useEffect — adopts the already-running dialup,
// or starts a new one if it wasn't initiated at module load.
// Returns cleanup that stops the audio on component unmount.
export function claimDialup(): () => void {
  if (dialupCleanup) {
    const cleanup = dialupCleanup;
    dialupCleanup = null;
    return cleanup;
  }
  return startDialup();
}
