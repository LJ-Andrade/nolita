import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Save, Loader2, Layout, Type, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Separator } from "@/components/ui/separator";

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
                
                if (contentMap['home_hero_banner']?.value) {
                    setHeroImage(getFullUrl(contentMap['home_hero_banner'].value));
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
        if (heroImage !== originalSettings['home_hero_banner']?.value) return true;
        return false;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let heroImageUrl = heroImage;

            // 1. Upload image if it's a new file
            if (heroImage instanceof File) {
                const formData = new FormData();
                formData.append('image', heroImage);
                formData.append('key', 'home_hero_banner');
                
                const { data: uploadData } = await axiosClient.post('/site-content/upload', formData);
                heroImageUrl = uploadData.url;
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
                    key: 'home_hero_banner',
                    value: heroImageUrl,
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
            if (contentMap['home_hero_banner']?.value) {
                setHeroImage(getFullUrl(contentMap['home_hero_banner'].value));
            }

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
                actions={
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
                }
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
                        <div className="grid gap-4">
                            <Label>{"Imagen de fondo"}</Label>
                            <div className="flex justify-center">
                                <ImageUpload 
                                    value={heroImage}
                                    onChange={(file) => setHeroImage(file)}
                                    aspect={21 / 9}
                                    className="w-full"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground text-center italic">
                                {"Sugerencia: Usar imágenes de 1920x800px o similares para mejor visualización."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
