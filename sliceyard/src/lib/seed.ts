import type { BoardState } from './types'

const t0 = '2026-09-14T12:00:00.000Z'

export const seedState: BoardState = {
  nextSeq: 104,
  packets: [
    {
      id: 'pk-101',
      code: 'PK-101',
      title: '冻结需求、约定和壳',
      owner: '林可',
      status: 'done',
      goal: '把「三人团队用 AI 做新项目」做成可打开的派工单应用骨架：简报、开发记录、空的工单台。',
      constraints: 'Vite + React + TypeScript。先做 Web。不要登录，不要云同步。视觉按 AGENTS.md，不另起一套样式。',
      context: '仓库里已有 BRIEF.md、AGENTS.md、WORKLOG.md。用户要看的是真实步骤，不是空讲工作流。',
      output: '可运行的页面：顶栏产品名、简报带、开发记录。工单区域先能挂上后续切片。',
      quality: '主路径一打开就能看到项目是什么。组件不直接碰 localStorage。',
      acceptance: [
        '打开应用能看到「派工单」和项目简报',
        '开发记录列出 9 步实际动作',
        '没有登录墙，没有空白欢迎页',
      ],
      updatedAt: t0,
    },
    {
      id: 'pk-102',
      code: 'PK-102',
      title: '工单主路径',
      owner: '周南',
      status: 'doing',
      goal: '让一张工单能被选中、编辑、改状态，并复制成给 AI 的五段提示词。',
      constraints: '提示词顺序必须是目标、约束、上下文、输出、质量要求，最后附验收。图标按钮必须有 tooltip。一次只改工单相关文件。',
      context: 'src/lib/prompt.ts 负责拼装。列表和面板在 src/components。种子数据就是这三张工单。',
      output: '工单列表 + 侧栏编辑面板 + 复制提示词。新建工单带空白五段。',
      quality: '空标题不允许复制。复制成功要有按钮态反馈。状态用分段控件，不用下拉菜单。',
      acceptance: [
        '点一张工单能改五段字段和验收',
        '复制出来的文本含五段标题',
        '能新建一张排队工单',
      ],
      updatedAt: t0,
    },
    {
      id: 'pk-103',
      code: 'PK-103',
      title: '持久化、测试、门禁',
      owner: '许澄',
      status: 'review',
      goal: '工单写入 localStorage，关键逻辑有单测，待审工单能作为合并门禁看。',
      constraints: '组件不直接读写 localStorage。测试跑在 node 环境，存储用内存假对象。不要为了测试改产品行为。',
      context: 'src/lib/store.ts 是唯一状态入口。门禁标准写在 AGENTS.md：主路径能点、npm test 通过、没有范围外改动。',
      output: 'store 的读写、prompt/store 单测、待审过滤。',
      quality: '刷新后三张工单还在。测试失败时不准把工单打成已合。',
      acceptance: [
        '刷新后工单仍在',
        'npm test 通过',
        '能把列表滤成只看待审',
      ],
      updatedAt: t0,
    },
  ],
}
