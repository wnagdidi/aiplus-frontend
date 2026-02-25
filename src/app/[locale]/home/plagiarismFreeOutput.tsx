"use client";
import * as React from "react";
import { Typography, Container, Grid, Grow, Button } from "@mui/material";
import { useTranslations } from "@/hooks/useTranslations";
import { useInView } from "react-intersection-observer";
import { usePricingDialog } from "@/context/PricingDialogContext";
import { useSession } from "next-auth/react";
import { secondaryTitleStyle } from "@/app/[locale]/home/styles";
import { EventEntry } from "@/context/GTMContext";
import { localeNames, locales, usePathname, type Locale } from "@/i18n.config";

const PlagiarismFreeOutput = () => {
  const t = useTranslations("Home");
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  });
  const pathName = usePathname();

  return (
    pathName == "/ai-humanizer" && (
      <Container
        id="plagiarismFreeOutput"
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
          sx={{ mt: 2, alignItems: "center" }}
          ref={ref}
        >
          <Grow in={inView}>
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <img alt="plagiarism free" src="/plagiarism-free.webp" />
            </Grid>
          </Grow>
          {/* Conditionally applies the timeout prop to change the entry speed. */}
          <Grow in={inView} style={{ transformOrigin: "0 0 0" }} timeout={1000}>
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                component="h2"
                color="text.primary"
                sx={secondaryTitleStyle}
              >
                Plagiarism-Free Output
              </Typography>
              <Typography component="h4" color="text.secondary" sx={{ mt: 1 }}>
                Plagiarism can be an issue when you're using an AI rewriter
                online, but HIX Bypass is an exception. Our advanced text
                humanization technology ensures the originality of your
                rewritten text, with a low to zero plagiarism score.
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
        </Grid>
      </Container>
    )
  );
};

export default PlagiarismFreeOutput;
