import { Copy, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { assemblePrompt } from '../lib/prompt'
import { board } from '../lib/store'
import type { Packet, Status } from '../lib/types'
import { OWNERS, STATUS_LABEL } from '../lib/types'

interface Props {
  packet: Packet
  onClose: () => void
  onDeleted: () => void
}

const STATUSES: Status[] = ['queued', 'doing', 'review', 'done']

export function PacketPanel({ packet, onClose, onDeleted }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCopied(false)
  }, [packet.id])

  function patch<K extends keyof Packet>(key: K, value: Packet[K]) {
    board.updatePacket(packet.id, { [key]: value } as Partial<Packet>)
  }

  async function copyPrompt() {
    if (!packet.title.trim() || packet.title === '未命名切片') return
    await navigator.clipboard.writeText(assemblePrompt(packet))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const copyDisabled = !packet.title.trim() || packet.title === '未命名切片'

  return (
    <aside className="panel" aria-label={packet.code}>
      <header className="panel-head">
        <div>
          <span className="code">{packet.code}</span>
          <input
            className="title-input"
            value={packet.title}
            onChange={(event) => patch('title', event.target.value)}
          />
        </div>
        <div className="panel-actions">
          <button
            type="button"
            className="icon-btn"
            title={copied ? '已复制' : '复制提示词'}
            onClick={copyPrompt}
            disabled={copyDisabled}
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            title="删除工单"
            onClick={() => {
              board.removePacket(packet.id)
              onDeleted()
            }}
          >
            <Trash2 size={16} />
          </button>
          <button type="button" className="icon-btn" title="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="seg" role="group" aria-label="状态">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={packet.status === status ? 'is-on' : ''}
            onClick={() => board.setStatus(packet.id, status)}
          >
            {STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      <div className="field">
        <span>负责人</span>
        <div className="seg" role="group" aria-label="负责人">
          {OWNERS.map((owner) => (
            <button
              key={owner}
              type="button"
              className={packet.owner === owner ? 'is-on' : ''}
              onClick={() => patch('owner', owner)}
            >
              {owner}
            </button>
          ))}
        </div>
      </div>
      <label>
        目标
        <textarea value={packet.goal} onChange={(event) => patch('goal', event.target.value)} rows={3} />
      </label>
      <label>
        约束
        <textarea value={packet.constraints} onChange={(event) => patch('constraints', event.target.value)} rows={3} />
      </label>
      <label>
        上下文
        <textarea value={packet.context} onChange={(event) => patch('context', event.target.value)} rows={3} />
      </label>
      <label>
        输出
        <textarea value={packet.output} onChange={(event) => patch('output', event.target.value)} rows={2} />
      </label>
      <label>
        质量要求
        <textarea value={packet.quality} onChange={(event) => patch('quality', event.target.value)} rows={2} />
      </label>
      <label>
        验收
        <textarea
          value={packet.acceptance.join('\n')}
          onChange={(event) =>
            patch(
              'acceptance',
              event.target.value.split('\n'),
            )
          }
          rows={4}
        />
      </label>
    </aside>
  )
}
