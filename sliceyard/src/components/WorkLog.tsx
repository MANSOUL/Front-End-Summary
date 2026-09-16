import { WORK_STEPS } from '../lib/types'

export function WorkLog() {
  return (
    <aside className="ledger">
      <h2>开发记录</h2>
      <ol>
        {WORK_STEPS.map((step) => (
          <li key={step.n}>
            <span className="n">{step.n}</span>
            <div>
              <b>{step.owner}</b>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  )
}
