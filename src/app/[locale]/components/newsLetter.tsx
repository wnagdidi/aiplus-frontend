'use client'
import { Button, Card, CardBody } from '@heroui/react'

interface NewsLetterProps {
  title: string
  subTitle: string
  buttonText: string
  buttonCallback?: () => void
}

export default function NewsLetter({ 
  title, 
  subTitle, 
  buttonText, 
  buttonCallback 
}: NewsLetterProps) {
  return (
    <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardBody className="p-8">
            <h2 className="text-3xl text-center md:text-4xl font-bold text-white mb-4">
              {title}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {subTitle}
            </p>
            <Button
              onClick={buttonCallback}
              className="bg-white text-blue-600 px-8 py-3 text-lg font-semibold hover:bg-gray-100 transition-colors"
              size="lg"
            >
              {buttonText}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
