'use client'
import { isMobile } from '@/util/browser'
import { Box, Button, Container, Grid, Grow, Typography } from '@mui/material'
import { useInView } from 'react-intersection-observer'
import { secondarySubTitleStyle, secondaryTitleStyle } from './styles'
import { usePathname } from 'next/navigation'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { useTranslations } from '@/hooks/useTranslations'
import { useSession } from 'next-auth/react'
import { EventEntry } from '@/context/GTMContext'
import { isHomePage } from '@/util/api'

const EmphasizeProductValue = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  })
  const { openDialogIfLogged } = usePricingDialog()
  const t = useTranslations('Home')
  const { data: session } = useSession()
  const pathName = usePathname()
  if (isHomePage(pathName)) {
    return null
  }

  return (
    <Box
      sx={{
        marginTop: '2%',
        backgroundColor: 'rgb(248, 248, 253)',
      }}>
      <Container
        id="Productvalue"
        maxWidth="xl"
        sx={{
          py: 8,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}>
        <Grid
          container
          spacing={4}
          md={10}
          sx={{ alignItems: 'center' }}
          ref={ref}>
          <Grow in={inView} style={{ transformOrigin: '0 0 0' }} timeout={1000}>
            <Grid
              item
              xs={12}
              sm={12}
              md={7}
              sx={{
                alignItems: 'center',
              }}>
              <table style={{
                    boxShadow: '0 0 #0000, 0 0 #0000, 0px 5px 16px rgba(0,80,125,.08)'
              }} className="table-fixed w-[704px] shadow-card4 lg:w-full rounded-lg overflow-hidden bg-white mt-10 md:mt-5">
                <tbody>
                  <tr style={{
                    width: '100%'
                  }} className="text-start rounded-lg md:flex">
                    <th style={{
                    width: '50%',
                  }} className="px-5 py-3 border-t text-start border-[#D8E6FD] md:pb-0 font-bold border-t-0">
                      ✅ Effective
                    </th>
                    <td style={{
                    width: '50%'
                  }} className="px-5 py-3 border-t border-s border-[#D8E6FD] border-t-0">
                      Bypass all AI detectors
                    </td>
                  </tr>
                  <tr style={{
                    width: '100%'
                  }} className="text-start rounded-lg md:flex">
                    <th style={{
                    width: '50%'
                  }} className="px-5 py-3 border-t text-start border-[#D8E6FD] md:pb-0 font-bold">
                      🚀 Efficient
                    </th>
                    <td style={{
                    width: '50%'
                  }} className="px-5 py-3 border-t border-s border-[#D8E6FD] md:pt-2">
                      Rewrite your text in seconds
                    </td>
                  </tr>
                  <tr style={{
                    width: '100%'
                  }} className="text-start rounded-lg md:flex">
                    <th style={{
                    width: '50%'
                  }} className="px-5 py-3 border-t text-start border-[#D8E6FD] md:pb-0 font-bold">
                      💁‍♂️ Humanized text
                    </th>
                    <td style={{
                    width: '50%'
                  }} className="px-5 py-3 border-t border-s border-[#D8E6FD] md:pt-2">
                      Error-free, readable text
                    </td>
                  </tr>
                  <tr style={{
                    width: '100%'
                  }} className="text-start rounded-lg md:flex">
                    <th style={{
                    width: '50%'
                  }} className="px-5 py-3 border-t text-start border-[#D8E6FD] md:pb-0 font-bold">
                      📚 Context-sensitive
                    </th>
                    <td style={{
                    width: '50%'
                  }} className="px-5 py-3 border-t border-s border-[#D8E6FD] md:pt-2">
                      Retain the original meaning
                    </td>
                  </tr>
                </tbody>
              </table>
            </Grid>
          </Grow>
          {/* Conditionally applies the timeout prop to change the entry speed. */}
          <Grow in={inView}>
            <Grid
              item
              xs={12}
              sm={12}
              md={5}
              sx={{
                alignItems: 'center',
              }}>
              <Box>
                <img
                  alt="ghost"
                  src="/emphasize-product-value.png"
                  style={{ maxWidth: '48px' }}></img>
              </Box>
              <Typography
                component="h2"
                variant="h4"
                color="text.primary"
                sx={secondaryTitleStyle}>

                Our Humanizer Benefits Many
              </Typography>
              <Button
                onClick={() => openDialogIfLogged(EventEntry.CompareCTA)}
                variant="contained"
                size="large"
                sx={{
                  fontSize: '1.2rem',
                  padding: '14px 42px',
                  fontWeight: 'bold',
                  borderRadius: '36px',
                  mt: 2,
                }}>
                {(session && t('upgrade_now')) || t('try_now')}
              </Button>
            </Grid>
          </Grow>
        </Grid>
      </Container>
    </Box>
  )
}

export default EmphasizeProductValue
