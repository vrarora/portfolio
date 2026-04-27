// React Theme — extracted from https://www.oriol.design/
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
 *   };
 *   fonts: {
    body: string;
    heading: string;
 *   };
 *   fontSizes: {
    '12': string;
    '14': string;
    '16': string;
    '20': string;
    '24': string;
    '30': string;
    '34': string;
    '40': string;
    '72': string;
 *   };
 *   space: {
    '1': string;
    '32': string;
    '40': string;
    '48': string;
    '51': string;
    '55': string;
    '60': string;
    '80': string;
    '86': string;
    '120': string;
 *   };
 *   radii: {
    md: string;
    lg: string;
    xl: string;
    full: string;
 *   };
 *   shadows: {

 *   };
 *   states: {
 *     hover: { opacity: number };
 *     focus: { opacity: number };
 *     active: { opacity: number };
 *     disabled: { opacity: number };
 *   };
 * }
 */

export const theme = {
  "colors": {
    "primary": "#0000ee",
    "secondary": "#ffb800",
    "accent": "#664900",
    "background": "#ffffff",
    "foreground": "#000000",
    "neutral50": "#000000",
    "neutral100": "#808080",
    "neutral200": "#5b5b5b",
    "neutral300": "#ffffff",
    "neutral400": "#dedbd9",
    "neutral500": "#f4f4f4",
    "neutral600": "#0a0a0a"
  },
  "fonts": {
    "body": "'Aeonik Medium', sans-serif",
    "heading": "'Mabry Pro Regular', sans-serif"
  },
  "fontSizes": {
    "12": "12px",
    "14": "14px",
    "16": "16px",
    "20": "20px",
    "24": "24px",
    "30": "30px",
    "34": "34px",
    "40": "40px",
    "72": "72px"
  },
  "space": {
    "1": "1px",
    "32": "32px",
    "40": "40px",
    "48": "48px",
    "51": "51px",
    "55": "55px",
    "60": "60px",
    "80": "80px",
    "86": "86px",
    "120": "120px"
  },
  "radii": {
    "md": "8px",
    "lg": "16px",
    "xl": "20px",
    "full": "100px"
  },
  "shadows": {},
  "states": {
    "hover": {
      "opacity": 0.08
    },
    "focus": {
      "opacity": 0.12
    },
    "active": {
      "opacity": 0.16
    },
    "disabled": {
      "opacity": 0.38
    }
  }
};

// MUI v5 theme
export const muiTheme = {
  "palette": {
    "primary": {
      "main": "#0000ee",
      "light": "hsl(240, 100%, 62%)",
      "dark": "hsl(240, 100%, 32%)"
    },
    "secondary": {
      "main": "#ffb800",
      "light": "hsl(43, 100%, 65%)",
      "dark": "hsl(43, 100%, 35%)"
    },
    "background": {
      "default": "#ffffff",
      "paper": "#f4f4f4"
    },
    "text": {
      "primary": "#000000",
      "secondary": "#0000ee"
    }
  },
  "typography": {
    "fontFamily": "'Times', sans-serif",
    "h1": {
      "fontSize": "34px",
      "fontWeight": "400",
      "lineHeight": "34px",
      "fontFamily": "'Mabry Pro Black', sans-serif"
    },
    "h2": {
      "fontSize": "24px",
      "fontWeight": "400",
      "lineHeight": "27.36px",
      "fontFamily": "'Mabry Pro Black', sans-serif"
    },
    "h3": {
      "fontSize": "20px",
      "fontWeight": "400",
      "lineHeight": "21.6px",
      "fontFamily": "'Mabry Pro Black', sans-serif"
    }
  },
  "shape": {
    "borderRadius": 8
  },
  "shadows": []
};

export default theme;
