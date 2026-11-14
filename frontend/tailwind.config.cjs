module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#05080f',
        surface: '#0a0f1a',
        card: '#0d1420',
        line: '#16213a',
        accent: '#2f7bff',
        accent2: '#38bdf8',
        ink: '#e6edf9',
        mute: '#7a8aa8',
        crit: '#ff4d6a',
        warn: '#f5a524',
        ok: '#2dd4a0',
      },
      boxShadow: {
        glow: '0 0 24px rgba(47,123,255,.25)',
      },
    },
  },
  plugins: [],
};
