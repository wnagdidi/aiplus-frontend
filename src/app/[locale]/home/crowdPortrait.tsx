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
//     key: "Students",
//     value:
//       "Writing essays and assignments need to not only avoid AI detection, but also have decent grammar grade. AvoidAI helps you achieve high grades by providing work with an average Grammarly score of 95+ by writing in an academic tone and plagiarism free content.",
//     img: "/crowdPortrait/students.svg",
//   },
//   {
//     key: "Professionals",
//     value:
//       "Concerned that your boss or clients might find out you’re using AI, but still rely on it for more sophisticated expression to maintain professionalism? AvoidAI humanizer aims to empower brilliant professionals to use AI freely, avoid AI detection, sletting their true expertise shine without compromise.",
//     img: "/crowdPortrait/professionals.svg",
//   },
//   {
//     key: "SEO Experts",
//     value:
//       "AvoidAI eliminate the risk of being flagged by AI detectors and remaining compliant with search engine guidelines. Meanwhile, AvoidAI humanizer prvide features like: SEO unchange keywords to stick with your SEO strategy while also make the content undetectable.",
//     img: "/crowdPortrait/seo_experts.svg",
//   },
//   {
//     key: "Small Businesses",
//     value:
//       "Small businesses can use AvoidAI API to humanize ai content in a batch, update your website content in an automated workflow. Please contact support@avoidai.com for more details.",
//     img: "/crowdPortrait/small_businesses.svg",
//   },
// ];

const CrowdPortrait = () => {
  const t = useTranslations("Home");
  const tNewHomePage = useTranslations("NewHomePage");
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  });

  const CONTENT_LIST = [
    {
      key: tNewHomePage("crowd_portrait_item_1_title"),
      value: tNewHomePage("crowd_portrait_item_1_content"),
      img: "/crowdPortrait/students.svg",
    },
    {
      key: tNewHomePage("crowd_portrait_item_2_title"),
      value: tNewHomePage("crowd_portrait_item_2_content"),
      img: "/crowdPortrait/professionals.svg",
    },
    {
      key: tNewHomePage("crowd_portrait_item_3_title"),
      value: tNewHomePage("crowd_portrait_item_3_content"),
      img: "/crowdPortrait/seo_experts.svg",
    },
    {
      key: tNewHomePage("crowd_portrait_item_4_title"),
      value: tNewHomePage("crowd_portrait_item_4_content"),
      img: "/crowdPortrait/small_businesses.svg",
    },
  ];

  const pathName = usePathname()
  if(!isHomePage(pathName)) {
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
        <Typography
          component="h2"
          variant="h4"
          color="text.primary"
          sx={secondaryTitleStyle}
        >
          {/* {t('detector_title', {}, true)} */}
          {/* Tailored Features for Diverse Industries and Real-Life Humanized Scenarios */}
          {tNewHomePage("crowd_portrait_main_title")}
        </Typography>
        <Typography
          variant="body1"
          component="h3"
          color="text.secondary"
          className="section-subtitle"
          sx={secondarySubTitleStyle}
        >
          {/* {t('detector_subtitle', {}, true)} */}
          {/* AvoidAI offers specialized features to meet various humanized needs.
           Let’s explore how different professionals can benefit from our free AI bypass tool. */}
           {tNewHomePage("crowd_portrait_sub_title")}
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

export default CrowdPortrait;
