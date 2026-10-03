/** @type {import('tailwindcss').Config} */
// NativeWind uses 14 logical units per rem on native
const nativeRem = (size) => `${size / 14}rem`;

module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./layouts/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#090429",
        secondary: "#ffff00",
      },
      spacing: {
        action: nativeRem(120),
        "action-wide": nativeRem(150),
        more: nativeRem(32),
        "season-width": nativeRem(100),
        "season-height": nativeRem(40),
        "episode-width": nativeRem(160),
        "episode-height": nativeRem(100),
        "episode-width-wide": nativeRem(240),
        "episode-height-wide": nativeRem(150),
        "episode-info": nativeRem(80),
        "placeholder-line": nativeRem(13),
        "list-gap": nativeRem(10),
        "grid-gap": nativeRem(20),
        "list-min-height": nativeRem(100),
      },
      lineHeight: {
        title: nativeRem(36),
        subtitle: nativeRem(32),
      },
    },
  },
  plugins: [],
};
