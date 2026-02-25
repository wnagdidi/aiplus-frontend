"use client";
import Typography from "@mui/material/Typography";
import { Box, Divider } from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useTranslations } from "@/hooks/useTranslations";
import Grow from "@mui/material/Grow";
import { useInView } from "react-intersection-observer";
import Button from "@mui/material/Button";
import * as React from "react";
import { usePricingDialog } from "@/context/PricingDialogContext";
import { useSession } from "next-auth/react";
import {
  secondarySubTitleStyle,
  secondaryTitleStyle,
} from "@/app/[locale]/home/styles";
import { EventEntry } from "@/context/GTMContext";
import { primaryColor } from "@/theme";
import { usePathname } from "next/navigation";
import { isHomePage } from "@/util/api";

// const CONTENT_LIST = [
//   {
//     key: "Guaranteed Accuracy",
//     value:
//       "AvoidAI understands the context and nuances of your original text. It intelligently selects the right words for a polished, humanized output without altered original meaning, attitude and emotion.",
//     img: "/purchaseMotivation/Guaranteed-Accuracy.svg",
//   },
//   {
//     key: "High Grammarly Score",
//     value:
//       "Unlike other AI humanizer which can only achieve 60+ scores at Grammarly, AvoidAI humanized content stablely get 90+ score at Grammarly check, proving it's high standard of grammartical quality. ",
//     img: "/purchaseMotivation/High-Grammarly-Score.svg",
//   },
//   {
//     key: "Improved SEO-Friendliness",
//     value:
//       'AvoidAI ensures your content meets Google’s quality guidelines by humanized the sentence structures and rhythm without altering the "keywords" you aim to rank higher on search engines.',
//     img: "/purchaseMotivation/Improved-SEO-Friendliness.svg",
//   },
//   {
//     key: "Avoid Being Flagged as Spam",
//     value:
//       "AvoidAI transforms AI-generated content to make it indistinguishable from human-written text. Whether used in emails or online publications, your content will never be flagged as spam.",
//     img: "/purchaseMotivation/Avoid-Being-Flagged-as-Spam.svg",
//   },
//   {
//     key: "Multiple Languages Supported",
//     value:
//       'AvoidAI supports over 50 languages, including French, Italian, German, Spanish, Portuguese, Turkish, Tagalog, and Polish. This allows you to humanize AI content in virtually any language you need.',
//     img: "/purchaseMotivation/Multiple-Languages-Supported.svg",
//   },
//   {
//     key: "Free to Try",
//     value:
//       "Experience the power of AvoidAI for free! No payments or sign-ups are required to give it a try. See for yourself why AvoidAI is the ultimate tool for humanizing AI-generated text.",
//     img: "/purchaseMotivation/Free-to-Try.svg",
//   },
// ];

const PurchaseMotivation = () => {
  const t = useTranslations("Home");
  const tNewHomePage = useTranslations("NewHomePage")
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  });

  const CONTENT_LIST = [
    {
      key: tNewHomePage("purchase_motivation_item_1_title"),
      value: tNewHomePage("purchase_motivation_item_1_content"),
      img: "/purchaseMotivation/Guaranteed-Accuracy.svg",
    },
    {
      key: tNewHomePage("purchase_motivation_item_2_title"),
      value: tNewHomePage("purchase_motivation_item_2_content"),
      img: "/purchaseMotivation/High-Grammarly-Score.svg",
    },
    {
      key: tNewHomePage("purchase_motivation_item_3_title"),
      value: tNewHomePage("purchase_motivation_item_3_content"),
      img: "/purchaseMotivation/Improved-SEO-Friendliness.svg",
    },
    {
      key: tNewHomePage("purchase_motivation_item_4_title"),
      value: tNewHomePage("purchase_motivation_item_4_content"),
      img: "/purchaseMotivation/Avoid-Being-Flagged-as-Spam.svg",
    },
    {
      key: tNewHomePage("purchase_motivation_item_5_title"),
      value: tNewHomePage("purchase_motivation_item_5_content"),
      img: "/purchaseMotivation/Multiple-Languages-Supported.svg",
    },
    {
      key: tNewHomePage("purchase_motivation_item_6_title"),
      value: tNewHomePage("purchase_motivation_item_6_content"),
      img: "/purchaseMotivation/Free-to-Try.svg",
    },
  ];

    const pathName = usePathname();
    console.log(pathName)
    if(isHomePage(pathName)) {
      return null
    }

  return (
    <Container
      id="crowdPortrait"
      maxWidth="xl"
      sx={{
        py: 8,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 3, sm: 5 },
      }}
    >
      <Box
        sx={{
          width: "80%",
          textAlign: { xs: "center", md: "center" },
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 2
        }}>
        <img width={60} height={60} src="/purchaseMotivation/Logo.png" />
        </Box>
        <Typography
          component="h2"
          variant="h4"
          color="text.primary"
          sx={secondaryTitleStyle}
        >
          {/* {t('detector_title', {}, true)} */}
          {/* Why Choose AvoidAI to Humanize AI Text */}
          {tNewHomePage("purchase_motivation_main_title")}
        </Typography>
        <Typography
          variant="body1"
          component="h3"
          color="text.secondary"
          className="section-subtitle"
          sx={secondarySubTitleStyle}
        >
          {/* {t('detector_subtitle', {}, true)} */}
          {/* AvoidAI offers unparalleled benefits that set it apart from other AI humanizers: */}
          {tNewHomePage("purchase_motivation_sub_title")}
        </Typography>
      </Box>
      <Grid
        container
        md={10}
        spacing={4}
        ref={ref}
        sx={{
          textAlign: "center",
        }}
      >
        {CONTENT_LIST.map((_x: any) => (
          <Grid
            item
            xs={12}
            md={6}
            key={_x.key}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Grid item xs={2} md={2}>
              <img alt="logo" src={_x.img} />
            </Grid>
            <Grid item xs={10} md={10}>
              <Typography
                variant="h6"
                color="text.primary"
                sx={{
                  ...secondarySubTitleStyle,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                {/* {t('detector_subtitle', {}, true)} */}
                {_x.key}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "left" }}
              >
                {_x.value}
              </Typography>
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Grid container md={10} spacing={4} ref={ref}></Grid>
    </Container>
  );
};

export default PurchaseMotivation;
