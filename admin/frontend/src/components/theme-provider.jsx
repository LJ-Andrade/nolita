import { createContext, useContext, useEffect, useState } from "react"
import axiosClient from "@/lib/axios"

const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
})

const SKIN_KEYS_LIGHT = [
  "skin_light_sidebar_bg",
  "skin_light_sidebar_foreground",
  "skin_light_sidebar_accent",
  "skin_light_sidebar_border",
  "skin_light_gradient_start",
  "skin_light_gradient_end",
]

const SKIN_KEYS_DARK = [
  "skin_dark_sidebar_bg",
  "skin_dark_sidebar_foreground",
  "skin_dark_sidebar_accent",
  "skin_dark_sidebar_border",
  "skin_dark_gradient_start",
  "skin_dark_gradient_end",
]

const DEFAULT_SKIN_VALUES = {
  skin_light_sidebar_bg: "#f0f0f0",
  skin_light_sidebar_foreground: "#333333",
  skin_light_sidebar_accent: "#d9d9d9",
  skin_light_sidebar_border: "#d1d5db",
  skin_light_gradient_start: "#e0e7ff",
  skin_light_gradient_end: "#f5f5f5",
  skin_dark_sidebar_bg: "#0d0d14",
  skin_dark_sidebar_foreground: "#f5f5f5",
  skin_dark_sidebar_accent: "#1e1e2a",
  skin_dark_sidebar_border: "#1e1e2a",
  skin_dark_gradient_start: "#313159",
  skin_dark_gradient_end: "#232334",
}

function getResolvedTheme(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return theme
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  )
  const [skinLoaded, setSkinLoaded] = useState(false)

  const applySkinSettings = (skinData) => {
    const root = document.documentElement
    Object.entries(skinData).forEach(([key, value]) => {
      const cssVarName = "--" + key.replace(/_/g, "-")
      root.style.setProperty(cssVarName, value)
    })
  }

  const loadSkinSettings = async () => {
    try {
      const { data } = await axiosClient.get("/system-settings")
      const skinSettings = {}
      data.data.forEach((setting) => {
        if (setting.key.startsWith("skin_")) {
          skinSettings[setting.key] = setting.value
        }
      })

      const allKeys = [...SKIN_KEYS_LIGHT, ...SKIN_KEYS_DARK]

      const skinData = {}
      allKeys.forEach((key) => {
        skinData[key] = skinSettings[key] || DEFAULT_SKIN_VALUES[key] || ""
      })
      applySkinSettings(skinData)
    } catch (error) {
      console.error("Failed to load skin settings:", error)
      const resolvedTheme = getResolvedTheme(theme)
      const skinKeys = resolvedTheme === "dark" ? SKIN_KEYS_DARK : SKIN_KEYS_LIGHT
      const fallbackData = {}
      skinKeys.forEach((key) => {
        fallbackData[key] = DEFAULT_SKIN_VALUES[key] || ""
      })
      applySkinSettings(fallbackData)
    } finally {
      setSkinLoaded(true)
    }
  }

  useEffect(() => {
    loadSkinSettings()
  }, [])

  const reloadSkinSettings = () => {
    setSkinLoaded(false)
    loadSkinSettings()
  }

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    if (!skinLoaded) return

    const resolvedTheme = getResolvedTheme(theme)
    const skinKeys = resolvedTheme === "dark" ? SKIN_KEYS_DARK : SKIN_KEYS_LIGHT

    const skinData = {}
    skinKeys.forEach((key) => {
      const currentValue = document.documentElement.style.getPropertyValue(
        "--" + key.replace(/_/g, "-")
      )
      skinData[key] = currentValue || DEFAULT_SKIN_VALUES[key] || ""
    })
    applySkinSettings(skinData)
  }, [theme, skinLoaded])

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
    reloadSkinSettings,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
