// The theme collection: each theme's colours in light and dark.
export type Mode = { ground: string; card: string; text: string; muted: string; accent: string; good: string; warning: string; bad: string; washes: readonly string[] }
/** background: the background the theme was first drawn with. Picking a theme does not apply it: the background in use stays. */
export type Theme = { id: string; label: string; background: string; light: Mode; dark: Mode }
export const THEMES: readonly Theme[] = [
  {
    "id": "neon-arcade",
    "label": "Neon Arcade",
    "background": "lamp",
    "light": {
      "ground": "#F4F1E8",
      "card": "#FFFFFF",
      "text": "#0B0B0F",
      "muted": "#5A5A66",
      "accent": "#4E8F00",
      "good": "#3F8400",
      "warning": "#B26A00",
      "bad": "#D4143A",
      "washes": [
        "#4E8F00",
        "#0A84C4",
        "#8A2BD6",
        "#D4143A"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F5F6F8",
      "card": "#FFFFFF",
      "text": "#0B0D12",
      "muted": "#5F6571",
      "accent": "#2459E8",
      "good": "#2A9E57",
      "warning": "#DD6B0A",
      "bad": "#D92D20",
      "washes": [
        "#2459E8",
        "#ED438B",
        "#DD6B0A",
        "#8B5CF6"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F4F4F4",
      "card": "#FFFFFF",
      "text": "#231F20",
      "muted": "#616161",
      "accent": "#2332D5",
      "good": "#209D57",
      "warning": "#BB7C38",
      "bad": "#EB2C2C",
      "washes": [
        "#2332D5",
        "#EB2C2C",
        "#BB7C38",
        "#8051FF"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F7F7F7",
      "card": "#FFFFFF",
      "text": "#4B4B4B",
      "muted": "#777777",
      "accent": "#449F02",
      "good": "#449F02",
      "warning": "#CC7800",
      "bad": "#FF4B4B",
      "washes": [
        "#449F02",
        "#1CB0F6",
        "#CC7800",
        "#CE82FF"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F8FAFD",
      "card": "#FFFFFF",
      "text": "#061B31",
      "muted": "#64748D",
      "accent": "#533AFD",
      "good": "#00A359",
      "warning": "#BC8409",
      "bad": "#D8351E",
      "washes": [
        "#533AFD",
        "#FB76FA",
        "#FF6118",
        "#FFCC55"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F5F5F5",
      "card": "#FFFFFF",
      "text": "#000000",
      "muted": "#656565",
      "accent": "#17A148",
      "good": "#159542",
      "warning": "#BF6D00",
      "bad": "#E91429",
      "washes": [
        "#17A148",
        "#6900BA",
        "#F79BD2",
        "#0D72EA"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#FBF3EC",
      "card": "#FFFFFF",
      "text": "#2A1810",
      "muted": "#7A5E50",
      "accent": "#C2410C",
      "good": "#2D8A4E",
      "warning": "#A86200",
      "bad": "#C8102E",
      "washes": [
        "#E8590C",
        "#D6336C",
        "#E8A200",
        "#A63D0A"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#EEF6F7",
      "card": "#FFFFFF",
      "text": "#0A2229",
      "muted": "#4F6B73",
      "accent": "#0F766E",
      "good": "#15803D",
      "warning": "#A16207",
      "bad": "#C81E1E",
      "washes": [
        "#0D9488",
        "#0284C7",
        "#2563EB",
        "#34D399"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F6F4EA",
      "card": "#FFFFFF",
      "text": "#1B2414",
      "muted": "#5E6B52",
      "accent": "#4C7A1E",
      "good": "#2E7D32",
      "warning": "#9A6700",
      "bad": "#C62828",
      "washes": [
        "#6AA32D",
        "#E8703A",
        "#E0A100",
        "#D0477E"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F3F2EE",
      "card": "#FFFFFF",
      "text": "#151516",
      "muted": "#5C5C5F",
      "accent": "#3F4FC4",
      "good": "#2D8A4E",
      "warning": "#9A6700",
      "bad": "#C62828",
      "washes": [
        "#3F4FC4",
        "#8E8E93",
        "#C2C2C6",
        "#55555A"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#EEF5EE",
      "card": "#FFFFFF",
      "text": "#0A1F10",
      "muted": "#4C6B54",
      "accent": "#0E7A2E",
      "good": "#1B7F3A",
      "warning": "#8A6D00",
      "bad": "#C62828",
      "washes": [
        "#0E7A2E",
        "#1FA34A",
        "#5BBF78",
        "#0A4F1E"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#EFF2FA",
      "card": "#FFFFFF",
      "text": "#0B1030",
      "muted": "#555E86",
      "accent": "#1F5FD6",
      "good": "#1B7F3A",
      "warning": "#8A6D00",
      "bad": "#C62828",
      "washes": [
        "#1F8FB8",
        "#5B45D6",
        "#1F5FD6",
        "#7FB4D9"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F7F2FA",
      "card": "#FFFFFF",
      "text": "#1E1426",
      "muted": "#6A5A78",
      "accent": "#B0338A",
      "good": "#1B7F3A",
      "warning": "#8A6D00",
      "bad": "#C62828",
      "washes": [
        "#D94FB0",
        "#3B9BD9",
        "#D9A600",
        "#7B4FD9"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F2F2F2",
      "card": "#FFFFFF",
      "text": "#111111",
      "muted": "#5A5A5A",
      "accent": "#C62828",
      "good": "#2D8A4E",
      "warning": "#9A6700",
      "bad": "#C62828",
      "washes": [
        "#222222",
        "#777777",
        "#C62828",
        "#B0B0B0"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#FBF1EC",
      "card": "#FFFFFF",
      "text": "#2A1420",
      "muted": "#7A5A66",
      "accent": "#C2501A",
      "good": "#2D8A4E",
      "warning": "#9A6700",
      "bad": "#C8102E",
      "washes": [
        "#E8641E",
        "#D63A78",
        "#E0A800",
        "#6A3AD6"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#F6EFFA",
      "card": "#FFFFFF",
      "text": "#1B1030",
      "muted": "#6A5C85",
      "accent": "#D6187A",
      "good": "#1F8F5F",
      "warning": "#B86E00",
      "bad": "#D11A4A",
      "washes": [
        "#D6187A",
        "#0E8FB0",
        "#6D28D9",
        "#C77700"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#EEF1F4",
      "card": "#FFFFFF",
      "text": "#0A0D14",
      "muted": "#566173",
      "accent": "#007C91",
      "good": "#1B8A5A",
      "warning": "#B26A00",
      "bad": "#D1004B",
      "washes": [
        "#B58900",
        "#007C91",
        "#D1004B",
        "#5B3FD6"
      ]
    },
    "dark": {
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
    "light": {
      "ground": "#FBF0DE",
      "card": "#FFFDF8",
      "text": "#2B1420",
      "muted": "#7A5F6B",
      "accent": "#E8590C",
      "good": "#2F8F4E",
      "warning": "#B87900",
      "bad": "#D6336C",
      "washes": [
        "#E0A100",
        "#E8590C",
        "#D6336C",
        "#862E9C"
      ]
    },
    "dark": {
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
  }
]
