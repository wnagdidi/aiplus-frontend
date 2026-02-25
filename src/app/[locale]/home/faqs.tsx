"use client";
import * as React from "react";
import { Grid, Divider, Box, Container, Typography } from "@mui/material";

import { useTranslations } from "@/hooks/useTranslations";
import {
  secondarySubTitleStyle,
  secondaryTitleStyle,
} from "@/app/[locale]/home/styles";

// const QA_LIST = [
//   {
//     q: 'What is undetectable AI?',
//     a: 'Undetectable AI refers to cutting-edge artificial intelligence tools specifically designed to transform AI-generated content into human-like text, enabling it to evade detection by AI content detectors. By leveraging advanced algorithms, these tools effectively "humanize" text, ensuring it closely resembles natural writing styles while avoiding common traits that indicate AI authorship.',
//   },
//   {
//     q: 'What is AvoidAI?',
//     a: 'AvoidAI is an undetectable AI designed to rewrite your AI-generated text, ensuring it remains undetected. Unlike other AI detector bypass tools that compromise content quality or introduce human-like errors, AvoidAI prioritizes usability, delivering seamless performance while maintaining a high success rate in bypassing AI detectors.',
//   },
//   {
//     q: 'How to make AI text undetectable?',
//     a: 'To make AI-generated text undetectable, advanced AI bypassers like AvoidAI offer a reliable solution. Specifically designed to convert AI-generated content into text that reads as human-written, our tools utilize sophisticated algorithms to humanize the content, ensuring it successfully bypasses detection by AI content detectors.',
//   },
//   {
//     q: 'How many languages are supported by AvoidAI?',
//     a: 'Our AI bypasser supports over 50 languages including English, Arabic, Danish, French, Chinese, Japanese, Korean, Greek, Italian, Portuguese, Slovak, Polish, and more.',
//   },
//   {
//     q: 'Can this AI bypasser help me bypass AI detection from Google?',
//     a: 'Yes, the AI detection bypasser is a tool that converts AI-generated text into natural human-like language so that it becomes indistinguishable from human writing. It uses advanced AI detector bypass mechanisms and effectively bypasses AI detectors, including by Google.',
//   },
//   {
//     q: 'Is this AI undetectable for no charge?',
//     a: "AvoidAI does provide a free trial which permits users check out its functionality without having to make any kind of commitment. But if you want to use the tool a lot, you'll have to switch to a paid plan to get more credits and extra features.",
//   },
//   {
//     q: "What's the best undetectable AI writer?",
//     a: "AvoidAI is the leading AI that can't be detected. It transforms AI-generated content into text that's capable of bypassing multiple AI content detectors. AvoidAI aims to rewrite and transform text into a humanized version, while maintaining the original viewpoint and factual information. AvoidAI puts usability at the first place, unlike a mere AI humanizer.",
//   },
//   {
//     q: "How was the AI bypasser's model trained?",
//     a: <>Our AI bypass model is trained using linguistic analysis and statistical modeling on extensive 4 types real human-written content: academic paper, proffssional report, marketing article and daily life conversation.<br />&nbsp;<br/>AvoidAI detector bypass tool helps understand real human writing styles and mimic them (content, phrasing, sentence structure and even tone) across different senarios.<br />&nbsp;<br />AvoidAI’s primary objective is to help you bypass ai detectors, but its No 1 priority is serving user's current writing purpose with the most suitable content.</>,
//   },
// ]

// const QA_LIST = [
//   {
//     q: "question_1",
//     a: "answer_1",
//   },
//   {
//     q: "question_2",
//     a: "answer_2",
//   },
//   {
//     q: "question_3",
//     a: "answer_3",
//   },
//   {
//     q: "question_4",
//     a: "answer_4",
//   },
//   {
//     q: "question_5",
//     a: "answer_5",
//   },
//   {
//     q: "question_6",
//     a: "answer_6",
//   },
// ];

const FAQs = (props:any) => {
  const t = useTranslations("Home");
  const tNewHomePage = useTranslations("NewHomePage")

  const QA_LIST = props.list || [
    {
      q: tNewHomePage("faqs_item_1_q"),
      a: tNewHomePage("faqs_item_1_a")
    },
    {
      q: tNewHomePage("faqs_item_2_q"),
      a: tNewHomePage("faqs_item_2_a")
    },
    {
      q: tNewHomePage("faqs_item_3_q"),
      a: tNewHomePage("faqs_item_3_a")
    },
    {
      q: tNewHomePage("faqs_item_4_q"),
      a: tNewHomePage("faqs_item_4_a")
    },
    {
      q: tNewHomePage("faqs_item_5_q"),
      a: tNewHomePage("faqs_item_5_a")
    },
    {
      q: tNewHomePage("faqs_item_6_q"),
      a: tNewHomePage("faqs_item_6_a")
    },
    {
      q: tNewHomePage("faqs_item_7_q"),
      a: tNewHomePage("faqs_item_7_a")
    },
    {
      q: tNewHomePage("faqs_item_8_q"),
      a: <>{tNewHomePage("faqs_item_8_a_1")}<br />&nbsp;<br/>{tNewHomePage("faqs_item_8_a_2")}<br />&nbsp;<br />{tNewHomePage("faqs_item_8_a_3")}</>,
    },
  ]

  return (
    <Container
      id="faq"
      maxWidth="lg"
      sx={{
        py: 8,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 1, sm: 3 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        color="text.primary"
        sx={{
          ...secondaryTitleStyle,
          width: { xs: "100%", md: "60%" },
          textAlign: "center",
        }}
      >
        {/* {t("faq")} */}
        {tNewHomePage("faqs_main_title")}
      </Typography>
      <Typography
        component="h3"
        variant="body1"
        color="text.secondary"
        sx={{
          ...secondarySubTitleStyle,
          width: { sm: "100%", md: "60%" },
          textAlign: "center",
        }}
      >
        {/* {t("faq_subtitle")} */}
        {/*{tNewHomePage("faqs_sub_title")}*/}
      </Typography>
      <Box sx={{ width: { sm: "100%", md: "100%" }, mt: 2 }}>
        <Grid container spacing={4}>
          {QA_LIST.map((x) => (
            <Grid
              item
              key={x.q}
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Typography
                variant="h6"
                color="text.primary"
                sx={{
                  ...secondarySubTitleStyle,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                {/* {t(x.q)} */}
                {x.q}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "left" }}
              >
                {/* {t(x.a, {}, true)} */}
                {x.a}
              </Typography>
              <Divider variant="fullWidth" />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default FAQs;
