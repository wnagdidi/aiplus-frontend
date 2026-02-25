'use client'
import Link from '@/components/routerLlink'
import { useTranslations } from '@/hooks/useTranslations'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

export default function Index() {
  const t = useTranslations('Home')

  return (
    <div className="product-link">
      <Box sx={{ padding: '60px 0' }}>
        <Container maxWidth="xl">
          <Box>
            <div className="wrapper">
              <div className="left">
                <div className="title">Products</div>
                <div className="link">
                  <a href="/">Bypass AI</a>
                </div>
                <div className="link">
                  <a
                    onClick={() => {
                      window.location.href = '/ai-detector'
                    }}
                  >
                    AI detector
                  </a>
                </div>
              </div>
              <div className="right">
                <div className="title">About</div>
                <Link color="text.secondary" underline="none" href="/about-us">
                  {t('about_us')}
                </Link>
                <Link color="text.secondary" underline="none" href="/term-and-services">
                  {t('terms_and_conditions')}
                </Link>
                <Link color="text.secondary" underline="none" href="/privacy-policy">
                  {t('privacy_policy')}
                </Link>
                <Link color="text.secondary" underline="none" href="/refund-policy">
                  {t('return_policy')}
                </Link>
                <Link color="text.secondary" underline="none" href="/contact-us">
                  {t('contact_us')}
                </Link>
              </div>
            </div>
          </Box>
        </Container>
      </Box>
    </div>
  )
}
