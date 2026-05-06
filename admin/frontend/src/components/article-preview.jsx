import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ArticlePreview({ article, onClose }) {
  if (!article) return null
  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return (
    <Card className="shadow-none border">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>{"Vista previa"}</CardTitle>
          {onClose && (
            <button className="text-sm px-3 py-1 rounded" onClick={onClose}>{"public_articles.close', 'Close"}</button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
        {article.slug && (
          <p className="text-sm text-muted-foreground mb-2">/{article.slug}</p>
        )}
        {article.cover_url && (
          <div className="px-4 py-2 mb-3">
            <img src={article.cover_url} alt={article.title} className="w-full h-48 object-cover rounded" />
          </div>
        )}
        {/* Description spacing around content */}
        {article.category?.name && (
          <Badge className="mb-2" variant="outline">{article.category.name}</Badge>
        )}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
            ))}
          </div>
        )}
        <div className="mt-4 mb-6 prose" dangerouslySetInnerHTML={{ __html: article.content }} />
        {article.gallery && article.gallery.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {article.gallery.map((img) => (
              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                <img src={img.url} alt="" className="w-full h-32 object-cover rounded" />
              </a>
            ))}
          </div>
        )}
        {article.author && article.putblished_at && (
          <div className="mt-2 text-sm text-muted-foreground">
            {article.author.name} • {formatDate(article.putblished_at)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
