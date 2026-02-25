"use client";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useTranslations } from "@/hooks/useTranslations";
import * as React from "react";
import { useState } from "react";
import SwipeableViews from "react-swipeable-views";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import { Hidden } from "@mui/material";
import { usePricingDialog } from "@/context/PricingDialogContext";
import { useSession } from "next-auth/react";
import {
  secondarySubTitleStyle,
  secondaryTitleStyle,
} from "@/app/[locale]/home/styles";
import { EventEntry } from "@/context/GTMContext";
import { usePathname } from "next/navigation";
import { isHomePage } from "@/util/api";

const detectors = [
  {
    name: "GPTZero",
    image: "/detector/bypass-ai-detectors-gpt_zero.png",
    logo: "/detector/gpt_zero_logo.png",
  },
  {
    name: "Originality.ai",
    image: "/detector/bypass-ai-detectors-originality.png",
    logo: "/detector/originality_logo.png",
  },
  {
    name: "QuillBot",
    image: "/detector/bypass-ai-detectors-quillbot.png",
    logo: "/detector/bypass-ai-detectors-quillbot-logo.svg",
  },
  {
    name: "ZeroGPT",
    image: "/detector/bypass-ai-detectors-zero_gpt.png",
    logo: "/detector/zero_gpt_logo.png",
  },
  {
    name: "Sapling",
    image: "/detector/bypass-ai-detectors-sapling.png",
    logo: "/detector/bypass-ai-detectors-sapling-logo.svg",
  },
/*  {
    name: "Turnitin",
    image: "/detector/bypass-ai-detectors-turnitin.png",
    logo: "/detector/turnitin_logo.png",
  },*/
  {
    name: "Winston AI",
    image: "/detector/bypass-ai-detectors-winston.png",
    logo: "/detector/winston_logo.png",
  },
  {
    name: "Writer",
    image: "/detector/bypass-ai-detectors-writer.png",
    logo: "/detector/bypass-ai-detectors-writer-logo.svg",
  },
  {
    name: "Crossplag",
    image: "/detector/bypass-ai-detectors-crossplag.png",
    logo: "/detector/bypass-ai-detectors-crossplag-logo.svg",
  },
  {
    name: "Content at Scale",
    image: "/detector/bypass-ai-detectors-content_at_scale.png",
    logo: "/detector/content_at_scale_logo.jpeg",
  },
  {
    name: "Copyleaks",
    image: "/detector/bypass-ai-detectors-copyleaks.png",
    logo: "/detector/copyleaks_logo.png",
  },
  {
    name: "Scribbr",
    image: "/detector/bypass-ai-detectors-scribbr.png",
    logo: "/detector/bypass-ai-detectors-scribbr-logo.svg",
  },
];

export default function Detectors(props: any) {
  const { hideTitle } = props
  const t = useTranslations("Home");
  const tNewHomePage = useTranslations("NewHomePage")
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const handleChange = (event, newTabIndex) => {
    setActiveTabIndex(newTabIndex);
  };

  const pathName = usePathname()
  if(!isHomePage(pathName)) {
    return null
  }
  return (
    <Box
      sx={{
        backgroundColor: "rgb(248, 248, 253)",
      }}
    >
      <Container
        id="detectors"
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
        {
          !hideTitle && (
            <Box
            sx={{
              width: { xs: "80%" },
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
              {/* How to Humanize AI Content and Avoid AI Detectors Like GPTZero,
              Originality.ai, and More */}
              {tNewHomePage("detectors_main_title")}
            </Typography>
            <Typography
              variant="body1"
              component="h3"
              color="text.secondary"
              className="section-subtitle"
              sx={secondarySubTitleStyle}
            >
              {/* {t('detector_subtitle', {}, true)} */}
              {/* Our AI bypasser can help you humanize AI content and bypass AI
              detectors effectively, including the most stringent ones in the
              market. */}
              {tNewHomePage("detectors_sub_title")}
            </Typography>
          </Box>
          )
        }
        <TabContext value={activeTabIndex} sx={{ mt: 2 }}>
          <Hidden smDown implementation="css">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                variant="scrollable"
                scrollButtons
                allowScrollButtonsMobile
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                {detectors.map(({ name, logo }, index) => (
                  <Tab
                    key={name}
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <img alt={`${name} logo`} src={logo} width="24px" />
                        <span>{name}</span>
                      </Box>
                    }
                    value={index}
                  />
                ))}
              </TabList>
            </Box>
          </Hidden>
          <Hidden smUp implementation="css">
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {detectors.map(({ name, logo }, index) => (
                <Button
                  key={name}
                  variant={activeTabIndex === index ? "contained" : "text"}
                  disableElevation
                  size="large"
                  onClick={() => handleChange(null, index)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <img alt={`${name} logo`} src={logo} width="24px" />
                    <span>{name}</span>
                  </Box>
                </Button>
              ))}
            </Box>
          </Hidden>
          <SwipeableViews axis="x" index={activeTabIndex} animateTransitions>
            {detectors.map(({ name, image }, index) => (
              <TabPanel key={name} value={index}>
                <img
                  alt={`bypass ${name} AI testing`}
                  src={image}
                  loading="lazy"
                  style={{
                    boxShadow: "0px 4px 24px 0px rgba(0, 0, 0, 0.15)",
                    borderRadius: "16px",
                  }}
                />
              </TabPanel>
            ))}
          </SwipeableViews>
        </TabContext>
        <Button
          onClick={() => {localStorage.setItem('loginPosition', "4");openDialogIfLogged(EventEntry.DetectorsCTA)}}
          variant="contained"
          size="large"
          sx={{
            fontSize: "1.2rem",
            padding: "14px 42px",
            fontWeight: "bold",
            borderRadius: "36px",
          }}
        >
          {(session && t("upgrade_now")) || t("test_detector_for_free")}
        </Button>
      </Container>
    </Box>
  );
}
