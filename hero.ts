import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin'
import { heroui } from "@heroui/theme";

// 主题配置
// export const defaultTheme = "dark" as const;
export const defaultTheme = "dark" as const;

// 主题类名映射
export const themeClasses = {
  light: "light",
  dark: "dark"
} as const;

// 获取当前主题的类名
export const getThemeClass = (theme: keyof typeof themeClasses = defaultTheme) => {
  return themeClasses[theme];
};

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    heroui({
      defaultTheme: defaultTheme,
      themes: {
        light: {
          layout: {},
          colors: {
            foreground: "#375375"
          }
        },
        dark: {
          layout: {},
          colors: {
            background: "#121218",
            foreground: "#ffffff"
          }
        },
      }
    }),
    // 自定义: 向 .light/.dark 注入 CSS 变量
    plugin(({ addBase }) => {
      addBase({
        '.light': {
          '--panel-top-bg': '#f9f1ff',
          '--card-bg': '#ffffff',
          '--plan-top-bg': '#EEDBFF',
          '--home-bg-image': 'url(/bg_1.png)',
          '--home-bg-color': 'transparent',
          '--ai-detector-bg': 'url(/bg_3.png) no-repeat -5px -1px',
          '--ai-translator-bg-image': 'url(/bg_2.png)',
          '--ai-translator-bg-color': 'transparent',
        },
        '.dark': {
          '--panel-top-bg': '#ecf4ff',
          '--card-bg': '#21283b',
          '--plan-top-bg': '#2A3247',
          '--home-bg-image': 'none',
          '--home-bg-color': '#1a1d29',
          '--ai-detector-bg': '#1a1d29',
          '--ai-translator-bg-image': 'none',
          '--ai-translator-bg-color': '#1a1d29',
        },
      })
    }),
  ],
  
};

export default config;
