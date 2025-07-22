"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Plus, Search, Trash2 } from "lucide-react"

interface Memo {
  id: string
  title: string
  content: string
  favorite: boolean
  createdAt: Date
  updatedAt: Date
}

export default function MemoApp() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isSummarizingAll, setIsSummarizingAll] = useState(false)

  // ローカルストレージからメモを読み込み
  useEffect(() => {
    const savedMemos = localStorage.getItem("memos")
    if (savedMemos) {
      const parsedMemos = JSON.parse(savedMemos).map((memo: any) => ({
        ...memo,
        createdAt: new Date(memo.createdAt),
        updatedAt: new Date(memo.updatedAt),
      }))
      setMemos(parsedMemos)
    }
  }, [])

  // メモをローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("memos", JSON.stringify(memos))
  }, [memos])

  // AIで要約
  const handleSummarize = async () => {
    if (!newContent.trim()) {
      return
    }
    setIsSummarizing(true)
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newContent }),
      })

      if (!response.ok) {
        throw new Error("要約に失敗しました。")
      }

      const data = await response.json()
      setNewContent(data.summary)
    } catch (error) {
      console.error(error)
      // ここでユーザーにエラーを通知することもできます（例: SonnerやToastを使用）
    } finally {
      setIsSummarizing(false)
    }
  }

  // すべてのメモを要約
  const handleSummarizeAll = async () => {
    const allText = memos
      .map((memo) => `${memo.title}\n${memo.content}`)
      .join("\n\n---\n\n")
    if (!allText.trim()) {
      alert("要約するメモがありません。")
      return
    }
    setIsSummarizingAll(true)
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: allText }),
      })

      if (!response.ok) {
        throw new Error("要約に失敗しました。")
      }

      const data = await response.json()
      alert(`すべてのメモの要約:\n\n${data.summary}`)
    } catch (error) {
      console.error(error)
      alert("エラーが発生しました。詳細はコンソールを確認してください。")
    } finally {
      setIsSummarizingAll(false)
    }
  }

  // 新しいメモを追加
  const addMemo = () => {
    if (newTitle.trim() || newContent.trim()) {
      const newMemo: Memo = {
        id: Date.now().toString(),
        title: newTitle.trim() || "無題のメモ",
        content: newContent.trim(),
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setMemos((prev) => [newMemo, ...prev])
      setNewTitle("")
      setNewContent("")
    }
  }

  // メモを削除
  const deleteMemo = (id: string) => {
    setMemos((prev) => prev.filter((memo) => memo.id !== id))
  }

  // お気に入りの切り替え
  const toggleFavorite = (id: string) => {
    setMemos((prev) =>
      prev.map((memo) => (memo.id === id ? { ...memo, favorite: !memo.favorite, updatedAt: new Date() } : memo)),
    )
  }

  // メモをフィルタリング
  const filteredMemos = memos.filter((memo) => {
    const matchesSearch =
      memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memo.content.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "favorites") {
      return matchesSearch && memo.favorite
    }
    return matchesSearch
  })

  // メモをソート（お気に入りを上に、その後は更新日時順）
  const sortedMemos = filteredMemos.sort((a, b) => {
    if (a.favorite && !b.favorite) return -1
    if (!a.favorite && b.favorite) return 1
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  const favoriteCount = memos.filter((memo) => memo.favorite).length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Memo</h1>
          <p className="text-gray-600">お気に入り機能付きのシンプルなメモアプリ</p>
        </div>

        {/* 新しいメモの作成 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              新しいメモを作成
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="メモのタイトル" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Textarea
              placeholder="メモの内容を入力してください..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleSummarize}
              disabled={isSummarizing || !newContent.trim()}
              variant="outline"
              className="w-full"
            >
              {isSummarizing ? "要約中です..." : "✨ AIで内容を要約する"}
            </Button>
            <Button onClick={addMemo} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              メモを追加
            </Button>
          </CardContent>
        </Card>

        {/* 検索とフィルター */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="メモを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            onClick={handleSummarizeAll}
            disabled={isSummarizingAll || memos.length === 0}
            variant="secondary"
            className="w-full"
          >
            {isSummarizingAll ? "要約中です..." : `📚 すべてのメモ (${memos.length}件) を要約する`}
          </Button>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">すべて ({memos.length})</TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="w-4 h-4 mr-1" />
                お気に入り ({favoriteCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* メモ一覧 */}
        <div className="space-y-4">
          {sortedMemos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-2">{activeTab === "favorites" ? "⭐" : "📝"}</div>
                <p className="text-gray-500">
                  {activeTab === "favorites"
                    ? "お気に入りのメモがありません"
                    : searchQuery
                      ? "検索結果が見つかりません"
                      : "メモがありません。最初のメモを作成してみましょう！"}
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedMemos.map((memo) => (
              <Card key={memo.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {memo.title}
                        {memo.favorite && (
                          <Badge variant="secondary" className="text-yellow-600">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            お気に入り
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        作成: {memo.createdAt.toLocaleDateString("ja-JP")}{" "}
                        {memo.createdAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                        {memo.updatedAt.getTime() !== memo.createdAt.getTime() && (
                          <span className="ml-2">
                            更新: {memo.updatedAt.toLocaleDateString("ja-JP")}{" "}
                            {memo.updatedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(memo.id)}
                        className={
                          memo.favorite
                            ? "text-yellow-600 hover:text-yellow-700"
                            : "text-gray-400 hover:text-yellow-600"
                        }
                      >
                        <Star className={`w-4 h-4 ${memo.favorite ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMemo(memo.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{memo.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
