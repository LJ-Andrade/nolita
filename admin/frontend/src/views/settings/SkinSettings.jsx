import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Palette, RotateCcw, Save, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSkinSettings } from '@/hooks/useSkinSettings';
import { useTheme } from '@/components/theme-provider';
import { PageHeader } from '@/components/page-header';

const SKIN_FIELDS = [
  { key: 'sidebar_bg', label: 'Sidebar Background' },
  { key: 'sidebar_foreground', label: 'Sidebar Text' },
  { key: 'sidebar_accent', label: 'Sidebar Accent' },
  { key: 'sidebar_border', label: 'Sidebar Border' },
  { key: 'gradient_start', label: 'Gradient Start' },
  { key: 'gradient_end', label: 'Gradient End' },
  { key: 'card', label: 'Card Background' },
  { key: 'card_foreground', label: 'Card Text' },
  { key: 'card_border_color', label: 'Card Border' },
  { key: 'card_shadow_color', label: 'Card Shadow' },
];

const getResolvedTheme = (theme) => {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const isHexColor = (value) => /^#[0-9a-fA-F]{6}$/.test(value);

export default function SkinSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, loading, saving, updateSetting, saveSkinSettings, resetToDefaults, defaultValues } = useSkinSettings();
  const [activeTheme, setActiveTheme] = useState(() => getResolvedTheme(theme));

  useEffect(() => {
    setActiveTheme(getResolvedTheme(theme));
  }, [theme]);

  const getValue = (theme, field) => {
    const key = `skin_${theme}_${field}`;
    return settings[key]?.value || defaultValues[key] || '';
  };

  const handleSave = async () => {
    const skinData = {};
    const themes = ['light', 'dark'];
    
    themes.forEach(t => {
      SKIN_FIELDS.forEach(({ key }) => {
        skinData[`skin_${t}_${key}`] = getValue(t, key);
      });
    });

    const success = await saveSkinSettings(skinData);
    if (success) {
      toast.success("Configuración guardada correctamente");
    } else {
      toast.error("Ocurrió un error");
    }
  };

  const handleReset = async () => {
    const success = await resetToDefaults();
    if (success) {
      toast.success("Valores restaurados correctamente");
    } else {
      toast.error("Ocurrió un error");
    }
  };

  const renderColorField = (theme, fieldKey, label) => {
    const value = getValue(theme, fieldKey);
    const pickerValue = isHexColor(value) ? value : '#ffffff';

    return (
      <div key={`${theme}-${fieldKey}`} className="flex items-center gap-4">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => updateSetting(`skin_${theme}_${fieldKey}`, e.target.value)}
          className="h-10 w-10 rounded-full border border-input cursor-pointer"
        />
        <div className="flex-1 space-y-1">
          <Label htmlFor={`${theme}-${fieldKey}`} className="text-sm font-medium">
            {label}
          </Label>
          <input
            type="text"
            id={`${theme}-${fieldKey}`}
            value={value}
            onChange={(e) => updateSetting(`skin_${theme}_${fieldKey}`, e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="#000000"
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">{"Cargando..."}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={"Personalización de Skin"}
        breadcrumbs={[
          { label: 'CONFIGURACIÓN' },
          { label: "Apariencia" },
        ]}
      />

      <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => {
            setTheme('light');
            setActiveTheme('light');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTheme === 'light'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sun className="h-4 w-4" />
          {"Modo Claro"}
        </button>
        <button
          onClick={() => {
            setTheme('dark');
            setActiveTheme('dark');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTheme === 'dark'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Moon className="h-4 w-4" />
          {"Modo Oscuro"}
        </button>
      </div>

      <Card className="max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>
              {activeTheme === 'light' ? "Modo Claro" : "Modo Oscuro"}
            </CardTitle>
            <CardDescription>
              {activeTheme === 'light' ? "Colores para el tema claro" : "Colores para el tema oscuro"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              disabled={saving}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {"Reset"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              {"Guardar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {SKIN_FIELDS.map(({ key, label }) =>
            renderColorField(activeTheme, key, label)
          )}
        </CardContent>
      </Card>

    </div>
  );
}
