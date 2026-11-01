/* ────────────────────────────────────────────────────────────────────────────
   CompX Orbit — P2P game networking (PeerJS / WebRTC)
   Host-authority model:
   • Host creates a room → its broker peer ID is "cx-<gameId>-<CODE>".
   • Guests join by code. Seats fill in order (seat 0 = host). Empty seats
     stay AI-controlled on the host's device.
   • Host broadcasts the FULL serialized game state after every change.
   • Guests send small "action" messages; the host applies them through the
     game's normal engine and re-broadcasts state.
   • Real-time Lobby support: Ready/Not Ready, Color/Team, Kick, and Start Game.
──────────────────────────────────────────────────────────────────────────── */

export type NetMsg =
  | { t: "hello"; name: string }
  | { t: "seats"; players: NetPlayer[]; youSeat: number }
  | { t: "state"; s: unknown }
  | { t: "action"; a: unknown }
  | { t: "ready"; ready: boolean }
  | { t: "color"; color: string }
  | { t: "kick"; seat: number }
  | { t: "start" }
  | { t: "chat"; m: string };

export interface NetPlayer {
  seat: number;
  name: string;
  kind: "host" | "guest" | "bot";
  ready?: boolean;
  color?: string;
  team?: string;
}

export type NetRole = "solo" | "host" | "guest";

export interface RoomEvents {
  onPlayers?: (players: NetPlayer[]) => void;
  onState?: (s: unknown) => void;
  onAction?: (a: unknown, fromSeat: number) => void;
  onStatus?: (s: string) => void;
  onRole?: (role: NetRole, seat: number) => void;
  onGameStart?: () => void;
}

const NAME_WORDS = ["Valor", "Comet", "Neon", "Titan", "Echo", "Blitz", "Onyx", "Zephyr", "Pulsar", "Vertex", "Nova", "Drift"];
const NAME_ROLE = ["Ace", "Pro", "Star", "Kid", "King", "Queen", "Ranger", "Byte"];

export function randomName(): string {
  return `${NAME_WORDS[Math.floor(Math.random() * NAME_WORDS.length)]} ${NAME_ROLE[Math.floor(Math.random() * NAME_ROLE.length)]}`;
}

export function makeRoomCode(gameId: string): { code: string; peerId: string } {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += abc[Math.floor(Math.random() * abc.length)];
  return { code, peerId: `cx-${gameId}-${code}` };
}

export function sanitizePeerId(gameId: string, code: string): string {
  const safe = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `cx-${gameId}-${safe}`;
}

/* ── Host side ────────────────────────────────────────────────────────────── */

export class HostRoom {
  private peer: import("peerjs").Peer | null = null;
  private conns: import("peerjs").DataConnection[] = [];
  private names: string[] = [];
  private readyMap: Record<number, boolean> = { 0: true };
  private colorMap: Record<number, string> = { 0: "red", 1: "green", 2: "yellow", 3: "blue" };
  private maxSeats: number;
  private myName: string;
  private ev: RoomEvents;
  private destroyed = false;

  code = "";
  players: NetPlayer[] = [];
  private lastState: unknown = null;

  constructor(private gameId: string, maxSeats: number, myName: string, ev: RoomEvents) {
    this.gameId = gameId;
    this.maxSeats = maxSeats;
    this.myName = myName;
    this.ev = ev;
  }

  async open(): Promise<string> {
    const { Peer } = await import("peerjs");
    const { code, peerId } = makeRoomCode(this.gameId);
    this.code = code;
    const peer = new Peer(peerId);
    this.peer = peer;

    await new Promise<void>((res, rej) => {
      const ok = () => {
        peer.on("connection", (c) => this.onConn(c));
        res();
      };
      peer.on("open", ok);
      peer.on("error", (e) => rej(e));
      setTimeout(() => (peer.id ? res() : rej(new Error("Peer broker timeout"))), 8000);
    });

    this.rebuildSeats();
    this.ev.onRole?.("host", 0);
    return this.code;
  }

  private onConn(c: import("peerjs").DataConnection) {
    this.conns.push(c);
    c.on("data", (raw) => {
      const m = raw as NetMsg;
      const seat = this.conns.indexOf(c) + 1;
      if (m.t === "hello") {
        this.names[seat - 1] = m.name || `Player ${seat + 1}`;
        this.readyMap[seat] = false;
        this.rebuildSeats();
        this.ev.onStatus?.(`${m.name || "A player"} joined the room!`);
        if (this.lastState) safeSend(c, { t: "state", s: this.lastState });
      } else if (m.t === "action") {
        if (seat > 0 && seat < this.maxSeats) this.ev.onAction?.(m.a, seat);
      } else if (m.t === "ready") {
        this.readyMap[seat] = m.ready;
        this.rebuildSeats();
      } else if (m.t === "color") {
        this.colorMap[seat] = m.color;
        this.rebuildSeats();
      }
    });
    c.on("close", () => {
      const i = this.conns.indexOf(c);
      if (i >= 0) {
        this.conns.splice(i, 1);
        this.names.splice(i, 1);
        delete this.readyMap[i + 1];
        this.rebuildSeats();
        this.ev.onStatus?.(`A player left.`);
      }
    });

    setTimeout(() => {
      const idx = this.conns.indexOf(c);
      if (idx >= 0) {
        safeSend(c, {
          t: "seats",
          players: this.players,
          youSeat: idx + 1,
        });
      }
    }, 400);
  }

  kickPlayer(seat: number) {
    if (seat <= 0 || seat > this.conns.length) return;
    const c = this.conns[seat - 1];
    if (c) {
      safeSend(c, { t: "chat", m: "You were kicked from the lobby by the host." });
      try { c.close(); } catch {}
      this.conns.splice(seat - 1, 1);
      this.names.splice(seat - 1, 1);
      delete this.readyMap[seat];
      this.rebuildSeats();
      this.ev.onStatus?.(`Player in seat ${seat + 1} was kicked.`);
    }
  }

  setReady(ready: boolean, seat: number = 0) {
    this.readyMap[seat] = ready;
    this.rebuildSeats();
  }

  setColor(color: string, seat: number = 0) {
    this.colorMap[seat] = color;
    this.rebuildSeats();
  }

  startGame() {
    for (const c of this.conns) safeSend(c, { t: "start" });
    this.ev.onGameStart?.();
  }

  private rebuildSeats() {
    const defaultColors = ["red", "green", "yellow", "blue", "purple", "cyan"];
    const players: NetPlayer[] = [
      {
        seat: 0,
        name: this.myName,
        kind: "host",
        ready: this.readyMap[0] ?? true,
        color: this.colorMap[0] || defaultColors[0],
      },
    ];
    for (let i = 0; i < this.conns.length && players.length < this.maxSeats; i++) {
      const s = players.length;
      players.push({
        seat: s,
        name: this.names[i] || `Guest ${s + 1}`,
        kind: "guest",
        ready: this.readyMap[s] ?? false,
        color: this.colorMap[s] || defaultColors[s % defaultColors.length],
      });
    }
    for (let s = players.length; s < this.maxSeats; s++) {
      players.push({
        seat: s,
        name: `AI Bot ${s + 1}`,
        kind: "bot",
        ready: true,
        color: this.colorMap[s] || defaultColors[s % defaultColors.length],
      });
    }
    this.players = players;
    this.ev.onPlayers?.(players);

    this.conns.forEach((c, i) => {
      const seat = i + 1;
      if (seat < this.maxSeats) {
        safeSend(c, { t: "seats", players: this.players, youSeat: seat });
      }
    });
  }

  broadcast(s: unknown) {
    this.lastState = s;
    for (const c of this.conns) safeSend(c, { t: "state", s });
  }

  closed() {
    return this.destroyed;
  }

  destroy() {
    this.destroyed = true;
    for (const c of this.conns) {
      try { c.close(); } catch {}
    }
    try { this.peer?.destroy(); } catch {}
    this.conns = [];
    this.peer = null;
  }
}

/* ── Guest side ───────────────────────────────────────────────────────────── */

export class GuestRoom {
  private peer: import("peerjs").Peer | null = null;
  private conn: import("peerjs").DataConnection | null = null;
  private ev: RoomEvents;
  private destroyed = false;

  constructor(private gameId: string, private code: string, private myName: string, ev: RoomEvents) {
    this.ev = ev;
  }

  async join(): Promise<void> {
    const { Peer } = await import("peerjs");
    const peer = new Peer();
    this.peer = peer;
    const peerId = sanitizePeerId(this.gameId, this.code);

    await new Promise<void>((res, rej) => {
      peer.on("open", () => res());
      peer.on("error", (e) => rej(e));
      setTimeout(() => (peer.id ? res() : rej(new Error("Peer broker timeout"))), 8000);
    });

    const conn = peer.connect(peerId, { reliable: true });
    this.conn = conn;

    await new Promise<void>((res, rej) => {
      conn.on("open", () => res());
      conn.on("error", (e) => rej(e));
      setTimeout(() => rej(new Error("Room not found — check the code")), 10000);
    });

    safeSend(conn, { t: "hello", name: this.myName });
    conn.on("data", (raw) => {
      const m = raw as NetMsg;
      if (m.t === "state") this.ev.onState?.(m.s);
      else if (m.t === "seats") {
        this.ev.onPlayers?.(m.players);
        this.ev.onRole?.("guest", m.youSeat);
      } else if (m.t === "start") {
        this.ev.onGameStart?.();
      } else if (m.t === "chat") {
        this.ev.onStatus?.(m.m);
      }
    });
    conn.on("close", () => this.ev.onStatus?.("Disconnected from host."));
    this.ev.onStatus?.("");
  }

  send(a: unknown) {
    this.sendAction(a);
  }

  sendAction(a: unknown) {
    if (this.conn && this.conn.open) safeSend(this.conn, { t: "action", a });
  }

  setReady(ready: boolean) {
    if (this.conn && this.conn.open) safeSend(this.conn, { t: "ready", ready });
  }

  setColor(color: string) {
    if (this.conn && this.conn.open) safeSend(this.conn, { t: "color", color });
  }

  destroy() {
    this.destroyed = true;
    try { this.conn?.close(); } catch {}
    try { this.peer?.destroy(); } catch {}
    this.conn = null;
    this.peer = null;
  }
}

function safeSend(c: import("peerjs").DataConnection, m: NetMsg) {
  try {
    if (c.open) c.send(m);
  } catch {
    /* connection race — ignore */
  }
}
