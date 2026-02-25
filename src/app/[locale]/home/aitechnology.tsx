"use client";
import * as React from "react";
import { Typography, Container, Grid, Grow, Button } from "@mui/material";
import { useTranslations } from "@/hooks/useTranslations";
import { useInView } from "react-intersection-observer";
import { usePricingDialog } from "@/context/PricingDialogContext";
import { useSession } from "next-auth/react";
import {
  secondaryTitleStyle,
  secondarySubTitleStyle,
} from "@/app/[locale]/home/styles";
import { EventEntry } from "@/context/GTMContext";
import { usePathname } from "next/navigation";
import { isHomePage } from "@/util/api";

const Aitechnology = () => {
  const t = useTranslations("Home");
  const tNewHomePage = useTranslations("NewHomePage")
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  });

  const pathName = usePathname()
  if(!isHomePage(pathName)) {
    return null
  }
  return (
    <Container
      id="aitechnology"
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
            <img alt="humanization tool" src="/humanization_tool.jpg" />
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
              variant="h4"
              color="text.primary"
              sx={secondaryTitleStyle}
            >
              {/* {t('compare_title', {}, true)} */}
              {/* Avoid Google Penalties */}
              {tNewHomePage("aitechnology_main_1_title")}
            </Typography>
            <Typography
              variant="body1"
              component="h3"
              color="text.secondary"
              className="section-subtitle"
              sx={{ ...secondarySubTitleStyle, mt: 1 }}
            >
              {/* With AvoidAI, you can get undetectable AI content that sounds
              authentically human. This prevents the risk of facing Google
              penalties, which could contribute to a drastic decline in website
              traffic. */}
              {tNewHomePage("aitechnology_sub_1_title")}
            </Typography>
            <Typography
              component="h3"
              variant="h4"
              color="text.primary"
              sx={secondaryTitleStyle}
            >
              {/* {t('compare_title', {}, true)} */}
              {/* Avoid Spam Folders */}
              {tNewHomePage("aitechnology_main_2_title")}
            </Typography>
            <Typography
              variant="body1"
              component="h3"
              color="text.secondary"
              className="section-subtitle"
              sx={{ ...secondarySubTitleStyle, mt: 1 }}
            >
              {/* AvoidAI can help prevent your AI-generated text from getting lost
              in spam folders, unseen and unread, by rewriting it to appear
              human-written and authentic. */}
              {tNewHomePage("aitechnology_sub_2_title")}
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
  );
};

export default Aitechnology;
