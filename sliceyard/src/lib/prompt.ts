import type { Packet } from './types'

export function assemblePrompt(packet: Packet): string {
  const acceptance = packet.acceptance
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n')

  return [
    `目标：${packet.goal.trim()}`,
    `约束：${packet.constraints.trim()}`,
    `上下文：${packet.context.trim()}`,
    `输出：${packet.output.trim()}`,
    `质量要求：${packet.quality.trim()}`,
    `验收：\n${acceptance}`,
  ].join('\n')
}
