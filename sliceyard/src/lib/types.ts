export type Owner = '林可' | '周南' | '许澄'
export type Status = 'queued' | 'doing' | 'review' | 'done'
export type OwnerFilter = Owner | 'all'
export type StatusFilter = Status | 'all'

export interface Packet {
  id: string
  code: string
  title: string
  owner: Owner
  status: Status
  goal: string
  constraints: string
  context: string
  output: string
  quality: string
  acceptance: string[]
  updatedAt: string
}

export interface BoardState {
  packets: Packet[]
  nextSeq: number
}

export const OWNERS: Owner[] = ['林可', '周南', '许澄']

export const STATUS_LABEL: Record<Status, string> = {
  queued: '排队',
  doing: '进行',
  review: '待审',
  done: '已合',
}

export const WORK_STEPS = [
  { n: '01', owner: '全员', text: '接到需求：演示三人团队怎么用 AI 做新项目，不要空讲。' },
  { n: '02', owner: '林可', text: '人定产品：不做看板，做可复制给 AI 的派工单。' },
  { n: '03', owner: '林可', text: '冻结 BRIEF.md：用户、成功标准、明确不做、技术约束。' },
  { n: '04', owner: '林可', text: '写下 AGENTS.md，全队的 AI 读同一套约定。' },
  { n: '05', owner: '全员', text: '切三刀并分人：壳和简报 / 工单主路径 / 测试与门禁。' },
  { n: '06', owner: '林可', text: '搭 Vite 应用、顶栏、简报带、开发记录。' },
  { n: '07', owner: '周南', text: '工单列表、编辑面板、状态切换、复制提示词。' },
  { n: '08', owner: '许澄', text: 'localStorage、单测、待审清单。' },
  { n: '09', owner: '许澄', text: '人做门禁：跑测试，点一遍创建、复制、刷新。' },
] as const
