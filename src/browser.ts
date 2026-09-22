const DEFAULT_RECONNECT_DELAY = 500;
const MAX_RECONNECT_DELAY = 8000;

function randomInteger(maxExclusive: number): number {
  const values = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
    return (values[0] ?? 0) % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function createLocalToken(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replace(/-/g, "");
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(24);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return Array.from({ length: 48 }, () => randomInteger(16).toString(16)).join("");
}

export function sessionIdFromPath(pathname: string, routeName = "room"): string | null {
  const safeRoute = String(routeName).replace(/[^a-z0-9-]/gi, "");
  return pathname.match(new RegExp("^/" + safeRoute + "/([a-z0-9-]{3,64})/?$", "i"))?.[1]?.toLowerCase() ?? null;
}

export interface RealtimeSessionClientOptions {
  sessionId: string;
  participantId: string;
  hostCredential?: string;
  websocketPath?: string;
  queryNames?: { session: string; participant: string };
  hostAuthMessage?: (credential: string) => unknown;
  activityMessage?: () => unknown;
  activityThrottleMs?: number;
  onMessage?: (message: unknown, controls: { send(message: unknown): void; stopReconnect(): void }) => void;
  onConnectionState?: (state: string, text: string) => void;
  shouldReconnectAfterClose?: (event: CloseEvent) => boolean;
}

export function createRealtimeSessionClient(options: RealtimeSessionClientOptions) {
  const {
    sessionId,
    participantId,
    hostCredential,
    websocketPath = "/ws",
    queryNames = { session: "room", participant: "voterId" },
    hostAuthMessage = (credential) => ({ type: "host_auth", token: credential }),
    activityMessage = () => ({ type: "activity" }),
    activityThrottleMs = 3000,
    onMessage = () => {},
    onConnectionState = () => {},
    shouldReconnectAfterClose = () => true
  } = options;
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectDelay = DEFAULT_RECONNECT_DELAY;
  let reconnectEnabled = true;
  let lastActivitySentAt = 0;
  let activityTracking = false;

  function send(message: unknown) {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  }

  function stopActivityTracking() {
    if (!activityTracking || typeof document === "undefined") return;
    activityTracking = false;
    for (const eventName of ["pointermove", "pointerdown", "keydown", "input", "touchstart"]) {
      document.removeEventListener(eventName, reportActivity);
    }
  }

  function stopReconnect() {
    reconnectEnabled = false;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    stopActivityTracking();
  }

  function reportActivity() {
    const now = Date.now();
    if (now - lastActivitySentAt < activityThrottleMs) return;
    lastActivitySentAt = now;
    send(activityMessage());
  }

  function startActivityTracking() {
    if (activityTracking || typeof document === "undefined") return;
    activityTracking = true;
    for (const eventName of ["pointermove", "pointerdown", "keydown", "input", "touchstart"]) {
      document.addEventListener(eventName, reportActivity, { passive: true });
    }
  }

  function connect() {
    onConnectionState("is-connecting", "Connecting…");
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const params = new URLSearchParams({
      [queryNames.session]: sessionId,
      [queryNames.participant]: participantId
    });
    socket = new WebSocket(protocol + "//" + location.host + websocketPath + "?" + params);

    socket.addEventListener("open", () => {
      reconnectDelay = DEFAULT_RECONNECT_DELAY;
      onConnectionState("is-live", "Live");
      if (hostCredential) send(hostAuthMessage(hostCredential));
      startActivityTracking();
    });

    socket.addEventListener("message", (event) => {
      let message: unknown;
      try { message = JSON.parse(String(event.data)); } catch { return; }
      onMessage(message, { send, stopReconnect });
    });

    socket.addEventListener("close", (event) => {
      if (!reconnectEnabled || !shouldReconnectAfterClose(event)) return;
      onConnectionState("is-offline", "Reconnecting…");
      reconnectTimer = setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 1.7, MAX_RECONNECT_DELAY);
    });

    socket.addEventListener("error", () => socket?.close());
  }

  return { connect, send, reportActivity, stopActivityTracking, stopReconnect, get socket() { return socket; } };
}
