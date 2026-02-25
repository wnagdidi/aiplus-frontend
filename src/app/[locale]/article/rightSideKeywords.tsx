'use client'
import React from 'react'

export default function RightSideKeywords({ title = 'Hot Keywords', keywords = [] as string[] }) {
  // 将关键词分为两列
  const midPoint = Math.ceil(keywords?.length / 2) || 0
  const leftColumn = keywords?.slice(0, midPoint) || []
  const rightColumn = keywords?.slice(midPoint) || []

  return (
    <div className="right-card">
      <h3 className="right-card__title">{title}</h3>
      <div className="right-card__keywords">
        <div className="right-card__keywords-column">
          {leftColumn.map((kw, idx) => (
            <span key={idx} className="right-card__keyword">
              {kw.word_name}
            </span>
          ))}
        </div>
        <div className="right-card__keywords-column">
          {rightColumn.map((kw, idx) => (
            <span key={idx} className="right-card__keyword">
              {kw.word_name}
            </span>
          ))}
        </div>
        {!keywords?.length && <span className="right-card__empty">No keywords</span>}
      </div>
    </div>
  )
}


