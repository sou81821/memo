"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, FileText, Copy, Check, Globe } from "lucide-react"
import { summarizeMemo } from "../actions/summarize"
import Image from "next/image"

export default function MemoSummarizer() {
  const [memo, setMemo] = useState("")
  const [summary, setSummary] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSummarize = () => {
    if (!memo.trim()) {
      setError("メモの内容を入力してください")
      return
    }

    setError("")
    setSummary("")

    startTransition(async () => {
      const result = await summarizeMemo(memo)

      if (result.success) {
        setSummary(result.summary || "")
      } else {
        setError(result.error || "要約の生成に失敗しました")
      }
    })
  }

  const handleCopy = async () => {
    if (summary) {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClear = () => {
    setMemo("")
    setSummary("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 世界地図ヘッダー */}
        <div className="relative w-full h-[200px] md:h-[300px] rounded-xl overflow-hidden shadow-lg mb-8 border border-purple-200 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
          <Image
            src="/images/world-map.png"
            alt="世界地図"
            fill
            priority
            className="object-cover"
            onError={(e) => {
              // フォールバック用のプレースホルダー画像
              e.currentTarget.src = "/placeholder.svg?height=300&width=800&text=World+Map"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-900/40 flex items-end p-6">
            <div className="flex items-center gap-3 text-white">
              <Globe className="w-8 h-8 drop-shadow-lg" />
              <div>
                <h2 className="text-2xl font-bold drop-shadow-lg">グローバルメモ要約</h2>
                <p className="text-purple-100 text-sm drop-shadow-md">世界中どこからでもアクセス可能</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <FileText className="w-8 h-8 text-purple-600" />
            Claude AI メモ要約
          </h1>
          <p className="text-gray-600">メモの内容を入力すると、Claude AIが自動的に要約を生成します</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* メモ入力エリア */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                メモ入力
              </CardTitle>
              <CardDescription>要約したいメモの内容を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memo">メモ内容</Label>
                <Textarea
                  id="memo"
                  placeholder="ここにメモの内容を入力してください..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="text-sm text-gray-500">{memo.length} 文字</div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSummarize}
                  disabled={isPending || !memo.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      要約中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Claude AIで要約
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={isPending}>
                  クリア
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 要約結果エリア */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Claude AI要約結果
              </CardTitle>
              <CardDescription>生成された要約が表示されます</CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                    <p className="text-sm text-gray-500">Claude AIが要約を生成中...</p>
                  </div>
                </div>
              ) : summary ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-sm text-purple-900 whitespace-pre-wrap">{summary}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="w-full bg-transparent border-purple-200 hover:bg-purple-50"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        要約をコピー
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="text-sm text-gray-500">メモを入力して「Claude AIで要約」ボタンを押してください</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 使用例 */}
        <Card>
          <CardHeader>
            <CardTitle>使用例</CardTitle>
            <CardDescription>以下のようなメモの要約に活用できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-sm mb-1">会議メモ</h4>
                <p className="text-xs text-gray-600">長い会議の内容を要点にまとめます</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-sm mb-1">学習ノート</h4>
                <p className="text-xs text-gray-600">勉強した内容の重要ポイントを抽出</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-sm mb-1">アイデアメモ</h4>
                <p className="text-xs text-gray-600">散らばったアイデアを整理して要約</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claude AI情報 */}
        <Card className="bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800">Claude AIについて</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800">
              このアプリケーションはAnthropicのClaude AIを使用しています。Claude AIは高度な言語理解と生成能力を持ち、
              自然な日本語での要約を提供します。Claude 3 Haikuモデルは効率的で高速な応答が特徴です。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
