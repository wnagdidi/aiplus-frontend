'use client'
import React from 'react'
import { Link } from '@heroui/react'

interface Item {
  name: string
  url_key?: string
}

export default function RightItem({ title, list = [], locale = 'en' }: { title: string; list?: Item[]; locale?: string }) {
  const getFullPath = (pathname?: string) => {
    const baseUrl = ''
    if (!pathname) return '#'
    return locale === 'en' ? baseUrl + `${pathname}` : baseUrl + `/${locale}${pathname.startsWith('/') ? pathname : '/' + pathname}`
  }

  return (
    <div className="right-card">
      <h3 className="right-card__title">{title}</h3>
      <div className="right-card__list flex flex-col gap-2.5">
        {list?.map((item, idx) => (
          <Link key={idx} href={getFullPath(`${item.url_key || ''}`)} className="right-card__link">
            <span className="right-card__dot">•</span>
            <span className="right-card__text">{item.name}</span>
          </Link>
        ))}
        {!list?.length && <span className="right-card__empty">No data</span>}
      </div>
    </div>
  )
}


