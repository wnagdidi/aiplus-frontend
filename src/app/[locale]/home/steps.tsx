'use client'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import {useTranslations} from '@/hooks/useTranslations'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import ChecklistIcon from '@mui/icons-material/Checklist'
import Button from '@mui/material/Button'
import * as React from 'react'
import {Hidden} from '@mui/material'
import {useInView} from 'react-intersection-observer'
import Grow from '@mui/material/Grow'
import {usePricingDialog} from '@/context/PricingDialogContext'
import {useSession} from 'next-auth/react'
import {primaryColor} from "@/theme";
import {secondaryTitleStyle} from '@/app/[locale]/home/styles'
import {EventEntry} from '@/context/GTMContext'
import { usePathname } from 'next/navigation'
import { isHomePage } from '@/util/api'

const stepContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'start',
  gap: 2,
  maxWidth: '300px',
}

const stepIconContainerStyle = {
  borderRadius: '28% 72% 50% 50% / 26% 20% 80% 74%',
  height: '96px',
  width: '96px',
  backgroundColor: 'rgba(31, 97, 235, 0.15)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const stepIconStyle = { fontSize: '48px', color: primaryColor }

export default function Steps() {
  const t = useTranslations('Home')
  const { openDialogIfLogged } = usePricingDialog()
  const { data: session } = useSession()
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  })

  const pathName = usePathname()
  if(!isHomePage(pathName)) {
    return null
  }
  return (
    <Box
      sx={{
        backgroundColor: 'rgb(238 241 248)',
      }}
    >
      <Container
        id="steps"
        maxWidth="xl"
        sx={{
          py: 8,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { xs: '100%' },
            textAlign: 'center',
          }}
        >
          <Typography component="h2" variant="h4" color="text.primary" sx={secondaryTitleStyle}>
            {t('steps_title', {}, true)}
          </Typography>
        </Box>
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 3, md: 1 },
            flexDirection: { xs: 'column', md: 'row' },
          }}
          ref={ref}
        >
          <Grow in={inView}>
            <Box sx={stepContainerStyle}>
              <Box sx={stepIconContainerStyle}>
                <ContentPasteIcon sx={stepIconStyle} />
              </Box>
              <Typography component="h3" variant="subtitle1" color="text.primary" fontWeight="500">
                {t('steps_1_title', {}, true)}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {t('steps_1_desc', {}, true)}
              </Typography>
            </Box>
          </Grow>

            <Hidden mdDown implementation="css">
              <Grow in={inView} style={{ transformOrigin: '0 0 0' }} timeout={500}>
                <img alt="next" src="/arrow-top.png" />
              </Grow>
            </Hidden>
          <Grow in={inView} style={{ transformOrigin: '0 0 0' }} timeout={1000}>
            <Box sx={stepContainerStyle}>
              <Box sx={stepIconContainerStyle}>
                <AutoFixHighIcon sx={stepIconStyle} />
              </Box>
              <Typography component="h3" variant="subtitle1" color="text.primary" fontWeight="500">
                {t('steps_2_title', {}, true)}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {t('steps_2_desc', {}, true)}
              </Typography>
            </Box>
          </Grow>
            <Hidden mdDown implementation="css">
          <Grow in={inView} style={{ transformOrigin: '0 0 0' }} timeout={1500}>
              <img alt="next" src="/arrow-bottom.png" />
          </Grow>
            </Hidden>
          <Grow in={inView} style={{ transformOrigin: '0 0 0' }} timeout={2000}>
            <Box sx={stepContainerStyle}>
              <Box sx={stepIconContainerStyle}>
                <ChecklistIcon sx={stepIconStyle} />
              </Box>
              <Typography component="h3" variant="subtitle1" color="text.primary" fontWeight="500">
                {t('steps_3_title', {}, true)}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {t('steps_3_desc', {}, true)}
              </Typography>
            </Box>
          </Grow>
        </Box>
        <Button
          onClick={() => openDialogIfLogged(EventEntry.StepsCTA)}
          variant="contained"
          size="large"
          sx={{ fontSize: '1.2rem', padding: '14px 42px', fontWeight: 'bold', mt: 4, borderRadius: '36px' }}
        >
          {(session && t('upgrade_now')) || t('start_for_free')}
        </Button>
      </Container>
    </Box>
  )
}
