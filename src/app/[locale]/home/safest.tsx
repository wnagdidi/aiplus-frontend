"use client";
import * as React from "react";
import { Typography, Box, Container, Grid, Grow, Button } from "@mui/material";
import { useTranslations } from "@/hooks/useTranslations";
import { useInView } from "react-intersection-observer";
import { usePricingDialog } from "@/context/PricingDialogContext";
import { useSession } from "next-auth/react";
import {
  secondaryTitleStyle,
  secondarySubTitleStyle,
} from "@/app/[locale]/home/styles";
import { EventEntry } from "@/context/GTMContext";
import { localeNames, locales, usePathname, type Locale } from "@/i18n.config";
import { useRouter } from "@/components/next-intl-progress-bar";

const Safest = () => {
  const t = useTranslations("Home");
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  });
  const pathname = usePathname();
  const router = useRouter();

  return (
    pathname == "/ai-humanizer" && (
      <Box
        sx={{
          backgroundColor: "rgb(238 241 248)",
        }}
      >
        <Container
          id="safest"
          maxWidth="xl"
          sx={{
            py: 8,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Box
            sx={{
              width: { xs: "100%" },
              textAlign: { xs: "center", md: "center" },
            }}
          >
            <Typography
              component="h2"
              variant="h4"
              color="text.primary"
              sx={secondaryTitleStyle}
            >
              {/* {t('detector_title', {}, true)} */}
              Safest AI Humanizer
            </Typography>
            <Typography
              variant="body1"
              component="h3"
              color="text.secondary"
              className="section-subtitle"
              sx={secondarySubTitleStyle}
            >
              {/* {t('detector_subtitle', {}, true)} */}
              HIX Bypass ensures that you not only bypass the detection of all
              those AI content detectors, but also do that safely.
            </Typography>
          </Box>
          <Grid
            container
            spacing={4}
            md={10}
            sx={{ mt: 1, alignItems: "center", justifyContent: "center" }}
            ref={ref}
          >
            <Grow
              in={inView}
              style={{ transformOrigin: "0 0 0" }}
              timeout={1000}
            >
              <Grid
                item
                xs={12}
                sm={12}
                md={5}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Grid
                  item
                  spacing={2}
                  sx={{
                    width: { sm: "100%", md: "100%" },
                    mt: 1,
                    alignItems: "center",
                  }}
                >
                  <Typography
                    component="h2"
                    color="text.primary"
                    sx={secondaryTitleStyle}
                  >
                    {/* {t('compare_title', {}, true)} */}
                    Original Meaning Retained
                  </Typography>
                  <Typography
                    component="h4"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Unlike many other AI to human text converters that twist the
                    meaning of your text, HIX Bypass is able to understand the
                    context of your provided content. It uses proper expressions
                    in the output to fully capture the core ideas and correctly
                    deliver the message you intended for your audience.
                  </Typography>
                </Grid>
                <Button
                  onClick={() => openDialogIfLogged(EventEntry.CompareCTA)}
                  variant="contained"
                  size="large"
                  sx={{
                    fontSize: "1.2rem",
                    padding: "14px 42px",
                    fontWeight: "bold",
                    borderRadius: "36px",
                    mt: 2,
                  }}
                >
                  {(session && t("upgrade_now")) || t("try_now")}
                </Button>
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box sx={{ width: "100%", boxShadow: "4px 4px 4px #3b82f680" }}>
                  <Grid
                    container
                    sx={{
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "center",
                    }}
                  >
                    <Grid
                      item
                      px={2}
                      sx={{
                        background: "gray",
                        width: "100%",
                        borderRadius: "8px 8px 0 0",
                      }}
                    >
                      <Typography
                        component="h3"
                        variant="body1"
                        color="#ffffff"
                        sx={{
                          ...secondarySubTitleStyle,
                          lineHeight: "2.125rem",
                        }}
                      >
                        Bypass
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      px={2}
                      py={4}
                      sx={{
                        background: "#fff",
                        width: "100%",
                      }}
                    >
                      <Typography
                        variant="body1"
                        component="h3"
                        color="text.secondary"
                      >
                        Creating a great sales copy starts with identifying your
                        target audience and their pain points. Create headlines
                        that will tell the reader enough to reach a conclusion
                        but make them want to know more. Then write a brief and
                        effective introduction paragraph.Let the readers know
                        how your products/services can help them using
                        persuasive language and storytelling techniques. Make
                        your reader feel a bit urgent when reading your copy and
                        add a call-to-action to encourage them to take action.
                        Revise and refine your copy for clarity and impact
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grow>
          </Grid>
        </Container>
      </Box>
    )
  );
};

export default Safest;
