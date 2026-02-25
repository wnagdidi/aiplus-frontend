'use client'

import { useState } from 'react'
import FeeLoveLayout from '@/components/layout/FeeLoveLayout'
import { Card, CardBody, Select, SelectItem } from '@heroui/react'

type FAQCategory = 'all' | 'getting-started' | 'credits-billing' | 'video-generation' | 'account-security' | 'downloads-usage'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: FAQCategory
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 'gs-1',
    question: 'How do I create my first video?',
    answer: 'To create your first video, simply upload an image, select your preferences, and click generate. Your video will be ready in a few minutes.',
    category: 'getting-started',
  },
  {
    id: 'gs-2',
    question: 'What image formats are supported?',
    answer: 'We support common image formats including JPG, PNG, and WebP. For best results, use high-quality images with good resolution.',
    category: 'getting-started',
  },
  {
    id: 'gs-3',
    question: 'How many free credits do I get?',
    answer: 'New users receive 1 free trial generation to get started. After that, you can choose from our subscription plans to continue creating videos.',
    category: 'getting-started',
  },
  // Credits & Billing
  {
    id: 'cb-1',
    question: 'How does the credit system work?',
    answer: 'Credits are used to generate videos. Each video generation consumes credits based on the quality and length of the video. Monthly credits reset at the beginning of each billing cycle.',
    category: 'credits-billing',
  },
  {
    id: 'cb-2',
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit cards and other payment methods through our secure payment processor. All payments are processed securely.',
    category: 'credits-billing',
  },
  {
    id: 'cb-3',
    question: 'Can I get a refund?',
    answer: 'Refund requests are handled on a case-by-case basis. Please contact our support team for assistance with refund requests.',
    category: 'credits-billing',
  },
  {
    id: 'cb-4',
    question: 'Do credits expire?',
    answer: 'Monthly credits reset at the beginning of each billing cycle. Unused credits do not roll over to the next billing period.',
    category: 'credits-billing',
  },
  // Video Generation
  {
    id: 'vg-1',
    question: 'How long does video generation take?',
    answer: 'Video generation typically takes a few minutes, depending on the complexity and length of the video. You will be notified when your video is ready.',
    category: 'video-generation',
  },
  {
    id: 'vg-2',
    question: 'What video resolutions are available?',
    answer: 'We offer various video resolutions to suit your needs. Available options include standard and high-definition formats.',
    category: 'video-generation',
  },
  {
    id: 'vg-3',
    question: 'Can I customize the video style?',
    answer: 'Yes, you can customize various aspects of your video including style, duration, and other parameters during the generation process.',
    category: 'video-generation',
  },
  {
    id: 'vg-4',
    question: 'Why did my video generation fail?',
    answer: 'Video generation may fail due to various reasons such as image quality issues or system overload. Please try again or contact support if the problem persists.',
    category: 'video-generation',
  },
  // Account & Security
  {
    id: 'as-1',
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. You will receive an email with instructions to reset your password.',
    category: 'account-security',
  },
  {
    id: 'as-2',
    question: 'Can I change my email address?',
    answer: 'Yes, you can change your email address in the Account Settings section of your profile.',
    category: 'account-security',
  },
  {
    id: 'as-3',
    question: 'Is my data secure?',
    answer: 'Yes, we take data security seriously. All data is encrypted and stored securely. Please refer to our Privacy Policy for more details.',
    category: 'account-security',
  },
  {
    id: 'as-4',
    question: 'How do I delete my account?',
    answer: 'You can delete your account by contacting our support team. Please note that account deletion is permanent and cannot be undone.',
    category: 'account-security',
  },
  // Downloads & Usage
  {
    id: 'du-1',
    question: 'How do I download my videos?',
    answer: 'Once generation is complete, click the download button on your video. Videos are available for download for 30 days. You can also access all your videos from the Results tab.',
    category: 'downloads-usage',
  },
  {
    id: 'du-2',
    question: 'What video format do you provide?',
    answer: 'We provide videos in MP4 format, which is compatible with most devices and platforms.',
    category: 'downloads-usage',
  },
  {
    id: 'du-3',
    question: 'Can I use generated videos commercially?',
    answer: 'Yes, you can use generated videos for commercial purposes. Please refer to our Terms of Service for more details.',
    category: 'downloads-usage',
  },
  {
    id: 'du-4',
    question: 'How long are videos stored?',
    answer: 'Videos are stored for 30 days after generation. Make sure to download them before they expire.',
    category: 'downloads-usage',
  },
]

export default function FeeLoveSupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  })

  // Get categories to display
  const categoriesToShow: FAQCategory[] =
    selectedCategory === 'all'
      ? ['getting-started', 'credits-billing', 'video-generation', 'account-security', 'downloads-usage']
      : [selectedCategory]

  // Group FAQs by category
  const faqsByCategory = categoriesToShow.map((category) => {
    const faqs = faqData.filter((faq) => {
      const matchesCategory = faq.category === category
      const matchesSearch =
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    return { category, faqs }
  })

  // Category metadata
  const categoryMetadata = {
    'getting-started': {
      title: 'Getting Started',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 mr-2 text-pink-400"
        >
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
        </svg>
      ),
    },
    'credits-billing': {
      title: 'Credits & Billing',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 mr-2 text-pink-400"
        >
          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
          <line x1="2" x2="22" y1="10" y2="10"></line>
        </svg>
      ),
    },
    'video-generation': {
      title: 'Video Generation',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 mr-2 text-pink-400"
        >
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
        </svg>
      ),
    },
    'account-security': {
      title: 'Account & Security',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 mr-2 text-pink-400"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
        </svg>
      ),
    },
    'downloads-usage': {
      title: 'Downloads & Usage',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 mr-2 text-pink-400"
        >
          <path d="M12 15V3"></path>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <path d="m7 10 5 5 5-5"></path>
        </svg>
      ),
    },
  }

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  const handleCategoryChange = (category: FAQCategory) => {
    setSelectedCategory(category)
    setExpandedFAQ(null) // Reset expanded FAQ when changing category
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: '',
      message: '',
    })
    alert('Thank you for your message! We will get back to you soon.')
  }

  return (
    <FeeLoveLayout>
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="container mx-auto px-4 text-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                How can we{' '}
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  help you?
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Get instant answers to common questions or reach out to our support team for personalized assistance.
              </p>
              <div className="max-w-md mx-auto relative">
                <input
                  type="text"
                  className="flex w-full rounded-md border border-[#6a6a7a] bg-input/40 px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 pl-12 pr-4 h-12 text-lg"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-circle-question-mark absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Support Channels Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Get Support Your Way</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Email Support */}
              <Card className="rounded-lg border bg-card text-card-foreground shadow-sm card-surface transition-all duration-300 h-full">
                <CardBody className="flex flex-col space-y-1.5 p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-md shadow-pink-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8 text-white"
                    >
                      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    </svg>
                  </div>
                  <h3 className="font-semibold tracking-tight text-white text-xl">Email Support</h3>
                  <p className="text-gray-400">Get detailed help via email</p>
                </CardBody>
                <div className="p-6 pt-0 text-center space-y-3">
                  <div className="text-pink-400 font-semibold">{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@feelove.app'}</div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Response:</span>
                    <span>24 hours</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Available:</span>
                    <span>24/7</span>
                  </div>
                </div>
              </Card>

              {/* Live Chat */}
              <Card className="rounded-lg border bg-card text-card-foreground shadow-sm card-surface transition-all duration-300 h-full">
                <CardBody className="flex flex-col space-y-1.5 p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 shadow-md shadow-pink-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8 text-white"
                    >
                      <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold tracking-tight text-white text-xl">Live Chat</h3>
                  <p className="text-gray-400">Instant help when you need it</p>
                </CardBody>
                <div className="p-6 pt-0 text-center space-y-3">
                  <div className="text-pink-400 font-semibold">Available in app</div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Response:</span>
                    <span>&lt; 5 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Available:</span>
                    <span>Mon-Fri 9AM-6PM PST</span>
                  </div>
                </div>
              </Card>

              {/* Community */}
              <Card className="rounded-lg border bg-card text-card-foreground shadow-sm card-surface transition-all duration-300 h-full">
                <CardBody className="flex flex-col space-y-1.5 p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-md shadow-pink-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8 text-white"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h3 className="font-semibold tracking-tight text-white text-xl">Community</h3>
                  <p className="text-gray-400">Connect with other creators</p>
                </CardBody>
                <div className="p-6 pt-0 text-center space-y-3">
                  <div className="text-pink-400 font-semibold">Discord Server</div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Response:</span>
                    <span>Immediate</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Available:</span>
                    <span>24/7</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                  selectedCategory === 'all'
                    ? 'bg-[#ec4899] hover:bg-[#ec4899]/90 btn-gradient text-white'
                    : 'bg-background hover:text-accent-foreground border border-pink-500/40 text-gray-300 hover:bg-pink-500/10'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => handleCategoryChange('getting-started')}
                className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                  selectedCategory === 'getting-started'
                    ? 'bg-[#ec4899] hover:bg-[#ec4899]/90 btn-gradient text-white'
                    : 'bg-background hover:text-accent-foreground border border-pink-500/40 text-gray-300 hover:bg-pink-500/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                </svg>
                Getting Started
              </button>
              <button
                onClick={() => handleCategoryChange('credits-billing')}
                className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                  selectedCategory === 'credits-billing'
                    ? 'bg-[#ec4899] hover:bg-[#ec4899]/90 btn-gradient text-white'
                    : 'bg-background hover:text-accent-foreground border border-pink-500/40 text-gray-300 hover:bg-pink-500/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
                Credits & Billing
              </button>
              <button
                onClick={() => handleCategoryChange('video-generation')}
                className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                  selectedCategory === 'video-generation'
                    ? 'bg-[#ec4899] hover:bg-[#ec4899]/90 btn-gradient text-white'
                    : 'bg-background hover:text-accent-foreground border border-pink-500/40 text-gray-300 hover:bg-pink-500/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
                Video Generation
              </button>
              <button
                onClick={() => handleCategoryChange('account-security')}
                className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                  selectedCategory === 'account-security'
                    ? 'bg-[#ec4899] hover:bg-[#ec4899]/90 btn-gradient text-white'
                    : 'bg-background hover:text-accent-foreground border border-pink-500/40 text-gray-300 hover:bg-pink-500/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                </svg>
                Account & Security
              </button>
              <button
                onClick={() => handleCategoryChange('downloads-usage')}
                className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                  selectedCategory === 'downloads-usage'
                    ? 'bg-[#ec4899] hover:bg-[#ec4899]/90 btn-gradient text-white'
                    : 'bg-background hover:text-accent-foreground border border-pink-500/40 text-gray-300 hover:bg-pink-500/10'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M12 15V3"></path>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <path d="m7 10 5 5 5-5"></path>
                </svg>
                Downloads & Usage
              </button>
            </div>

            <div className="space-y-6">
              {faqsByCategory.map(({ category, faqs }) => {
                if (faqs.length === 0) return null
                const metadata = categoryMetadata[category]
                return (
                  <div key={category}>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      {metadata.icon}
                      {metadata.title}
                    </h3>
                    {faqs.map((faq) => (
                      <Card
                        key={faq.id}
                        className="rounded-lg border bg-card text-card-foreground shadow-sm card-surface transition-all duration-300 mb-3"
                      >
                        <CardBody
                          className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => toggleFAQ(faq.id)}
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="text-white font-medium text-left">{faq.question}</h4>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`w-5 h-5 text-pink-400 flex-shrink-0 ml-4 transition-transform ${
                                expandedFAQ === faq.id ? 'rotate-180' : ''
                              }`}
                            >
                              {expandedFAQ === faq.id ? (
                                <path d="m18 15-6-6-6 6"></path>
                              ) : (
                                <path d="m6 9 6 6 6-6"></path>
                              )}
                            </svg>
                          </div>
                          {expandedFAQ === faq.id && (
                            <div className="pt-6">
                              <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )
              })}
              {faqsByCategory.every(({ faqs }) => faqs.length === 0) && (
                <div className="text-center text-gray-400 py-8">No FAQs found matching your search.</div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        {/* <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <Card className="rounded-lg border bg-card text-card-foreground shadow-sm card-surface">
              <CardBody className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold tracking-tight text-2xl text-white text-center">
                  Still need help?
                </h3>
                <p className="text-gray-300 text-center">
                  Send us a message and we'll get back to you as soon as possible.
                </p>
              </CardBody>
              <div className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-[#6a6a7a] bg-input/40 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-[#6a6a7a] bg-input/40 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-[#6a6a7a] bg-input/40 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Category</label>
                      <Select
                        placeholder="Select a category"
                        selectedKeys={formData.category ? [formData.category] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string
                          setFormData({ ...formData, category: selected || '' })
                        }}
                        classNames={{
                          trigger: 'bg-input/40 border border-[#6a6a7a] h-10 rounded-md',
                          value: 'text-white',
                          popoverContent: 'bg-[#1a1a2e] border border-[#6a6a7a] rounded-md',
                          listbox: 'bg-[#1a1a2e]',
                          base: 'w-full',
                        }}
                        popoverProps={{
                          classNames: {
                            content: 'bg-[#1a1a2e] border border-[#6a6a7a]',
                          },
                        }}
                      >
                        <SelectItem key="technical" value="technical">
                          Technical Issue
                        </SelectItem>
                        <SelectItem key="billing" value="billing">
                          Billing & Credits
                        </SelectItem>
                        <SelectItem key="feature" value="feature">
                          Feature Request
                        </SelectItem>
                        <SelectItem key="account" value="account">
                          Account Support
                        </SelectItem>
                        <SelectItem key="other" value="other">
                          Other
                        </SelectItem>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Message *</label>
                    <textarea
                      required
                      placeholder="Please describe your issue or question in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="border-[#6a6a7a] placeholder:text-muted-foreground focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[120px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-10 px-4 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-send w-4 h-4 mr-2"
                      aria-hidden="true"
                    >
                      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                      <path d="m21.854 2.147-10.94 10.939"></path>
                    </svg>
                    Send Message
                  </button>
                </form>
              </div>
            </Card>
          </div>
        </section> */}
      </main>
    </FeeLoveLayout>
  )
}
