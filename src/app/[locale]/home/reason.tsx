'use client'
import * as React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import {useTranslations} from '@/hooks/useTranslations'
import Button from '@mui/material/Button'
import {useInView} from 'react-intersection-observer'
import Grow from '@mui/material/Grow'
import {usePricingDialog} from '@/context/PricingDialogContext'
import {useSession} from 'next-auth/react'
import {secondaryTitleStyle} from '@/app/[locale]/home/styles'
import {EventEntry} from '@/context/GTMContext'
import {primaryColor} from '@/theme'

export default function Reason() {
  const t = useTranslations('Home')
  const tCommon = useTranslations('Common')
  const { openDialogIfLogged } = usePricingDialog()
  const { data: session } = useSession()
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  })
  return (
    <Box
      sx={{
        backgroundColor: 'rgb(248, 248, 253)',
      }}
    >
      <Container
        id="reasons"
        maxWidth="xl"
        sx={{
          py: 8,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, md: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%' },
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" color="text.primary" sx={secondaryTitleStyle}>
            {t('reason', {}, true)}
            <span style={{ color: primaryColor }}>{tCommon('brandName')}</span>
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mt: 1 }} ref={ref}>
          <Grow in={inView}>
            <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  background: 'url(/avoid_unfair_school_penalty.jpeg)',
                  height: { md: '200px', xs: '400px' },
                  borderRadius: '0.75rem',
                  backgroundSize: 'cover',
                  boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.04)',
                }}
              />
              <Typography variant="h6" sx={{ mt: 3 }}>
                {t('avoid_unfair_school_penalty')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {t('avoid_unfair_school_penalty_desc', {}, true)}
              </Typography>
            </Grid>
          </Grow>
          <Grow in={inView} style={{ transformOrigin: '0 0 0' }} timeout={1000}>
            <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  background: 'url(/avoid_google_ranking_penalty.png)',
                  height: { md: '200px', xs: '400px' },
                  borderRadius: '0.75rem',
                  backgroundSize: 'cover',
                  boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.04)',
                }}
              />
              <Typography variant="h6" sx={{ mt: 3 }}>
                {t('avoid_google_ranking_penalty')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {t('avoid_google_ranking_penalty_desc', {}, true)}
              </Typography>
            </Grid>
          </Grow>
          <Grow in={inView} style={{ transformOrigin: '0 0 0' }} timeout={2000}>
            <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  background: 'url(/avoid_marketing_spam_trigger.jpeg)',
                  height: { md: '200px', xs: '400px' },
                  borderRadius: '0.75rem',
                  backgroundSize: 'cover',
                  boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.10)',
                }}
              />
              <Typography variant="h6" sx={{ mt: 3 }}>
                {t('avoid_marketing_spam_trigger')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {t('avoid_marketing_spam_trigger_desc', {}, true)}
              </Typography>
            </Grid>
          </Grow>
        </Grid>
        <Button
          onClick={() => openDialogIfLogged(EventEntry.ReasonsCTA)}
          variant="contained"
          size="large"
          sx={{ fontSize: '1.2rem', padding: '14px 42px', fontWeight: 'bold', mt: 4, borderRadius: '36px' }}
        >
          {(session && t('upgrade_now')) || t('try_now')}
        </Button>
      </Container>
    </Box>
  )
}
