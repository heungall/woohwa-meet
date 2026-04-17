import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'

export function GuideTab() {
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminApi
      .getGuideContent()
      .then((res) => setContent(res.content))
      .catch(() => setContent(''))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-woohwa-green/30 border-t-woohwa-green rounded-full animate-spin" />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-6xl mb-4">🦋</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">길안내 준비 중</h2>
        <p className="text-base text-gray-500">
          명지전문대 연구동 2층 상담실 안내를
          <br />
          곧 제공할 예정입니다.
        </p>
      </div>
    )
  }

  return (
    <div className="prose prose-lg max-w-none">
      <div
        className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
