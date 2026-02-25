"use client";
import * as React from "react";
import {
  Typography,
  Box,
  Container,
  Grid,
  Grow,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { useTranslations } from "@/hooks/useTranslations";
import { useInView } from "react-intersection-observer";
import { usePricingDialog } from "@/context/PricingDialogContext";
import { useSession } from "next-auth/react";
import {
  secondaryTitleStyle,
  secondarySubTitleStyle,
} from "@/app/[locale]/home/styles";
import { EventEntry } from "@/context/GTMContext";
import { isMobile } from "@/util/browser";
import Link from "@/components/routerLlink";
import { localeNames, locales, usePathname, type Locale } from "@/i18n.config";
import { useRouter } from "@/components/next-intl-progress-bar";
import { isHomePage } from "@/util/api";

const CARD_CONTENT = [
  {
    title: "Students",
    content:
      "Writing essays and assignments need to not only avoid AI detection, but also have decent grammar grade. AvoidAI helps you achieve high grades by providing work with an average Grammarly score of 95+ by writing in an academic tone and plagiarism free content.",
    bgc: "#F3FFF6",
  },
  {
    title: "SEO Experts",
    content:
      "AvoidAI eliminate the risk of being flagged by AI detectors and remaining compliant with search engine guidelines. Meanwhile, AvoidAI humanizer prvide features like: SEO unchange keywords to stick with your SEO strategy while also make the content undetectable.",
    bgc: "#FFF3F3",
  },

];

const CARD_CONTENT_RIGHT = [
  {
    title: "Professionals",
    content:
      "Concerned that your boss or clients might find out you’re using AI, but still rely on it for more sophisticated expression to maintain professionalism? AvoidAI humanizer aims to empower brilliant professionals to use AI freely, avoid AI detection, sletting their true expertise shine without compromise.",
    bgc: "#ECF9FF",
  },
  {
    title: "Small Businesses",
    content:
      "Small businesses can use AvoidAI API to humanize ai content in a batch, update your website content in an automated workflow. Please contact support@avoidai.com for more details.",
    bgc: "#FEF5FF",
  },

];

const Productvalue = () => {
  const t = useTranslations("Home");
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  });

  // console.log(pathName, '===> pathname')

  const pathName = usePathname() 
  if(isHomePage(pathName)) {
    return null
  }
  return (
    <Box
      sx={{
        marginTop: "2%",
        backgroundColor: "rgb(248, 248, 253)",
      }}
    >
      <Container
        id="Productvalue"
        maxWidth="xl"
        sx={{
          py: 8,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Grid
          container
          spacing={4}
          md={10}
          sx={{ alignItems: "center" }}
          ref={ref}
        >
          <Grow in={inView} style={{ transformOrigin: "0 0 0" }} timeout={1000}>
            <Grid
              item
              xs={12}
              sm={12}
              md={5}
              sx={{
                alignItems: "center",
              }}
            >
              {/* <Box>
                <img
                  alt="ghost"
                  src="/ghost.webp"
                  style={{ maxWidth: "48px" }}
                ></img>
              </Box> */}
              <Typography
                component="h2"
                variant="h4"
                color="text.primary"
                sx={secondaryTitleStyle}
              >
                {/* {t('compare_title', {}, true)} */}
                Our Humanizer Benefits Many
              </Typography>
              <Typography
                variant="body1"
                component="h3"
                color="text.secondary"
                className="section-subtitle"
                sx={{ ...secondarySubTitleStyle, mt: 1 }}
              >
                Many people can reap the benefits of HIX Bypass in their content creation. Our humanizer offers assistance for user groups such as:
              </Typography>
              {/* <Button
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
              </Button> */}
            </Grid>
          </Grow>
          {/* Conditionally applies the timeout prop to change the entry speed. */}
          <Grow in={inView}>
            <Grid
              item
              xs={12}
              sm={12}
              md={7}
              gap={4}
              sx={{
                display: isMobile() ? "block" : "flex",
                alignItems: "center",
              }}
            >
              <Grid
                item
                gap={2}
                xs={12}
                sm={12}
                md={6}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {CARD_CONTENT
                  .map((x) => (
                    <Card
                      variant="outlined"
                      key={x.title}
                      sx={{ background: x.bgc,
                        height: 250,
                        border: 'none'
                       }}
                    >
                      <CardContent>
                        <Typography
                          component="h3"
                          sx={{
                            fontWeight: "bold",
                          }}
                        >
                          {x.title}
                        </Typography>
                        <Typography component="h5" variant="body1">
                          {x.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
              </Grid>
              <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  gap={2}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {CARD_CONTENT_RIGHT.map((x) => (
                    <Card variant="outlined" key={x.title} sx={{ background: x.bgc,
                      height: 250,
                      border: 'none'
                     }}>
                      <CardContent>
                        <Typography
                          component="h3"
                          sx={{
                            fontWeight: "bold",
                          }}
                        >
                          {x.title}
                        </Typography>
                        <Typography component="h5" variant="body1">
                          {x.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Grid>
            </Grid>
          </Grow>
        </Grid>
      </Container>
    </Box>
  );
};

export default Productvalue;
