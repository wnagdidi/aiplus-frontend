"use client";
import { Box, Container, Typography } from "@mui/material";
import { useLocale } from "next-intl";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "@/components/routerLlink";
import { Locale } from "@/i18n.config";
import LocaleSwitcher from "@/components/localeSwitcher";
import { usePathname } from "next/navigation";
import { isHomePage } from "@/util/api";

const PageSelect = () => {
  const tCommon = useTranslations("Common");
  const t = useTranslations("Home");
  const locale = useLocale() as Locale;

  const pathName = usePathname()
  if(!isHomePage(pathName)) {
    return null
  }

  return (
    <Box sx={{ background: "#fbfbfb" }}>
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 4, sm: 8 },
          py: 4,
          textAlign: { sm: "center", md: "left" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: { xs: 4, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
            width: "60%",
            justifyContent: "space-between",
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              {/* {t("solution_and_services")} */}
              Solution & Services
            </Typography>
            <Link color="text.secondary" underline="none" href="/ai-humanizer">
              {/* {t("ai_humanizer")} */}
              AI Humanizer
            </Link>
            <Link
              color="text.secondary"
              underline="none"
              href="/undetectable-ai"
            >
              {/* {t("undetectable_ai")} */}
              Undetectable AI
            </Link>
            <Link
              color="text.secondary"
              underline="none"
              href="/humanize-ai-essay"
            >
              {/* {t("humanize_ai_essay")} */}
              Humanize AI Essay
            </Link>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              {/* {t("bypass_ai_detectors")} */}
              Bypass AI Detectors
            </Typography>
            <Link color="text.secondary" underline="none" href="#">
              {/* {t("originality_detection")} */}
              Bypass Originality.AI Detection
            </Link>
            <Link
              color="text.secondary"
              underline="none"
              href="#"
            >
              {/* {t("gptzero_detection")} */}
              Bypass GPTZero AI Detection
            </Link>
            <Link
              color="text.secondary"
              underline="none"
              href="#"
            >
              {/* {t("turnitin_detection")} */}
              Bypass Turnitin AI Detection
            </Link>
            <Link color="text.secondary" underline="none" href="#">
              {/* {t("copyleaks_detection")} */}
              Bypass Copyleaks AI Detection
            </Link>
            <Link color="text.secondary" underline="none" href="#">
              {/* {t("zerogpt_detection")} */}
              Bypass ZeroGPT AI Detection
            </Link>
            <Link color="text.secondary" underline="none" href="#">
              {/* {t("bypass_winston_ai_detection")} */}
              Bypass Winston AI Detection
            </Link>
            <Link color="text.secondary" underline="none" href="#">
              {/* {t("view_more")} */}
              View More
            </Link>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              {t("company")}
            </Typography>
            <Link color="text.secondary" underline="none" href="/about-us">
              {t("about_us")}
            </Link>
            <Link
              color="text.secondary"
              underline="none"
              href="/term-and-services"
            >
              {t("terms_and_conditions")}
            </Link>
            <Link
              color="text.secondary"
              underline="none"
              href="/privacy-policy"
            >
              {t("privacy_policy")}
            </Link>
            <Link color="text.secondary" underline="none" href="/refund-policy">
              {t("return_policy")}
            </Link>
            <Link color="text.secondary" underline="none" href="/contact-us">
              {t("contact_us")}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default PageSelect;