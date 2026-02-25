'use client'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import {useTranslations} from '@/hooks/useTranslations'
import Button from "@mui/material/Button";
import * as React from "react";
import {usePricingDialog} from "@/context/PricingDialogContext";
import {useSession} from "next-auth/react";
import {secondarySubTitleStyle, secondaryTitleStyle} from '@/app/[locale]/home/styles'
import {EventEntry} from '@/context/GTMContext'

export default function GeneralRecommend() {
  const t = useTranslations('Home')
  const tNewHomePage = useTranslations("NewHomePage")
  const { openDialogIfLogged } = usePricingDialog()
  const { data: session } = useSession()
  return (
    <Box sx={{
      backgroundImage: 'url("/background.png")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0',
      backgroundSize: '100% auto',
    }}>
      <Container
        id="recommend"
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
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography component="h2" variant="h4" color="text.primary" sx={secondaryTitleStyle}>
            {/* {t('recommend_title', {}, true)} */}
            {/* Avoid AI Today with Grammarly-Correct, Reliable Content */}
            {tNewHomePage("general_recommend_main_title")}
          </Typography>
          <Typography component="h3" variant="body1" color="text.secondary" className="section-subtitle" sx={secondarySubTitleStyle}>
            {/* {t('recommend_subtitle', {}, true)} */}
            {/* Transform AI-generated text into completely undetectable, human-like content with 0 grammar mistakes. Try AvoidAI now to bypass AI detection for free! */}
            {tNewHomePage("general_recommend_sub_title")}
          </Typography>
        </Box>
        <Button
          onClick={() => openDialogIfLogged(EventEntry.GeneralRecommendCTA)}
          variant="contained"
          size="large"
          sx={{ fontSize: '1.2rem', padding: '14px 42px', fontWeight: 'bold', borderRadius: '36px', mt: 2 }}
        >
          {(session && t('upgrade_now')) || t('start_for_free')}
        </Button>
      </Container>
    </Box>
  )
}
