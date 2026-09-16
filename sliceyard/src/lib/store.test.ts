import { describe, expect, it } from 'vitest'
import { createBoard, STORAGE_KEY } from './store'

function memory() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    data,
  }
}

describe('board store', () => {
  it('seeds three packets when storage is empty', () => {
    const store = createBoard(memory())
    expect(store.getState().packets.map((packet) => packet.code)).toEqual([
      'PK-101',
      'PK-102',
      'PK-103',
    ])
  })

  it('creates a queued packet for the current owner and persists it', () => {
    const storage = memory()
    const store = createBoard(storage)
    const created = store.createPacket('周南')
    expect(created.owner).toBe('周南')
    expect(created.status).toBe('queued')
    expect(created.code).toBe('PK-104')

    const again = createBoard(storage)
    expect(again.getState().packets[0].code).toBe('PK-104')
    expect(storage.data.has(STORAGE_KEY)).toBe(true)
  })

  it('moves a packet to review without touching other fields', () => {
    const store = createBoard(memory())
    const before = store.getState().packets.find((packet) => packet.id === 'pk-102')
    store.setStatus('pk-102', 'review')
    const after = store.getState().packets.find((packet) => packet.id === 'pk-102')
    expect(after?.status).toBe('review')
    expect(after?.title).toBe(before?.title)
    expect(after?.goal).toBe(before?.goal)
  })
})
