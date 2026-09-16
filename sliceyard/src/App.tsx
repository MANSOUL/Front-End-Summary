import { useMemo, useState } from 'react'
import { BriefBand } from './components/BriefBand'
import { Masthead } from './components/Masthead'
import { PacketList } from './components/PacketList'
import { PacketPanel } from './components/PacketPanel'
import { WorkLog } from './components/WorkLog'
import { board } from './lib/store'
import type { Owner, StatusFilter } from './lib/types'
import { useBoard } from './lib/useBoard'

export function App() {
  const { packets } = useBoard()
  const [duty, setDuty] = useState<Owner>('周南')
  const [mineOnly, setMineOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>('pk-102')

  const visible = useMemo(() => {
    return packets.filter((packet) => {
      if (mineOnly && packet.owner !== duty) return false
      if (statusFilter !== 'all' && packet.status !== statusFilter) return false
      return true
    })
  }, [packets, mineOnly, duty, statusFilter])

  const selected = packets.find((packet) => packet.id === selectedId) ?? null

  function create() {
    const packet = board.createPacket(duty)
    setSelectedId(packet.id)
  }

  return (
    <div className="app">
      <Masthead duty={duty} onDuty={setDuty} onCreate={create} />
      <BriefBand />
      <div className="subbar">
        <div className="seg" role="group" aria-label="范围">
          <button type="button" className={!mineOnly ? 'is-on' : ''} onClick={() => setMineOnly(false)}>
            全队
          </button>
          <button type="button" className={mineOnly ? 'is-on' : ''} onClick={() => setMineOnly(true)}>
            我的
          </button>
        </div>
        <span className="count">{visible.length} 张</span>
      </div>
      <div className="workspace">
        <WorkLog />
        <PacketList
          packets={visible}
          selectedId={selectedId}
          statusFilter={statusFilter}
          onFilter={setStatusFilter}
          onSelect={setSelectedId}
        />
      </div>
      {selected ? (
        <PacketPanel
          packet={selected}
          onClose={() => setSelectedId(null)}
          onDeleted={() => setSelectedId(visible.find((packet) => packet.id !== selected.id)?.id ?? null)}
        />
      ) : null}
    </div>
  )
}
