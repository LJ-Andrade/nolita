import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, DollarSign, Save, Store } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function ShopConfigurationForm() {
  const [config, setConfig] = useState({ min_quantity: 0, min_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosClient.get("/shop-configuration")
      .then(({ data }) => {
        setConfig({
          min_quantity: data.data.min_quantity ?? 0,
          min_amount: data.data.min_amount ?? 0,
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error("Error al cargar la configuración");
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosClient.put("/shop-configuration", {
        min_quantity: Number(config.min_quantity),
        min_amount: Number(config.min_amount),
      });
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error("Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="p-8 text-center">{"Cargando..."}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={"Configuración"}
        breadcrumbs={[
          { label: 'TIENDA' },
          { label: "Configuración" },
        ]}
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {"Condiciones de compra"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="min_quantity" className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4" />
                {"Cantidad mínima de prendas"}
              </Label>
              <Input
                id="min_quantity"
                type="number"
                min={0}
                value={config.min_quantity}
                onChange={(e) => updateField('min_quantity', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="min_amount" className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                {"Monto mínimo de compra"}
              </Label>
              <Input
                id="min_amount"
                type="number"
                min={0}
                step="0.01"
                value={config.min_amount}
                onChange={(e) => updateField('min_amount', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {"Guardar cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
