"use client";
import * as React from "react";
import {
  Typography,
  Box,
  Container,
  Grid,
  Grow,
  Button,
  Link,
} from "@mui/material";
import { useTranslations } from "@/hooks/useTranslations";
import { useInView } from "react-intersection-observer";
import { usePricingDialog } from "@/context/PricingDialogContext";
import { useSession } from "next-auth/react";
import { secondaryTitleStyle } from "@/app/[locale]/home/styles";
import { EventEntry } from "@/context/GTMContext";
import { localeNames, locales, usePathname, type Locale } from "@/i18n.config";
import { useRouter } from "@/components/next-intl-progress-bar";
import { isHomePage } from "@/util/api";

const Languages = () => {
  const t = useTranslations("Home");
  const tNewHomePage = useTranslations("NewHomePage")
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  });
  const pathname = usePathname();
  const router = useRouter();

  const changeLocale = (event: any) => {
    // ...if the user chose Arabic ("ar-eg"),
    // router.replace() will prefix the pathname
    // with this `newLocale`, effectively changing
    // languages by navigating to `/ar-eg/about`.
    router.replace(pathname, { locale: event });
  };

  if(!isHomePage(pathname)) {
    return null
  }

  return (
    <Box
      sx={{
        backgroundColor: "rgb(248, 248, 253)",
      }}
    >
      <Container
        id="languages"
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
          sx={{ mt: 2, alignItems: "center", justifyContent: "center" }}
          ref={ref}
        >
          <Grow in={inView} style={{ transformOrigin: "0 0 0" }} timeout={1000}>
            <Grid
              item
              xs={12}
              sm={12}
              md={7}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                component="h2"
                variant="h4"
                color="text.primary"
                sx={secondaryTitleStyle}
              >
                {/* {t('compare_title', {}, true)} */}
                {/* Avoid AI in Many Languages */}
                {tNewHomePage("language_main_title")}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {/* Our AI detector humanizer tool is designed to cover the needs of
                global users. It can humanize AI content and rewrite any text in
                50+ languages, ensuring it avoid ai detection effectively. */}
                {tNewHomePage("language_sub_title")}
              </Typography>
              <Grid
                container
                spacing={2}
                sx={{
                  width: { sm: "100%", md: "100%" },
                  mt: 1,
                  alignItems: "center",
                }}
              >
                {locales.map((x) => (
                  <Grid
                    item
                    key={x}
                    xs={6}
                    md={3}
                    sx={{
                      display: "flex",
                      gap: { xs: 1, sm: 2 },
                    }}
                  >
                    <Link
                      color="text.secondary"
                      href="#"
                      underline="none"
                      onClick={() => changeLocale(x)}
                    >
                      {localeNames[x]}
                    </Link>
                  </Grid>
                ))}
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
              md={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img alt="language supported" src="/language-supported.png" />
            </Grid>
          </Grow>
        </Grid>
      </Container>
    </Box>
  );
};

export default Languages;
