import { describe, expect, it } from 'vitest'
import { assemblePrompt } from './prompt'
import { seedState } from './seed'

describe('assemblePrompt', () => {
  it('keeps the five sections in team order', () => {
    const text = assemblePrompt(seedState.packets[1])
    const labels = ['目标：', '约束：', '上下文：', '输出：', '质量要求：', '验收：']
    const indexes = labels.map((label) => text.indexOf(label))
    expect(indexes.every((index) => index >= 0)).toBe(true)
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes)
  })

  it('numbers acceptance lines and ignores blanks', () => {
    const text = assemblePrompt({
      ...seedState.packets[0],
      acceptance: ['能打开', '  ', '能复制'],
    })
    expect(text).toContain('1. 能打开')
    expect(text).toContain('2. 能复制')
    expect(text).not.toContain('3.')
  })
})
