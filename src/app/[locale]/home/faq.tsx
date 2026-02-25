'use client'
import * as React from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {useTranslations} from '@/hooks/useTranslations'
import {secondarySubTitleStyle, secondaryTitleStyle} from '@/app/[locale]/home/styles'

export default function FAQ() {
  const t = useTranslations('Home')
  const [expands, setExpands] = React.useState<string[]>(['panel1'])
  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    if (isExpanded) {
      setExpands((arr) => [panel, ...arr])
    } else {
      setExpands((arr) => arr.filter((p) => p !== panel))
    }
  }

  return (
    <Container
      id="faq"
      maxWidth="lg"
      sx={{
        py: 8,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 1, sm: 3 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        color="text.primary"
        sx={{
          ...secondaryTitleStyle,
          width: { xs: '100%', md: '60%' },
          textAlign: 'center',
        }}
      >
        {t('faq')}
      </Typography>
      <Typography
        component="h3"
        variant="body1"
        color="text.secondary"
        sx={{
          ...secondarySubTitleStyle,
          width: { sm: '100%', md: '60%' },
          textAlign: 'center',
        }}
      >
        {t('faq_subtitle')}
      </Typography>
      <Box sx={{ width: { sm: '100%', md: '100%' }, mt: 2 }}>
        <Accordion expanded={expands.includes('panel1')} onChange={handleChange('panel1')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1d-content" id="panel1d-header">
            <Typography variant="h6" component="h3">
              {t('question_1')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" gutterBottom sx={{ maxWidth: { sm: '100%', md: '80%' } }}>
              {t('answer_1', {}, true)}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expands.includes('panel2')} onChange={handleChange('panel2')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2d-content" id="panel2d-header">
            <Typography variant="h6" component="h3">
              {t('question_2')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" gutterBottom sx={{ maxWidth: { sm: '100%', md: '80%' } }}>
              {t('answer_2', {}, true)}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expands.includes('panel3')} onChange={handleChange('panel3')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3d-content" id="panel3d-header">
            <Typography variant="h6" component="h3">
              {t('question_3')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" gutterBottom sx={{ maxWidth: { sm: '100%', md: '80%' } }}>
              {t('answer_3', {}, true)}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expands.includes('panel4')} onChange={handleChange('panel4')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4d-content" id="panel4d-header">
            <Typography variant="h6" component="h3">
              {t('question_4')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" gutterBottom sx={{ maxWidth: { sm: '100%', md: '100%' } }}>
              {t('answer_4', {}, true)}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expands.includes('panel5')} onChange={handleChange('panel5')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4d-content" id="panel4d-header">
            <Typography variant="h6" component="h3">
              {t('question_5')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" gutterBottom sx={{ maxWidth: { sm: '100%', md: '100%' } }}>
              {t('answer_5', {}, true)}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expands.includes('panel6')} onChange={handleChange('panel6')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4d-content" id="panel4d-header">
            <Typography variant="h6" component="h3">
              {t('question_6')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" gutterBottom sx={{ maxWidth: { sm: '100%', md: '100%' } }}>
              {t('answer_6', {}, true)}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  )
}
