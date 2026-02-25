'use client'
import { Accordion, AccordionItem } from '@heroui/react'

interface FAQ {
  id: number
  question: string
  answer: string
}

interface NewFaqsProps {
  faqs: FAQ[]
}

export default function NewFaqs({ faqs }: NewFaqsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Accordion variant="splitted" selectionMode="multiple">
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            aria-label={faq.question}
            title={faq.question}
            className="px-6"
          >
            <div className="text-gray-600 leading-relaxed">
              {faq.answer}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
