'use client'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import {useTranslations} from '@/hooks/useTranslations'
import Button from '@mui/material/Button'
import EastIcon from '@mui/icons-material/East'
import {usePricingDialog} from '@/context/PricingDialogContext'
import {useSession} from 'next-auth/react'
import {secondaryTitleStyle} from '@/app/[locale]/home/styles'
import {EventEntry} from '@/context/GTMContext'

export default function Customers() {
  const t = useTranslations('Home')
  const { openDialogIfLogged } = usePricingDialog()
  const { data: session } = useSession()
  return (
    <Box>
      <Container
        maxWidth="xl"
        id="customer"
        sx={{
          py: 8,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Box sx={{ mt: 2, maxWidth: { md: '60%', xs: '100%' } }}>
            <Typography component="h2" variant="h4" color="text.primary" sx={secondaryTitleStyle}>
              {t('customer_title', {}, true)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('customer_subtitle', {}, true)}
            </Typography>
          </Box>
          <Box>
            <Button
              onClick={() => openDialogIfLogged(EventEntry.CustomersCTA)}
              variant="contained"
              size="large"
              endIcon={<EastIcon />}
              sx={{ fontSize: '1.2rem', padding: '14px 42px', fontWeight: 'bold', borderRadius: '36px', minWidth: '280px' }}
              className="icon-transition-x icon-small"
            >
              {t('limited_offer', {percent: '80%'})}
            </Button>
          </Box>
        </Box>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box
              sx={{
                background: `url(${process.env.NEXT_PUBLIC_SITE_CUSTOMER_1_IMAGE_URL})`,
                height: '570px',
                borderRadius: '0.75rem',
                backgroundSize: 'cover',
                boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.10)',
              }}
            />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {t('customer_1_said', {}, true)}
            </Typography>
            <Box>
              <Typography variant="h4" component="span" color="text.primary" sx={{mt: 1}}>
                {t('customer_1_earn')}
              </Typography>
              <br/>
              <Typography variant="caption" color="text.secondary">
                {t('customer_1_tip', {}, true)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box
              sx={{
                background: `url(${process.env.NEXT_PUBLIC_SITE_CUSTOMER_2_IMAGE_URL})`,
                height: '570px',
                borderRadius: '0.75rem',
                backgroundSize: 'cover',
                boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.10)',
              }}
            />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {t('customer_2_said', {}, true)}
            </Typography>
            <Box>
              <Typography variant="h4" component="span" color="text.primary" sx={{mt: 1}}>
                {t('customer_2_earn')}
              </Typography>
              <br/>
              <Typography variant="caption" color="text.secondary">
                {t('customer_2_tip', {}, true)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box
              sx={{
                background: `url(${process.env.NEXT_PUBLIC_SITE_CUSTOMER_3_IMAGE_URL})`,
                height: '570px',
                borderRadius: '0.75rem',
                backgroundSize: 'cover',
                boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.10)',
              }}
            />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {t('customer_3_said', {}, true)}
            </Typography>
            <Box>
              <Typography variant="h4" component="span" color="text.primary" sx={{ mt: 1 }}>
                {t('customer_3_earn')}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                {t('customer_3_tip')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
