"use server"

import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export async function summarizeMemo(content: string) {
  try {
    if (!content.trim()) {
      return {
        success: false,
        error: "メモの内容が空です",
      }
    }

    const { text } = await generateText({
      model: anthropic("claude-3-haiku-20240307"),
      prompt: `以下のメモの内容を日本語で簡潔に要約してください。重要なポイントを3つ以内にまとめてください：

${content}`,
    })

    return {
      success: true,
      summary: text,
    }
  } catch (error) {
    console.error("要約エラー:", error)
    return {
      success: false,
      error: "要約の生成に失敗しました",
    }
  }
}
