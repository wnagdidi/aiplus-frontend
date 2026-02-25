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

const HUMANIZE_AI_CARD_CONTENT = [
  {
    title: "Replaces Detectable Elements",
    content:
      "HIX Bypass has a keen eye for phrases and sentence structures AI often uses. It then replaces them with appropriate alternatives that are less likely to get flagged.",
    bgc: "#f3fff6",
  },
  {
    title: "Improves Readability",
    content:
      "HIX Bypass can get rid of readability issues such as repetition, inconsistencies, and grammar errors, enabling you to offer a smoother reading experience for your readers.",
    bgc: "#ecf9ff",
  },
  {
    title: "Adds Emotion",
    content:
      "AI generated text tends to be robotic. HIX Bypass can add emotional nuances to the text, making it less monotonous and cold. Your readers will feel as if it was written with care.",
    bgc: "#fff3f3",
  },
];

const Productvalue = () => {
  const t = useTranslations("Home");
  const tNewHomePage = useTranslations("NewHomePage")
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  });

  const CARD_CONTENT = [
    {
      title: tNewHomePage("product_value_item_1_title"),
      content: tNewHomePage("product_value_item_1_content"),
      bgc: "#f3fff6",
    },
    {
      title: tNewHomePage("product_value_item_2_title"),
      content: tNewHomePage("product_value_item_2_content"),
      bgc: "#ecf9ff",
    },
    {
      title: tNewHomePage("product_value_item_3_title"),
      content: tNewHomePage("product_value_item_3_content"),
      bgc: "#fff3f3",
    },
    {
      title: tNewHomePage("product_value_item_4_title"),
      content: tNewHomePage("product_value_item_4_content"),
      bgc: "#fef5ff",
    },
    {
      title: tNewHomePage("product_value_item_5_title"),
      content: tNewHomePage("product_value_item_5_content"),
      bgc: "#fff9f3",
    },
  ];

  const pathName = usePathname();
  // console.log(pathName, '===> pathname')

  const renderHandle = () => {
    if (pathName == "/ai-humanizer") return HUMANIZE_AI_CARD_CONTENT;
    return CARD_CONTENT;
  };

  return (
    <Box
      sx={{
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
              <Box sx={{
                fontSize: 50
              }}>
                {/* <img
                  alt="ghost"
                  src="/ghost.webp"
                  style={{ maxWidth: "48px" }}
                ></img> */}
                🎉
              </Box>
              <Typography
                component="h2"
                variant="h4"
                color="text.primary"
                sx={secondaryTitleStyle}
              >
                {/* {t('compare_title', {}, true)} */}
                {/* Humanize AI with 99% Passing Rate */}
                {tNewHomePage('product_value_main_title')}
              </Typography>
              <Typography
                variant="body1"
                component="h3"
                color="text.secondary"
                className="section-subtitle"
                sx={{ ...secondarySubTitleStyle, mt: 1 }}
              >
                {/* Trained on millions of real human writing materials to humanize
                AI content from 4 main areas: academic, professional, marketing,
                and daily life speech. */}
                {tNewHomePage("product_value_sub_title")}
              </Typography>
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
                md={pathName == "/" ? 6 : 12}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {renderHandle()
                  .slice(0, 3)
                  .map((x) => (
                    <Card
                      variant="outlined"
                      key={x.title}
                      sx={{ background: x.bgc }}
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
              {pathName == "/" && (
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
                  {CARD_CONTENT.slice(-2).map((x) => (
                    <Card variant="outlined" key={x.title}>
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
              )}
            </Grid>
          </Grow>
        </Grid>
      </Container>
    </Box>
  );
};

export default Productvalue;
