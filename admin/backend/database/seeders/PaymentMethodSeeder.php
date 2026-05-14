<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Transerencia',
                'description' => "Caja de ahorro Banco Nación <br>
								A nombre de Georgina Giorgi <br>
								Cuit 27333493549 <br>
								CBU 0110201930020109390247 <br>
								ALIAS: nolitamayorista <br><br>

								Una vez realizada la transferencia, enviá el comprobante a<br>
								info@nolita.com.ar<br>
								Por favor, indicá en el asunto del mail tu número de pedido para que podamos identificar el pago más rápido.<br>
								Tu pedido comenzará a procesarse una vez acreditado el pago.",
                'status' => 'active',
                'fee' => 0,
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::firstOrCreate(
                ['name' => $method['name']],
                $method
            );
        }
    }
}
