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
  "skin_light_card",
  "skin_light_card_foreground",
  "skin_light_card_border_color",
  "skin_light_card_shadow_color",
]

const SKIN_KEYS_DARK = [
  "skin_dark_sidebar_bg",
  "skin_dark_sidebar_foreground",
  "skin_dark_sidebar_accent",
  "skin_dark_sidebar_border",
  "skin_dark_gradient_start",
  "skin_dark_gradient_end",
  "skin_dark_card",
  "skin_dark_card_foreground",
  "skin_dark_card_border_color",
  "skin_dark_card_shadow_color",
]

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

      applySkinSettings(skinSettings)
    } catch (error) {
      console.error("Failed to load skin settings:", error)
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

    const root = document.documentElement
    skinKeys.forEach((key) => {
      const cssVarName = "--" + key.replace(/_/g, "-")
      const currentValue = root.style.getPropertyValue(cssVarName)
      if (currentValue) root.style.setProperty(cssVarName, currentValue)
    })
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
