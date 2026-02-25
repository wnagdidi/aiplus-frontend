const homepageLD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `Bypass AI Detection | Humanize AI Text | ${process.env.NEXT_PUBLIC_BRAND_NAME} and Undetectable`,
  url: process.env.NEXT_PUBLIC_SITE_URL,
  description:
    `Transform AI-generated text into engaging, human-like content with ${process.env.NEXT_PUBLIC_BRAND_NAME}. Our tools ensure plagiarism-free content undetectable bypasses AI detectors.`,
}

const homepageFaqLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is an AI detection remover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An AI detection remover helps users bypass AI detectors by creating content that scores as 100% human.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why is it important to bypass AI detection?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bypassing AI detection is crucial for students, content creators, and advertisers to avoid penalties and maintain authenticity.',
      },
    },
    {
      '@type': 'Question',
      name: 'How to make AI text undetectable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can humanize AI-generated text with Avoid AI, making it completely undetectable to AI detectors.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is it free to bypass AI detectors with Avoid AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'New users can humanize a limited number of words for free. To access more features, a subscription is required.',
      },
    },
    {
      '@type': 'Question',
      name: 'What languages does Avoid AI support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Avoid AI supports over 30 languages in addition to English.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much time does processing my paperwork take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Processing time varies based on input length and complexity, typically taking 10 to 20 seconds.',
      },
    },
  ],
}

const organizationLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: process.env.NEXT_PUBLIC_BRAND_NAME,
  url: process.env.NEXT_PUBLIC_SITE_URL,
  logo: process.env.NEXT_PUBLIC_SITE_URL + process.env.NEXT_PUBLIC_BRAND_NAME.toLowerCase().replace(' ','')+'/logo.png',
  description:
    `${process.env.NEXT_PUBLIC_BRAND_NAME} specializes in transforming AI-generated text into human-like content, helping bypass AI detectors with innovative tools.`,
  image: [process.env.NEXT_PUBLIC_SITE_URL + process.env.NEXT_PUBLIC_BRAND_NAME.toLowerCase().replace(' ','')+'/logo.png'],
}

export const homepageLDScript = (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(homepageLD)}}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(homepageFaqLD)}}
    />
  </>
)

export const defaultLDScript = (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(organizationLD)}}
    />
  </>
)
