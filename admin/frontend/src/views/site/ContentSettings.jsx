import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Save, Loader2, Type, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

const HERO_DESKTOP_KEY = 'home_hero_banner';
const HERO_MOBILE_KEY = 'home_hero_banner_mobile';

const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = axiosClient.defaults.baseURL.replace("/api", "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

export default function ContentSettings() {
    const [settings, setSettings] = useState({});
    const [originalSettings, setOriginalSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [heroImage, setHeroImage] = useState(null);
    const [heroMobileImage, setHeroMobileImage] = useState(null);

    const getOriginalImageUrl = (key) => {
        const value = originalSettings[key]?.value;
        return value ? getFullUrl(value) : null;
    };

    const hasImageChanged = (value, key) => {
        if (value instanceof File) return true;
        return (value || null) !== getOriginalImageUrl(key);
    };

    const getPersistedImageValue = (value, key) => {
        const originalValue = originalSettings[key]?.value || '';
        if (!value) return '';
        if (value === getOriginalImageUrl(key)) return originalValue;
        return value;
    };

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await axiosClient.get("/site-content", {
                    params: { section: 'home' }
                });
                const contentMap = {};
                data.data.forEach(item => {
                    contentMap[item.key] = item;
                });
                setSettings(contentMap);
                setOriginalSettings(contentMap);
                
                if (contentMap[HERO_DESKTOP_KEY]?.value) {
                    setHeroImage(getFullUrl(contentMap[HERO_DESKTOP_KEY].value));
                }
                if (contentMap[HERO_MOBILE_KEY]?.value) {
                    setHeroMobileImage(getFullUrl(contentMap[HERO_MOBILE_KEY].value));
                }
            } catch (error) {
                toast.error("Error al cargar el contenido");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    const hasChanges = () => {
        if (settings['home_top_text']?.value !== originalSettings['home_top_text']?.value) return true;
        if (hasImageChanged(heroImage, HERO_DESKTOP_KEY)) return true;
        if (hasImageChanged(heroMobileImage, HERO_MOBILE_KEY)) return true;
        return false;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let heroImageUrl = heroImage;
            let heroMobileImageUrl = heroMobileImage;

            // 1. Upload images when they are new files.
            if (heroImage instanceof File) {
                const formData = new FormData();
                formData.append('image', heroImage);
                formData.append('key', HERO_DESKTOP_KEY);
                
                const { data: uploadData } = await axiosClient.post('/site-content/upload', formData);
                heroImageUrl = uploadData.url;
            } else {
                heroImageUrl = getPersistedImageValue(heroImage, HERO_DESKTOP_KEY);
            }

            if (heroMobileImage instanceof File) {
                const formData = new FormData();
                formData.append('image', heroMobileImage);
                formData.append('key', HERO_MOBILE_KEY);

                const { data: uploadData } = await axiosClient.post('/site-content/upload', formData);
                heroMobileImageUrl = uploadData.url;
            } else {
                heroMobileImageUrl = getPersistedImageValue(heroMobileImage, HERO_MOBILE_KEY);
            }

            // 2. Bulk update content
            const contents = [
                {
                    key: 'home_top_text',
                    value: settings['home_top_text']?.value || '',
                    section: 'home',
                    type: 'text'
                },
                {
                    key: HERO_DESKTOP_KEY,
                    value: heroImageUrl,
                    section: 'home',
                    type: 'image'
                },
                {
                    key: HERO_MOBILE_KEY,
                    value: heroMobileImageUrl,
                    section: 'home',
                    type: 'image'
                }
            ];

            await axiosClient.put('/site-content/bulk', { contents });

            // Refresh settings
            const { data: newData } = await axiosClient.get("/site-content", {
                params: { section: 'home' }
            });
            const contentMap = {};
            newData.data.forEach(item => {
                contentMap[item.key] = item;
            });
            setSettings(contentMap);
            setOriginalSettings(contentMap);
            setHeroImage(contentMap[HERO_DESKTOP_KEY]?.value ? getFullUrl(contentMap[HERO_DESKTOP_KEY].value) : null);
            setHeroMobileImage(contentMap[HERO_MOBILE_KEY]?.value ? getFullUrl(contentMap[HERO_MOBILE_KEY].value) : null);

            toast.success("Contenido actualizado correctamente");
        } catch (error) {
            console.error("Save error:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Error al guardar los cambios");
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], value }
        }));
    };

    const renderSaveButton = () => (
        <Button
            type="submit"
            form="content-form"
            disabled={saving || !hasChanges()}
            className="shadow-md hover:shadow-lg transition-all"
        >
            {saving ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {"Guardando..."}
                </>
            ) : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    {"Guardar Cambios"}
                </>
            )}
        </Button>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">{"Cargando contenido..."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title={"Administración de Contenido"}
                breadcrumbs={[
                    { label: 'SITIO' },
                    { label: "Contenido" },
                ]}
                actions={renderSaveButton()}
            />

            <form id="content-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                {/* Top Text Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Type className="h-5 w-5 text-primary" />
                            {"Cabecera Superior (Top Bar)"}
                        </CardTitle>
                        <CardDescription>
                            {"Texto informativo que aparece en la parte más alta de la web."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="home_top_text">{"Texto a mostrar"}</Label>
                            <Input
                                id="home_top_text"
                                type="text"
                                value={settings.home_top_text?.value || ''}
                                onChange={(e) => updateSetting('home_top_text', e.target.value)}
                                placeholder="Ej: ¡Envío gratis en compras superiores a $50.000!"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Banner Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-primary" />
                            {"Banner Principal (Hero)"}
                        </CardTitle>
                        <CardDescription>
                            {"Imagen de impacto para la página de inicio."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="grid gap-3">
                                <div className="space-y-1">
                                    <Label>{"Imagen desktop"}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {"Se muestra en tablets horizontales, notebooks y pantallas grandes."}
                                    </p>
                                </div>
                                <ImageUpload 
                                    value={heroImage}
                                    onChange={(file) => setHeroImage(file)}
                                    aspect={21 / 9}
                                    className="w-full"
                                />
                                <p className="text-sm text-muted-foreground italic">
                                    {"Sugerencia: 1920x800px o similar."}
                                </p>
                            </div>

                            <div className="grid gap-3">
                                <div className="space-y-1">
                                    <Label>{"Imagen mobile"}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {"Se muestra en celulares. Si falta, se usa la imagen desktop."}
                                    </p>
                                </div>
                                <ImageUpload
                                    value={heroMobileImage}
                                    onChange={(file) => setHeroMobileImage(file)}
                                    aspect={4 / 5}
                                    className="w-full"
                                />
                                <p className="text-sm text-muted-foreground italic">
                                    {"Sugerencia: 1080x1350px o similar."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    {renderSaveButton()}
                </div>
            </form>
        </div>
    );
}
