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

const DETECTOR_LIST = [
  { name: "ZeroGPT", logo: "/detector/zero_gpt_logo.png" },
  { name: "Crossplag", logo: "/detector/winston_logo.png" },
  { name: "Content at Scale", logo: "/detector/content_at_scale_logo.jpeg" },
  { name: "Copyleaks", logo: "/detector/copyleaks_logo.png" },
  { name: "OpenAI", logo: "/detector/copyleaks_logo.png" },
  { name: "GPTZero", logo: "/detector/gpt_zero_logo.png" },
  { name: "Sapling", logo: "/detector/zero_gpt_logo.png" },
  { name: "Writer", logo: "/detector/winston_logo.png" },
];

// const AI_CONTENT_LIST = [
//   {
//     key: "Chatgpt",
//     original:
//       "You always manage to brighten my day, and I feel incredibly lucky to have you in my life. Whether we're sharing quiet moments together or laughing about something silly, every moment with you feels special. You inspire me to be better, and I’m grateful for your support, love, and understanding.",
//     humanizedByAvoidAI:
//       "You never fail to lift my mood, I am truly blessed to have you. Sharing quiet times together or giggling over something ridiculous, being with you always feels amazing and wonderful. Thanks for the inspiration, I appreciate your support as well as love and understanding.",
//   },
//   {
//     key: "Chatgpt-4",
//     original: (
//       <>
//         Define Your Target Market and Customer Segments
//         <br />
//         Before expanding, it's important to know who your product intends to
//         serve. Understanding your ideal customers — their needs, problems, and
//         behaviors — will yield valuable information to tailor your growth
//         strategy. Think about elements such as demographics, location, company
//         size, user behavior.
//       </>
//     ),
//     humanizedByAvoidAI: (
//       <>
//         Define Your Target Market and Customer Segments
//         <br />
//         Before you expand, it's vital to identify who your product is intended
//         for. Having a clear understanding of your customers — their needs,
//         problems and behaviours — will provide valuable insights to define your
//         growth strategy. Consider aspects like demographics, geography,
//         organization size, user behavior
//       </>
//     ),
//   },
//   {
//     key: "Claude",
//     original: (
//       <>
//         Key Actions:
//         <br />
//         Interview customers and conduct surveys
//         <br />
//         Study competitors and identify gaps in the market
//         <br />
//         Segment customers by pain points, budget, usage
//       </>
//     ),
//     humanizedByAvoidAI: (
//       <>
//         Key Actions:
//         <br />
//         Talk to customers and ask them questions via surveys.
//         <br />
//         Analyze competitors and find market gaps
//         <br />
//         Segment customers by pain points, budget, usage
//       </>
//     ),
//   },
//   {
//     key: "Gemini",
//     original:
//       "As an admin, my primary responsibility is to oversee the entire server. This involves announcing important news, moderating major events, releasing updates, and managing both our website and store. I also handle reviewing all types of applications. In addition, I provide general support, including processing support tickets and assisting members with any questions or issues they may have. One of my key duties is enforcing server rules, which includes banning cheaters and rulebreakers to ensure a fair and enjoyable experience for everyone.",
//     humanizedByAvoidAI:
//       "As an administrator, I ensure seamless operations by moderating chats so that everyone feels supported and included; processing support tickets; and assisting members with their queries or issues. Minor offences usually result in me warning the player first. If they continue to disobey the rules, then I will duly temporarily ban them. This procedure is followed for all kinds of offences: whether it's cheating in duels, sending inappropriate messages in the chat etc., and enable maintaining fair as well as organized community. Also, I am responsible for overseeing and moderating major events to ensure seamless functioning and proper organization.",
//   },
// ];

export default function Compare() {
  const { useState } = React;
  const t = useTranslations("Home");
  const tNewHomePage = useTranslations("NewHomePage")
  const { openDialogIfLogged } = usePricingDialog();
  const { data: session } = useSession();
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // Trigger when at least 10% of the element is visible
  });
  const [activeKey, setActiveKey] = useState("Chatgpt");

  const AI_CONTENT_LIST = [
    {
      key: "Chatgpt",
      original: tNewHomePage("compare_item_chatgpt_left_content"),
      humanizedByAvoidAI: tNewHomePage("compare_item_chatgpt_right_content")
    },
    {
      key: "Chatgpt-4",
      original: (
        <>
        {tNewHomePage("compare_item_chatgpt4_left_1_content")}
          <br />
        {tNewHomePage("compare_item_chatgpt4_left_2_content")}
        </>
      ),
      humanizedByAvoidAI: (
        <>
          {tNewHomePage("compare_item_chatgpt4_right_1_content")}
          <br />
          {tNewHomePage("compare_item_chatgpt4_right_2_content")}
        </>
      ),
    },
    {
      key: "Claude",
      original: (
        <>
          {tNewHomePage("compare_item_claude_left_1_content")}
          <br />
          {tNewHomePage("compare_item_claude_left_2_content")}
          <br />
          {tNewHomePage("compare_item_claude_left_3_content")}
          <br />
          {tNewHomePage("compare_item_claude_left_4_content")}
        </>
      ),
      humanizedByAvoidAI: (
        <>
          {tNewHomePage("compare_item_claude_right_1_content")}
          <br />
          {tNewHomePage("compare_item_claude_right_2_content")}
          <br />
          {tNewHomePage("compare_item_claude_right_3_content")}
          <br />
          {tNewHomePage("compare_item_claude_right_4_content")}
        </>
      ),
    },
    {
      key: "Gemini",
      original: tNewHomePage("compare_item_gemini_left_content"),
      humanizedByAvoidAI: tNewHomePage("compare_item_gemini_right_content"),
    },
  ];

  const onChange = (value: string) => {
    if (value == activeKey) return;
    setActiveKey(value);
  };

  const pathName = usePathname()
  
  if(!isHomePage(pathName)) {
    return null
  }

  return (
    <Container
      id="compare"
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
          textAlign: "center",
        }}
      >
        <Typography
          component="h2"
          variant="h4"
          color="text.primary"
          sx={secondaryTitleStyle}
        >
          {/* {t("compare_title", {}, true)} */}
          {/* Avoid AI detection with Undetectable AI content */}
          {tNewHomePage("compare_main_title")}
        </Typography>
        <Typography
          component="h3"
          variant="body1"
          color="text.secondary"
          className="section-subtitle"
          sx={secondarySubTitleStyle}
        >
          {/* {t("compare_subtitle", {}, true)} */}
          {/* AvoidAI transforms AI-generated content (like ChatGPT or GPT-4) into
          100% human-like text. Learn how to humanize AI writing and make it
          read like it was written by a person. */}
          {tNewHomePage("compare_sub_title")}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          width: "80%",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: { xs: 1, sm: 4 },
        }}
      >
        <Button
          variant={activeKey == "Chatgpt" ? "contained" : "outlined"}
          onClick={() => onChange("Chatgpt")}
          sx={{
            height: "36px",
            fontSize: "14px",
            borderRadius: "8px",
            background: activeKey == "Chatgpt" ? "" : "white",
            minWidth: "80px",
          }}
        >
          Chatgpt
        </Button>
        <Button
          variant={activeKey == "Chatgpt-4" ? "contained" : "outlined"}
          onClick={() => onChange("Chatgpt-4")}
          sx={{
            height: "36px",
            fontSize: "14px",
            borderRadius: "8px",
            background: activeKey == "Chatgpt-4" ? "" : "white",
            minWidth: "80px",
            p: 0
          }}
        >
          Chatgpt-4
        </Button>
        <Button
          variant={activeKey == "Claude" ? "contained" : "outlined"}
          onClick={() => onChange("Claude")}
          sx={{
            height: "36px",
            fontSize: "14px",
            borderRadius: "8px",
            background: activeKey == "Claude" ? "" : "white",
            minWidth: "80px",
          }}
        >
          Claude
        </Button>
        <Button
          variant={activeKey == "Gemini" ? "contained" : "outlined"}
          onClick={() => onChange("Gemini")}
          sx={{
            height: "36px",
            fontSize: "14px",
            borderRadius: "8px",
            background: activeKey == "Gemini" ? "" : "white",
            minWidth: "80px",
          }}
        >
          Gemini
        </Button>
      </Box>
      <Grid container md={10} spacing={4} ref={ref}>
        <Grow in={inView}>
          <Grid item xs={12} sm={12} md={6}>
            <Grid
              item
              py={2}
              px={2}
              gap={2}
              sx={{
                position: "relative",
                width: "100%",
                backgroundColor: "#fff6f0",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                overflow: "hidden",
                height: "100%",
              }}
            >
              <Box
                py={0.5}
                px={0.5}
                sx={{
                  boxSizing: "border-box",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  backgroundColor: "#ffece0",
                  borderRadius: "0 0 4px 4px;",
                  color: "#ff5c00",
                  display: "flex",
                  justifyContent: "center",
                  minWidth: "22%",
                }}
              >
                <Grid container spacing={1} sx={{ display: "flex" }}>
                  <Grid
                    item
                    md={3}
                    sx={{
                      textAlign: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    <img alt="logo" src="/compare/original_logo.svg" />
                  </Grid>
                  <Grid
                    item
                    md={9}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Grid item>
                      <Typography
                        variant="body1"
                        color="#ff5c00"
                        sx={{ fontWeight: "bold", lineHeight: "1.0rem" }}
                      >
                        100%
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        variant="body2"
                        color="#ff5c00"
                        sx={{ fontSize: 12, lineHeight: "1.0rem" }}
                      >
                        AI generated
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
              <Grid
                item
                sx={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  textAlign: "center",
                }}
              >
                <Typography
                  component="h5"
                  variant="body1"
                  color="text.primary"
                  sx={{ fontSize: { sm: "24px", xs: "18px" } }}
                >
                  {/* {t("compare_title", {}, true)} */}
                  {/* Original */}
                  {tNewHomePage("compare_item_left_title")}
                </Typography>
              </Grid>
              <Grid
                item
                gap={4}
                sx={{
                  width: "100%",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="body1" color="text.primary">
                  {/* {t("compare_title", {}, true)} */}
                  {AI_CONTENT_LIST.find((l) => l.key === activeKey)?.original}
                </Typography>
                <Divider variant="middle" />
              </Grid>
              <Grid
                container
                md={12}
                spacing={2}
                sx={{
                  textAlign: "center",
                }}
              >
                {DETECTOR_LIST.slice(0, 4).map((x) => (
                  <Grid
                    item
                    xs={6}
                    md={3}
                    key={x.name}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <img alt="logo" src={x.logo} width="24px" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {x.name} <span style={{ color: "#ff8c40" }}>×</span>
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              <Grid
                container
                md={8}
                spacing={2}
                sx={{
                  textAlign: "center",
                }}
              >
                {DETECTOR_LIST.slice(-4).map((x) => (
                  <Grid
                    item
                    xs={6}
                    md={3}
                    key={x.name}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <img alt="logo" src={x.logo} width="24px" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {x.name} <span style={{ color: "#ff8c40" }}>×</span>
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grow>
        {/* Conditionally applies the timeout prop to change the entry speed. */}
        <Grow in={inView} style={{ transformOrigin: "0 0 0" }} timeout={1000}>
          <Grid item xs={12} sm={12} md={6}>
            <Grid
              item
              py={2}
              px={2}
              gap={2}
              sx={{
                position: "relative",
                width: "100%",
                backgroundColor: "#eefcfc",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                overflow: "hidden",
                height: "100%",
              }}
            >
              <Box
                py={0.5}
                px={0.5}
                sx={{
                  boxSizing: "border-box",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  backgroundColor: "#d1fbfb",
                  borderRadius: "0 0 4px 4px;",
                  color: "#00d3b6",
                  display: "flex",
                  justifyContent: "center",
                  minWidth: "22%",
                }}
              >
                <Grid container spacing={1} sx={{ display: "flex" }}>
                  <Grid
                    item
                    md={3}
                    sx={{
                      textAlign: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    <img
                      alt="logo"
                      src="/compare/humanized_by_avoidai_logo.svg"
                    />
                  </Grid>
                  <Grid
                    item
                    md={9}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Grid item>
                      <Typography
                        variant="body1"
                        color="#00d3b6"
                        sx={{ fontWeight: "bold", lineHeight: "1.0rem" }}
                      >
                        100%
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        variant="body2"
                        color="#00d3b6"
                        sx={{ fontSize: 12, lineHeight: "1.0rem" }}
                      >
                        AI generated
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
              <Grid
                item
                sx={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  textAlign: "center",
                }}
              >
                <Typography
                  component="h5"
                  variant="body1"
                  color="text.primary"
                  sx={{ fontSize: { sm: "24px", xs: "18px" } }}
                >
                  {/* {t("compare_title", {}, true)} */}
                  {/* Humanized by AvoidAI */}
                  {tNewHomePage("compare_item_right_title")}
                </Typography>
              </Grid>
              <Grid
                item
                gap={4}
                sx={{
                  width: "100%",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="body1" color="text.primary">
                  {/* {t("compare_title", {}, true)} */}
                  {
                    AI_CONTENT_LIST.find((l) => l.key === activeKey)
                      ?.humanizedByAvoidAI
                  }
                </Typography>
                <Divider variant="middle" />
              </Grid>
              <Grid
                container
                md={12}
                spacing={2}
                sx={{
                  textAlign: "center",
                }}
              >
                {DETECTOR_LIST.slice(0, 4).map((x) => (
                  <Grid
                    item
                    xs={6}
                    md={3}
                    key={x.name}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <img alt="logo" src={x.logo} width="24px" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {x.name} <span style={{ color: "#00c2a7" }}>√</span>
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              <Grid
                container
                md={8}
                spacing={2}
                sx={{
                  textAlign: "center",
                }}
              >
                {DETECTOR_LIST.slice(-4).map((x) => (
                  <Grid
                    item
                    xs={6}
                    md={3}
                    key={x.name}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <img alt="logo" src={x.logo} width="24px" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {x.name} <span style={{ color: "#00c2a7" }}>√</span>
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grow>
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
    </Container>
  );
}
