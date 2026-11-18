// The theme collection: each theme's colours. Every theme is dark: the app is held in dark mode whatever its own setting.
export type Mode = { ground: string; card: string; text: string; muted: string; accent: string; good: string; warning: string; bad: string; washes: readonly string[] }
/** background: the background the theme was first drawn with. Picking a theme does not apply it: the background in use stays. */
export type Theme = { id: string; label: string; background: string; colors: Mode }
export const THEMES: readonly Theme[] = [
  {
    "id": "neon-arcade",
    "label": "Neon Arcade",
    "background": "lamp",
    "colors": {
      "ground": "#07070A",
      "card": "#121218",
      "text": "#F4F2EC",
      "muted": "#A3A3B5",
      "accent": "#A6F21A",
      "good": "#A6F21A",
      "warning": "#FFB020",
      "bad": "#FF3B5C",
      "washes": [
        "#A6F21A",
        "#1EC8FF",
        "#B44CFF",
        "#FF3B5C"
      ]
    }
  },
  {
    "id": "midnight-pop",
    "label": "Midnight Pop",
    "background": "lamp",
    "colors": {
      "ground": "#0B0B0B",
      "card": "#161616",
      "text": "#F5F5F7",
      "muted": "#98989D",
      "accent": "#6AA1FF",
      "good": "#34C26B",
      "warning": "#F58220",
      "bad": "#FF7A6E",
      "washes": [
        "#6AA1FF",
        "#ED438B",
        "#F58220",
        "#A78BFA"
      ]
    }
  },
  {
    "id": "workshop",
    "label": "Workshop",
    "background": "lamp",
    "colors": {
      "ground": "#231F20",
      "card": "#303030",
      "text": "#FDFDFD",
      "muted": "#B5B5B5",
      "accent": "#AAC8E8",
      "good": "#24B263",
      "warning": "#C5843D",
      "bad": "#EB2C2C",
      "washes": [
        "#AAC8E8",
        "#EB2C2C",
        "#C5843D",
        "#8051FF"
      ]
    }
  },
  {
    "id": "playground",
    "label": "Playground",
    "background": "lamp",
    "colors": {
      "ground": "#131F24",
      "card": "#202F36",
      "text": "#F1F7FB",
      "muted": "#DCE6EC",
      "accent": "#93D333",
      "good": "#93D333",
      "warning": "#FFAB33",
      "bad": "#EE5555",
      "washes": [
        "#93D333",
        "#49C0F8",
        "#FFAB33",
        "#CE82FF"
      ]
    }
  },
  {
    "id": "dusk",
    "label": "Dusk",
    "background": "lamp",
    "colors": {
      "ground": "#0D1738",
      "card": "#122054",
      "text": "#FFFFFF",
      "muted": "#839BC8",
      "accent": "#6953FD",
      "good": "#00B261",
      "warning": "#F9B900",
      "bad": "#F3432A",
      "washes": [
        "#533AFD",
        "#FB76FA",
        "#FF6118",
        "#FFCC55"
      ]
    }
  },
  {
    "id": "backstage",
    "label": "Backstage",
    "background": "lamp",
    "colors": {
      "ground": "#121212",
      "card": "#1F1F1F",
      "text": "#FFFFFF",
      "muted": "#B3B3B3",
      "accent": "#1ED760",
      "good": "#1ED760",
      "warning": "#FFA42B",
      "bad": "#F3727F",
      "washes": [
        "#1ED760",
        "#7358FF",
        "#F79BD2",
        "#539DF5"
      ]
    }
  },
  {
    "id": "ember",
    "label": "Ember",
    "background": "lamp",
    "colors": {
      "ground": "#140B08",
      "card": "#21130E",
      "text": "#FBEFE6",
      "muted": "#C4A99A",
      "accent": "#FF7A3D",
      "good": "#5FC27E",
      "warning": "#FFB84D",
      "bad": "#FF5A5A",
      "washes": [
        "#FF7A3D",
        "#FF3D6E",
        "#FFB84D",
        "#C2410C"
      ]
    }
  },
  {
    "id": "deep-sea",
    "label": "Deep Sea",
    "background": "lamp",
    "colors": {
      "ground": "#061318",
      "card": "#0D2129",
      "text": "#E8F6F8",
      "muted": "#9DBBC2",
      "accent": "#2DD4BF",
      "good": "#4ADE80",
      "warning": "#FBBF24",
      "bad": "#F87171",
      "washes": [
        "#2DD4BF",
        "#38BDF8",
        "#3B82F6",
        "#A7F3D0"
      ]
    }
  },
  {
    "id": "orchard",
    "label": "Orchard",
    "background": "lamp",
    "colors": {
      "ground": "#0E130C",
      "card": "#182016",
      "text": "#F1F5EA",
      "muted": "#AEB9A2",
      "accent": "#A3D977",
      "good": "#7BD88F",
      "warning": "#F6C453",
      "bad": "#F2777A",
      "washes": [
        "#A3D977",
        "#F7A072",
        "#F6C453",
        "#E56B9A"
      ]
    }
  },
  {
    "id": "ink",
    "label": "Ink",
    "background": "lamp",
    "colors": {
      "ground": "#0C0C0D",
      "card": "#18181A",
      "text": "#F2F2F0",
      "muted": "#A6A6A3",
      "accent": "#8B9CFF",
      "good": "#5FC27E",
      "warning": "#E8B341",
      "bad": "#F0706A",
      "washes": [
        "#8B9CFF",
        "#6B6B70",
        "#B8B8BC",
        "#3F3F46"
      ]
    }
  },
  {
    "id": "green-rain",
    "label": "Green Rain",
    "background": "rain",
    "colors": {
      "ground": "#020A04",
      "card": "#07140A",
      "text": "#D8FFE0",
      "muted": "#7FBF8E",
      "accent": "#39FF6A",
      "good": "#39FF6A",
      "warning": "#E6D84A",
      "bad": "#FF5C5C",
      "washes": [
        "#39FF6A",
        "#1FBF4C",
        "#0E7A2E",
        "#B6FFC8"
      ]
    }
  },
  {
    "id": "cipher",
    "label": "Cipher",
    "background": "rain",
    "colors": {
      "ground": "#05060F",
      "card": "#0C0E1C",
      "text": "#E6ECFF",
      "muted": "#9AA3C7",
      "accent": "#5CE1FF",
      "good": "#5FD38A",
      "warning": "#F2C14E",
      "bad": "#FF6B7A",
      "washes": [
        "#5CE1FF",
        "#8B7BFF",
        "#2F6BFF",
        "#C9F4FF"
      ]
    }
  },
  {
    "id": "pixel-dust",
    "label": "Pixel Dust",
    "background": "pixels",
    "colors": {
      "ground": "#120C18",
      "card": "#1D1426",
      "text": "#F6EEFF",
      "muted": "#B7A6C9",
      "accent": "#FF8AD8",
      "good": "#6FD79A",
      "warning": "#FFD166",
      "bad": "#FF6B81",
      "washes": [
        "#FF8AD8",
        "#8AD8FF",
        "#FFE08A",
        "#B08AFF"
      ]
    }
  },
  {
    "id": "static",
    "label": "Static",
    "background": "pixels",
    "colors": {
      "ground": "#0A0A0A",
      "card": "#151515",
      "text": "#F0F0F0",
      "muted": "#A0A0A0",
      "accent": "#FF4D4D",
      "good": "#5FC27E",
      "warning": "#E8B341",
      "bad": "#FF4D4D",
      "washes": [
        "#F0F0F0",
        "#8A8A8A",
        "#FF4D4D",
        "#4A4A4A"
      ]
    }
  },
  {
    "id": "sunset-blocks",
    "label": "Sunset Blocks",
    "background": "pixels",
    "colors": {
      "ground": "#130A14",
      "card": "#1F1220",
      "text": "#FFF0E8",
      "muted": "#C9A9B0",
      "accent": "#FF8A4C",
      "good": "#6FD79A",
      "warning": "#FFD24C",
      "bad": "#FF5C6C",
      "washes": [
        "#FF8A4C",
        "#FF4C8A",
        "#FFD24C",
        "#8A4CFF"
      ]
    }
  },
  {
    "id": "synthwave",
    "label": "Synthwave",
    "background": "grid",
    "colors": {
      "ground": "#120A2A",
      "card": "#1D1240",
      "text": "#F5EEFF",
      "muted": "#A99BC9",
      "accent": "#FF2E97",
      "good": "#34D399",
      "warning": "#FFB000",
      "bad": "#FF4D6D",
      "washes": [
        "#FF2E97",
        "#22D3EE",
        "#7C3AED",
        "#FFB000"
      ]
    }
  },
  {
    "id": "night-city",
    "label": "Night City",
    "background": "city",
    "colors": {
      "ground": "#05070D",
      "card": "#0E131C",
      "text": "#E6F1FF",
      "muted": "#8FA3BF",
      "accent": "#FCEE0A",
      "good": "#3DDC97",
      "warning": "#FF9F1C",
      "bad": "#FF2A6D",
      "washes": [
        "#FCEE0A",
        "#00E5FF",
        "#FF2A6D",
        "#7B61FF"
      ]
    }
  },
  {
    "id": "retro-sunset",
    "label": "Retro Sunset",
    "background": "sunset",
    "colors": {
      "ground": "#1A0B1F",
      "card": "#27122E",
      "text": "#FFF1DC",
      "muted": "#C2A3B8",
      "accent": "#FF7A1A",
      "good": "#7BD389",
      "warning": "#FFC83D",
      "bad": "#F2386B",
      "washes": [
        "#FFC83D",
        "#FF7A1A",
        "#F2386B",
        "#8E2DAA"
      ]
    }
  },
  {
    "id": "aurora",
    "label": "Aurora",
    "background": "borealis",
    "colors": {
      "ground": "#050B16",
      "card": "#0E1828",
      "text": "#E8F4F2",
      "muted": "#8FA6B5",
      "accent": "#3DF5A6",
      "good": "#3DF5A6",
      "warning": "#FFC266",
      "bad": "#FF5C7A",
      "washes": [
        "#3DF5A6",
        "#2FD4E0",
        "#B26BFF",
        "#FFB86B"
      ]
    }
  },
  {
    "id": "blueprint",
    "label": "Blueprint",
    "background": "plotter",
    "colors": {
      "ground": "#0B2A4A",
      "card": "#12355C",
      "text": "#E6F1FF",
      "muted": "#8FB0D4",
      "accent": "#7FD4FF",
      "good": "#6EE7B7",
      "warning": "#FFD166",
      "bad": "#FF7A8A",
      "washes": [
        "#7FD4FF",
        "#BFE3FF",
        "#4F9BE8",
        "#FFD166"
      ]
    }
  },
  {
    "id": "motherboard",
    "label": "Motherboard",
    "background": "circuit",
    "colors": {
      "ground": "#06140D",
      "card": "#0D2118",
      "text": "#E8F3EA",
      "muted": "#8FAE98",
      "accent": "#E8B64A",
      "good": "#5BE38A",
      "warning": "#E8B64A",
      "bad": "#FF6B5C",
      "washes": [
        "#5BE38A",
        "#7FE7FF",
        "#3FAF6E",
        "#E8B64A"
      ]
    }
  }
]
