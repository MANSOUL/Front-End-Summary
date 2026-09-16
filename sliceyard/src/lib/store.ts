import { seedState } from './seed'
import type { BoardState, Owner, Packet, Status } from './types'

export const STORAGE_KEY = 'sliceyard.board.v1'

export interface MemoryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function now() {
  return new Date().toISOString()
}

function clone(state: BoardState): BoardState {
  return structuredClone(state)
}

function readStorage(storage: MemoryStorage): BoardState {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return clone(seedState)
  try {
    const parsed = JSON.parse(raw) as BoardState
    if (!Array.isArray(parsed.packets) || typeof parsed.nextSeq !== 'number') {
      return clone(seedState)
    }
    return parsed
  } catch {
    return clone(seedState)
  }
}

export function createBoard(storage: MemoryStorage) {
  let state = readStorage(storage)
  const listeners = new Set<() => void>()

  function persist() {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    listeners.forEach((fn) => fn())
  }

  function getState() {
    return state
  }

  function subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  function createPacket(owner: Owner): Packet {
    const seq = state.nextSeq
    const packet: Packet = {
      id: `pk-${seq}`,
      code: `PK-${seq}`,
      title: '未命名切片',
      owner,
      status: 'queued',
      goal: '',
      constraints: 'Vite + React + TypeScript。一次只做这一张工单。禁止无关重构。',
      context: '先读 AGENTS.md 和 BRIEF.md，再读相关源码。',
      output: '',
      quality: '类型完整。主路径能点。补上失败态。',
      acceptance: ['主路径能亲手点一遍', '没有范围外改动'],
      updatedAt: now(),
    }
    state = {
      nextSeq: seq + 1,
      packets: [packet, ...state.packets],
    }
    persist()
    return packet
  }

  function updatePacket(id: string, patch: Partial<Omit<Packet, 'id' | 'code'>>) {
    state = {
      ...state,
      packets: state.packets.map((packet) =>
        packet.id === id ? { ...packet, ...patch, updatedAt: now() } : packet,
      ),
    }
    persist()
  }

  function setStatus(id: string, status: Status) {
    updatePacket(id, { status })
  }

  function removePacket(id: string) {
    state = {
      ...state,
      packets: state.packets.filter((packet) => packet.id !== id),
    }
    persist()
  }

  return {
    getState,
    subscribe,
    createPacket,
    updatePacket,
    setStatus,
    removePacket,
  }
}

function browserStorage(): MemoryStorage {
  if (typeof localStorage === 'undefined') {
    const memory = new Map<string, string>()
    return {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value)
      },
    }
  }
  return localStorage
}

export const board = createBoard(browserStorage())
