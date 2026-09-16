import type { Packet, Status, StatusFilter } from '../lib/types'
import { STATUS_LABEL } from '../lib/types'

interface Props {
  packets: Packet[]
  selectedId: string | null
  statusFilter: StatusFilter
  onFilter: (filter: StatusFilter) => void
  onSelect: (id: string) => void
}

const FILTERS: StatusFilter[] = ['all', 'queued', 'doing', 'review', 'done']

function FilterLabel(filter: StatusFilter) {
  return filter === 'all' ? '全部' : STATUS_LABEL[filter]
}

export function PacketList({ packets, selectedId, statusFilter, onFilter, onSelect }: Props) {
  return (
    <section className="board">
      <div className="board-head">
        <h2>工单</h2>
        <div className="seg" role="group" aria-label="状态">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={statusFilter === filter ? 'is-on' : ''}
              onClick={() => onFilter(filter)}
            >
              {FilterLabel(filter)}
            </button>
          ))}
        </div>
      </div>
      <div className="rows" role="list">
        {packets.map((packet) => (
          <button
            key={packet.id}
            type="button"
            role="listitem"
            className={`ticket is-${packet.status} ${selectedId === packet.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(packet.id)}
          >
            <span className={`mark is-${packet.status}`}>{STATUS_LABEL[packet.status as Status]}</span>
            <span className="code">{packet.code}</span>
            <span className="title">{packet.title}</span>
            <span className="owner">{packet.owner}</span>
          </button>
        ))}
        {packets.length === 0 ? <p className="empty">没有匹配的工单</p> : null}
      </div>
    </section>
  )
}
