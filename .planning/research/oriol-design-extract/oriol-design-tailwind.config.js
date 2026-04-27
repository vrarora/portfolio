/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(240, 100%, 97%)',
            '100': 'hsl(240, 100%, 94%)',
            '200': 'hsl(240, 100%, 86%)',
            '300': 'hsl(240, 100%, 76%)',
            '400': 'hsl(240, 100%, 64%)',
            '500': 'hsl(240, 100%, 50%)',
            '600': 'hsl(240, 100%, 40%)',
            '700': 'hsl(240, 100%, 32%)',
            '800': 'hsl(240, 100%, 24%)',
            '900': 'hsl(240, 100%, 16%)',
            '950': 'hsl(240, 100%, 10%)',
            DEFAULT: '#0000ee'
        },
        secondary: {
            '50': 'hsl(43, 100%, 97%)',
            '100': 'hsl(43, 100%, 94%)',
            '200': 'hsl(43, 100%, 86%)',
            '300': 'hsl(43, 100%, 76%)',
            '400': 'hsl(43, 100%, 64%)',
            '500': 'hsl(43, 100%, 50%)',
            '600': 'hsl(43, 100%, 40%)',
            '700': 'hsl(43, 100%, 32%)',
            '800': 'hsl(43, 100%, 24%)',
            '900': 'hsl(43, 100%, 16%)',
            '950': 'hsl(43, 100%, 10%)',
            DEFAULT: '#ffb800'
        },
        accent: {
            '50': 'hsl(43, 100%, 97%)',
            '100': 'hsl(43, 100%, 94%)',
            '200': 'hsl(43, 100%, 86%)',
            '300': 'hsl(43, 100%, 76%)',
            '400': 'hsl(43, 100%, 64%)',
            '500': 'hsl(43, 100%, 50%)',
            '600': 'hsl(43, 100%, 40%)',
            '700': 'hsl(43, 100%, 32%)',
            '800': 'hsl(43, 100%, 24%)',
            '900': 'hsl(43, 100%, 16%)',
            '950': 'hsl(43, 100%, 10%)',
            DEFAULT: '#664900'
        },
        'neutral-50': '#000000',
        'neutral-100': '#808080',
        'neutral-200': '#5b5b5b',
        'neutral-300': '#ffffff',
        'neutral-400': '#dedbd9',
        'neutral-500': '#f4f4f4',
        'neutral-600': '#0a0a0a',
        background: '#ffffff',
        foreground: '#000000'
    },
    fontFamily: {
        sans: [
            'sans-serif',
            'sans-serif'
        ],
        heading: [
            'Mabry Pro Regular',
            'sans-serif'
        ],
        body: [
            'Times',
            'sans-serif'
        ],
        font3: [
            'Aeonik Bold',
            'sans-serif'
        ],
        font5: [
            'Aeonik Medium',
            'sans-serif'
        ]
    },
    fontSize: {
        '12': [
            '12px',
            {
                lineHeight: 'normal'
            }
        ],
        '14': [
            '14px',
            {
                lineHeight: '14px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: '21.6px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: '27.36px'
            }
        ],
        '30': [
            '30px',
            {
                lineHeight: '30px'
            }
        ],
        '34': [
            '34px',
            {
                lineHeight: '34px'
            }
        ],
        '40': [
            '40px',
            {
                lineHeight: '40px'
            }
        ],
        '72': [
            '72px',
            {
                lineHeight: '61.2px',
                letterSpacing: '-2px'
            }
        ]
    },
    spacing: {
        '16': '32px',
        '20': '40px',
        '24': '48px',
        '30': '60px',
        '40': '80px',
        '43': '86px',
        '60': '120px',
        '1px': '1px',
        '51px': '51px',
        '55px': '55px'
    },
    borderRadius: {
        md: '8px',
        lg: '16px',
        xl: '20px',
        full: '100px'
    },
    screens: {
        lg: '1024px',
        '1366px': '1366px'
    },
    transitionDuration: {
        '300': '0.3s'
    },
    transitionTimingFunction: {
        custom: 'cubic-bezier(0.44, 0, 0.56, 1)'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: '700px'
    }
},
  },
};
