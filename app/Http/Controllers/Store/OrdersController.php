<?php

namespace App\Http\Controllers\Store;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Customer;
use App\Traits\CartTrait;
use App\Shipping;
use App\Payment;
use App\User;
use App\Cart;
use App\CartItem;
use App\CatalogArticle;
use PDF;
use Excel;

class OrdersController extends Controller
{
    use CartTrait;

    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {          
        if($request->id != null)
        {
            $items = Cart::searchId($request->id)->orderBy('id', 'ASC')->paginate(15); 
        } 
        else if($request->status != null)
        {
            if($request->status == 'All')
            {
                $items = Cart::orderBy('created_at', 'DESC')->where('status', '!=','Active')->paginate(15);
            } else {
                $items = Cart::searchStatus($request->status)->orderBy('created_at', 'DESC')->paginate(15);
            }
        } else {
            $items = Cart::orderBy('created_at', 'DESC')->where('status', '=','Process')->paginate(15);
        }

        return view('vadmin.orders.index')->with('items', $items);    
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        try
        {
            $cart = Cart::findOrFail($id);
        } 
        catch(\Exception $e)
        {
            return redirect()->back()->with('message', 'Error: '.$e->getMessage());
        }
        $customer = Customer::find($cart->customer_id);
        
        $order = $this->calcCartData($cart);
        return view('vadmin.orders.show')
            ->with('order', $order)
            ->with('customer', $customer);
    }

    /*
    |--------------------------------------------------------------------------
    | EXPORT
    |--------------------------------------------------------------------------
    */

    // DOWNLOAD INVOICE PDF
    public function downloadInvoice($id, $action)
    {
        $view = 'vadmin.orders.invoicePdf';
        // Return Options
        // return $pdf->dowload($filename.'.pdf');
        // return $pdf->stream($filename.'.pdf');
        $order = Cart::find($id);
        if($order != null){
            $cart = $this->calcCartData($order);
            $pdf = PDF::loadView($view, compact('order', 'cart'))->setPaper('a4', 'portrait');
            $filename = 'Comprobante-Pedido-N-'.$order->id;
            if($action == 'stream')
            {
                return $pdf->stream($filename.'.pdf');
            } else {
                return $pdf->download($filename.'.pdf');
            }
            die();

        } else {
            return redirect()->route('store')->with('message','Estás intentando una acción ilegal...');
        }
    }
    

    public function exportOrderXls($id)
    {   
        $order = $this->calcCartData(Cart::find($id));
        Excel::create('Pedido-'.$id, function($excel) use($order){
            $excel->sheet('Listado', function($sheet) use($order) { 
                $sheet->getDefaultStyle()->getFont()->setName('Arial');
                $sheet->getDefaultStyle()->getFont()->setSize(12);
                $sheet->getColumnDimension()->setAutoSize(true);
                $sheet->loadView('vadmin.orders.invoiceXls', 
                compact('order'));
            });
        })->export('xlsx');         
    }

    public function exportOrderCsv($id)
    {   
        $order = $this->calcCartData(Cart::find($id));
        $filename = 'Pedido-'.$id.'-Cliente-'.$order['rawdata']->customer->name.' '.$order['rawdata']->customer->surname;
        Excel::create($filename, function($excel) use($order){
            $excel->sheet('Listado', function($sheet) use($order) { 
                $sheet->getDefaultStyle()->getFont()->setName('Arial');
                $sheet->getDefaultStyle()->getFont()->setSize(12);
                $sheet->getColumnDimension()->setAutoSize(true);
                $sheet->getRowDimension(2)->setRowHeight(20);
                $sheet->loadView('vadmin.orders.invoiceXls', 
                compact('order'));
            });
        })->export('csv');         
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    // public function create(Request $request)
    // {
    //     $shippings = Shipping::orderBy('name', 'ASC')->pluck('name', 'id');
    //     $payment_methods = Payment::orderBy('name', 'ASC')->pluck('name', 'id');
    //     $sellers = User::pluck('name', 'id');

    //     return view('vadmin.orders.create')
    //         ->with('sellers', $sellers)
    //         ->with('shippings', $shippings)
    //         ->with('payment_methods', $payment_methods);
    // }

    public function create(Request $request)
    {
        $shippings = Shipping::orderBy('name', 'ASC')->pluck('name', 'id');
        $shippingData = Shipping::orderBy('name', 'ASC')->get();
        $paymentData = Payment::orderBy('name', 'ASC')->get();
        $payment_methods = Payment::orderBy('name', 'ASC')->pluck('name', 'id');
        $sellers = User::pluck('name', 'id');
        $existingOrder = [];
        
        return view('vadmin.orders.create')
            ->with('existingOrder', $existingOrder)
            ->with('sellers', $sellers)
            ->with('shippings', $shippings)
            ->with('shippingData', $shippingData)
            ->with('paymentData', $paymentData)
            ->with('payment_methods', $payment_methods);
    }
    
    public function store(Request $request)
    {   
        // dd($request->all());
        if($request->payment_method_id == null || $request->shipping_id == null)
            return back()->with('message', 'Debe ingresar método de pago y envío');
            
        // Store Cart
        $cart = new Cart();
        $cart->status = 'Approved';
        
        //Set Payment Method
        $cart->payment_method_id = $request->payment_method_id;
        $payment_percent = Payment::where('id', $request->payment_method_id)->first()->percent;
        $cart->payment_percent = $payment_percent;
 
        // Set Shipping Method
        $cart->shipping_id = $request->shipping_id;
        $shipping_price = Shipping::where('id', $request->shipping_id)->first()->price;
        $cart->shipping_price = $shipping_price;

        $cart->customer_id = $request->customer_id;
        
        $cart->save();
        $cart_id = $cart->id;

        
        foreach($request->item as $item)
        {
            $cartItem = new CartItem();
            $cartItem->cart_id = $cart_id;
            $cartItem->article_name = $item['name'];
            $cartItem->article_id = $item['id'];
            $cartItem->variant_id = $item['variant_id'];
            $cartItem->quantity = $item['quantity'];
            $cartItem->combination = $item['combination'];
            $cartItem->color = $item['color'];
            $cartItem->size = $item['size'];
            $cartItem->textile = $item['textile'];
            $cartItem->final_price = $item['final_price'];

            $cartItem->save();   
            $this->updateVariantStock($item['variant_id'], -$item['quantity']); 
        }
        
        return redirect()->route('orders.index', ['status' => 'All'])->with('message','Pedido cargado exitosamente');
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    public function edit($id)
    {
        $existingOrder = Cart::find($id);

        $shippings = Shipping::orderBy('name', 'ASC')->pluck('name', 'id');
        $shippingData = Shipping::orderBy('name', 'ASC')->get();
        $paymentData = Payment::orderBy('name', 'ASC')->get();
        $payment_methods = Payment::orderBy('name', 'ASC')->pluck('name', 'id');
        $sellers = User::pluck('name', 'id');

        return view('vadmin.orders.create')
            ->with('existingOrder', $existingOrder)
            ->with('sellers', $sellers)
            ->with('shippings', $shippings)
            ->with('shippingData', $shippingData)
            ->with('paymentData', $paymentData)
            ->with('payment_methods', $payment_methods);

        // return view('vadmin.orders.edit')->with('order', $order);
    }

    public function update(Request $request, $id)
    {
        if($request->payment_method_id == null || $request->shipping_id == null)
            return back()->with('message', 'Debe ingresar método de pago y envío');

        // dd($request->all());
        $order = Cart::find($id);
        $order_id = $order->id;
        
        try
        {
            $order->fill($request->all());
            $order->save();
        }
        catch (\Exception $e) 
        {
            dd("Error editando pedido." . $e->getMessage());
        }
            
        foreach($request->item as $item)
        {
            // dd($item);
            // dd("Order id: " . $order_id . ' | Item id: ' . $item['id']);
            $existingItem = CartItem::where('id', $item['id'])->first();
            if($existingItem)
            {
                $existingItem->fill($item);
                $existingItem->save();
                try
                {
                    $existingItem->save(); 
                    $this->updateVariantStock($item['variant_id'], -$item['quantity']); 
                }
                catch (\Exception $e) 
                {
                    dd("Error editando item existente: " . $e->getMessage());
                }
            }
            else
            {
                $cartItem = new CartItem();
                $cartItem->cart_id = $order_id;
                $cartItem->article_name = $item['name'];
                $cartItem->article_id = $item['id'];
                $cartItem->variant_id = $item['variant_id'];
                $cartItem->quantity = $item['quantity'];
                $cartItem->combination = $item['combination'];
                $cartItem->color = $item['color'];
                $cartItem->size = $item['size'];
                $cartItem->textile = $item['textile'];
                $cartItem->final_price = $item['final_price'];
                
                try
                {
                    $cartItem->save(); 
                    $this->updateVariantStock($item['variant_id'], -$item['quantity']); 
                }
                catch (\Exception $e) 
                {
                    dd("Error agregando item." . $e->getMessage());
                }
            }
        }
            
        return redirect()->back()->with('message','Pedido editado');
    } 

}