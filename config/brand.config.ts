export const brand = {
  // Basic
  name: "PrismGrid",
  shortName: "PG",
  legalName: "PrismGrid",

  // Branding
  tagline: "Smart Energy Protection & Management",
  slogan: "Monitor. Protect. Power Safely.",

  // Company
  company: {
    name: "PrismGrid",
    founded: "2026",
  },

  // URLs
  url: "https://prismgrid.com",
  appUrl: "https://app.prismgrid.com",
  apiUrl: "https://api.prismgrid.com",

  // Contact
  contact: {
    email: "support@prismgrid.com",
    sales: "sales@prismgrid.com",
    phone: "+8801700000000",
    address: {
      country: "Bangladesh",
      city: "Dhaka",
    },
  },

  // Social
  social: {
    github: "https://github.com/prismgrid",
    facebook: "https://facebook.com/prismgrid",
    linkedin: "https://linkedin.com/company/prismgrid",
    twitter: "https://x.com/prismgrid",
    youtube: "https://youtube.com/@prismgrid",
  },

  // Product Description
  description:
    "PrismGrid is an intelligent energy protection and management system that continuously monitors voltage and current, automatically disconnecting unsafe electrical conditions to protect homes, offices, and industrial equipment from power-related damage.",

  shortDescription:
    "Smart voltage and current protection for safer electrical systems.",

  // SEO
  seo: {
    title: "PrismGrid | Smart Energy Protection & Voltage Monitoring",

    titleTemplate: "%s | PrismGrid",

    description:
      "PrismGrid is a smart electrical protection and energy management platform that monitors voltage and current in real time, automatically disconnects unsafe power conditions, and protects electronic devices from electrical damage.",

    keywords: [
      "PrismGrid",
      "smart energy",
      "energy management",
      "voltage protection",
      "current protection",
      "voltage monitor",
      "current monitor",
      "over voltage protection",
      "under voltage protection",
      "over current protection",
      "electrical safety",
      "automatic power cutoff",
      "power monitoring",
      "smart relay",
      "electrical protection",
      "power management",
      "IoT energy monitoring",
      "industrial automation",
      "smart home",
      "electrical controller",
      "power quality",
      "voltage stabilizer",
      "energy controller",
      "circuit protection",
      "home appliance protection",
      "MCU based protection",
      "ESP32 energy monitor",
      "embedded systems",
    ],

    author: "PrismGrid",

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    category: "Technology",

    applicationName: "PrismGrid",

    generator: "Next.js",

    publisher: "PrismGrid",

    referrer: "origin-when-cross-origin",

    metadataBase: "https://prismgrid.com",

    canonical: "https://prismgrid.com",

    language: "en",

    locale: "en_US",
  },

  // OpenGraph
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PrismGrid",
    title: "PrismGrid | Smart Energy Protection",
    description:
      "Intelligent voltage and current monitoring with automatic electrical protection.",
    image: "/og-image.png",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    creator: "@prismgrid",
    site: "@prismgrid",
  },

  // Theme
  theme: {
    color: "#2563EB",
    background: "#FFFFFF",
    dark: "#0F172A",
    success: "#10B981",
  },

  // Brand Colors
  colors: {
    navy: "#0F172A",
    blue: "#2563EB",
    green: "#10B981",
    white: "#FFFFFF",
    black: "#000000",
  },

  // Assets
  assets: {
    logo: "/logo.svg",
    logoDark: "/logo-dark.svg",
    icon: "/icon.svg",
    favicon: "/favicon.ico",
    appleIcon: "/apple-touch-icon.png",
    manifest: "/site.webmanifest",
    ogImage: "/og-image.png",
  },

  // Product
  product: {
    category: "Energy Management",
    type: "Embedded Hardware + Software",

    features: [
      "Real-time voltage monitoring",
      "Real-time current monitoring",
      "Automatic over-voltage protection",
      "Automatic under-voltage protection",
      "Over-current protection",
      "Automatic relay cutoff",
      "Smart fault detection",
      "Electrical appliance protection",
      "Power quality monitoring",
      "Industrial-grade reliability",
      "IoT-ready architecture",
    ],
  },

  // Default Metadata
  metadata: {
    creator: "PrismGrid",
    publisher: "PrismGrid",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  },
} as const;

export type Brand = typeof brand;
