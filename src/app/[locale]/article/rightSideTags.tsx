'use client'
import React from 'react'
import { Chip } from '@heroui/react'

export default function RightSideTags({ title = 'Popular Tags', tags = [] as string[] }) {
  return (
    <div className="right-card">
      <h3 className="right-card__title">{title}</h3>
      <div className="right-card__tags flex flex-wrap gap-2">
        {tags?.map((tag, idx) => (
          <Chip key={idx} size="sm" className="right-card__tag">{tag.word_name}</Chip>
        ))}
        {!tags?.length && <span className="right-card__empty">No tags</span>}
      </div>
    </div>
  )
}


