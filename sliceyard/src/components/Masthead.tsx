import { Plus } from 'lucide-react'
import type { Owner } from '../lib/types'
import { OWNERS } from '../lib/types'

interface Props {
  duty: Owner
  onDuty: (owner: Owner) => void
  onCreate: () => void
}

export function Masthead({ duty, onDuty, onCreate }: Props) {
  return (
    <header className="masthead">
      <div className="brand">
        <span className="stub" aria-hidden="true">
          PK
        </span>
        <div>
          <h1>派工单</h1>
          <p>三人小团队的切片派活板</p>
        </div>
      </div>
      <div className="mast-tools">
        <div className="seg" role="group" aria-label="值班">
          {OWNERS.map((owner) => (
            <button
              key={owner}
              type="button"
              className={duty === owner ? 'is-on' : ''}
              onClick={() => onDuty(owner)}
            >
              {owner}
            </button>
          ))}
        </div>
        <button type="button" className="icon-btn solid" onClick={onCreate} title="新建工单">
          <Plus size={18} />
          <span>新建</span>
        </button>
      </div>
    </header>
  )
}
