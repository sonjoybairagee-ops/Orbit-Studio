"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GuestRoom, HostRoom, NetPlayer, NetRole, randomName } from "@/lib/netroom";

export interface NetActionEvent {
  a: unknown;
  fromSeat: number;
}

export interface NetGameApi {
  role: NetRole;
  seat: number;                       // host = 0; guests 1..n
  code: string;                       // room code (host)
  players: NetPlayer[] | null;        // full seat list once connected
  status: string;                     // join errors / connection notes
  myName: string;
  isNet: boolean;                     // role !== "solo"
  isHost: boolean;

  hostStart: () => void;
  guestJoin: (code: string) => void;
  goSolo: () => void;

  broadcast: (s: unknown) => void;    // host → all guests: full state
  send: (a: unknown) => void;         // guest → host: action
  onAction: (fn: (a: unknown, fromSeat: number) => void) => void;
  remote: unknown;                    // guest: latest full-state snapshot from host
}

export function useNetGame(gameId: string, maxSeats: number): NetGameApi {
  const [role, setRole] = useState<NetRole>("solo");
  const [seat, setSeat] = useState(0);
  const [code, setCode] = useState("");
  const [players, setPlayers] = useState<NetPlayer[] | null>(null);
  const [status, setStatus] = useState("");
  const [remote, setRemote] = useState<unknown>(null);
  const [myName] = useState(() =>
    typeof window === "undefined" ? "You" : randomName()
  );

  const hostRef = useRef<HostRoom | null>(null);
  const guestRef = useRef<GuestRoom | null>(null);
  const actionFnRef = useRef<((a: unknown, fromSeat: number) => void) | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    return () => {
      hostRef.current?.destroy();
      guestRef.current?.destroy();
      hostRef.current = null;
      guestRef.current = null;
    };
  }, []);

  const hostStart = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    guestRef.current?.destroy();
    guestRef.current = null;
    setStatus("Creating room…");
    const host = new HostRoom(gameId, maxSeats, myName, {
      onPlayers: (p: NetPlayer[]) => setPlayers([...p]),
      onAction: (a: unknown, fromSeat: number) => actionFnRef.current?.(a, fromSeat),
      onStatus: (s: string) => s && setStatus(s),
      onRole: (r: NetRole, s: number) => {
        setRole(r);
        setSeat(s);
      },
    });
    hostRef.current = host;
    host
      .open()
      .then((c: string) => {
        setCode(c);
        setPlayers([...host.players]);
        setStatus("");
        busyRef.current = false;
      })
      .catch((e: unknown) => {
        setStatus(`Room creation failed: ${String(e).slice(0, 80)}`);
        host.destroy();
        hostRef.current = null;
        busyRef.current = false;
      });
  }, [gameId, maxSeats, myName]);

  const guestJoin = useCallback(
    (rawCode: string) => {
      if (busyRef.current) return;
      const clean = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-5);
      if (clean.length < 4) {
        setStatus("Enter a 5-character room code.");
        return;
      }
      busyRef.current = true;
      hostRef.current?.destroy();
      hostRef.current = null;
      setStatus("Connecting…");
      const guest = new GuestRoom(gameId, clean, myName, {
        onPlayers: (p: NetPlayer[]) => setPlayers([...p]),
        onState: (s: unknown) => setRemote(s),
        onStatus: (s: string) => s && setStatus(s),
        onRole: (r: NetRole, s: number) => {
          setRole(r);
          setSeat(s);
        },
      });
      guestRef.current = guest;
      guest
        .join()
        .then(() => {
          setCode(clean);
          setStatus("");
          busyRef.current = false;
        })
        .catch((e: unknown) => {
          setStatus(`${String(e).replace(/^.*Error: /, "").slice(0, 90)}`);
          guest.destroy();
          guestRef.current = null;
          busyRef.current = false;
        });
    },
    [gameId, myName]
  );

  const goSolo = useCallback(() => {
    hostRef.current?.destroy();
    guestRef.current?.destroy();
    hostRef.current = null;
    guestRef.current = null;
    setRole("solo");
    setSeat(0);
    setCode("");
    setPlayers(null);
    setStatus("");
    setRemote(null);
    busyRef.current = false;
  }, []);

  const broadcast = useCallback((s: unknown) => {
    hostRef.current?.broadcast(s);
  }, []);

  const send = useCallback((a: unknown) => {
    guestRef.current?.send(a);
  }, []);

  const onAction = useCallback((fn: (a: unknown, fromSeat: number) => void) => {
    actionFnRef.current = fn;
  }, []);

  return {
    role,
    seat,
    code,
    players,
    status,
    myName,
    isNet: role !== "solo",
    isHost: role === "host",
    hostStart,
    guestJoin,
    goSolo,
    broadcast,
    send,
    onAction,
    remote,
  };
}
