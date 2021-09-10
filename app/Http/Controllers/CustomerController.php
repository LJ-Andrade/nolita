<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Customer;
use App\GeoProv;
use Auth;
use Image;
use Cookie;
use Excel;
// use File;
use PDF;
use Carbon\Carbon;

class CustomerController extends Controller
{

    /*
    |--------------------------------------------------------------------------
    | DISPLAY
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {    
        $pagination = $this->getSetPaginationCookie($request->get('results'));
        $group = $request->get('group');
        $status = $request->get('status');
        // Name is name, surname, username, email
        $name  = $request->get('name');
        
        $order = 'DESC';
        $orderBy = 'created_at';

        if($request->order)
            $order = $request->order;
        if($request->orderBy)
            $orderBy = $request->orderBy;

        if(isset($group) && isset($status)){
            $items = Customer::searchGroupStatus($group, $status)->orderBy($orderBy, $order)->paginate($pagination);    
        }
        elseif(isset($name))
        {
            $items = Customer::searchName($name)->orderBy($orderBy, $order)->paginate($pagination); 
        }
        elseif(isset($group))
        {
            $items = Customer::searchGroup($group)->orderBy($orderBy, $order)->paginate($pagination); 
        }
        else 
        {
            $items = Customer::orderBy($orderBy, $order)->paginate($pagination); 
        }


        return view('vadmin.customers.index')
            ->with('items', $items)
            ->with('name', $name)
            ->with('group', $group);
    }

    public function getSetPaginationCookie($request)
    {
       
        if($request)
        {
            Cookie::queue('store-pagination', $request, 2000);
            $pagination = $request;
        }
        else
        {   
            if(Cookie::get('store-pagination'))
            {
                $pagination = Cookie::get('store-pagination');
            }
            else{
                $pagination = 24;
            }
        } 
        return $pagination;
    }

    
    public function show($id)
    {
        $customer = Customer::findOrFail($id);
        return view('vadmin.customers.show', compact('customer'));
    }

    /*
    |--------------------------------------------------------------------------
    | EXPORT
    |--------------------------------------------------------------------------
    */

    public function exportPdf($params, $action)
    {   
        $items = $this->getData($params);
        $pdf = PDF::loadView('vadmin.customers.invoice-pdf', array('items' => $items));
        $pdf->setPaper('A4', 'landscape');
        if($action == 'stream')
            return $pdf->stream('listado-clientes.pdf');

        return $pdf->download('listado-de-clientes.pdf');
        
    }

    public function exportSheet($params, $format)
    {
        $items = $this->getData($params);
        Excel::create('listado-de-clientes', function($excel) use($items){
            $excel->sheet('Listado', function($sheet) use($items) {   
                $sheet->loadView('vadmin.customers.invoice-sheet', 
                compact('items'));
            });
        })->export($format);
    }

    public function exportByPeriod(Request $request)
    {   
        $filename = 'Clientes(' . date("d-m-Y", strtotime($request->from)) .'-a-'.date("d-m-Y", strtotime($request->to)) . ')';
        
        $items = Customer::whereBetween('created_at', [$request->from, $request->to])->get();
        $dates = [ 'from' => date("d-m-Y", strtotime($request->from)), 'to' => date("d-m-Y", strtotime($request->to))];
        
        Excel::create($filename, function($excel) use($items, $dates){
            $excel->sheet('Listado', function($sheet) use($items, $dates) {   
                $sheet->loadView('vadmin.customers.invoice-sheet', 
                compact('items', 'dates'));
            });
        })->download('xlsx');

    }

    public function exportForGmail(Request $request)
    {
        if($request->init_date != null && $request->expire_date != null)
        {
            $items = Customer::whereBetween('created_at', [new Carbon($request->init_date), new Carbon($request->expire_date)])
                ->orderBy('created_at', 'DESC')->get();
        }
        else if($request->init_date != '')
        {
            $items = Customer::where('created_at', '>=', new Carbon($request->init_date))
                ->orderBy('created_at', 'DESC')->get();
        }
        else
        {
            $items = Customer::all();
        }

        // dd($items);
        
        Excel::create('listado-de-clientes', function($excel) use($items){
            $excel->sheet('Listado', function($sheet) use($items) {   
                $sheet->loadView('vadmin.customers.exportForGmail', 
                compact('items'));
            });
        })->export("CSV");
    }

    // Export only customers with no orders
    public function exportSleepCustomers(Request $request)
    {
        // $customers = $this->getSleepCustomers();

        if($request->init_date != null && $request->expire_date != null)
        {
            $items = Customer::has('carts', '==', '0')->whereBetween('created_at', [new Carbon($request->init_date), new Carbon($request->expire_date)])
                ->orderBy('created_at', 'DESC')->get();
        }
        else if($request->init_date != '')
        {
            $items = Customer::has('carts', '==', '0')->where('created_at', '>=', new Carbon($request->init_date))
                ->orderBy('created_at', 'DESC')->get();
        }
        else
        {
            $items = Customer::has('carts', '==', '0')->orderBy('created_at', 'DESC')->get();
        }

        // return view('vadmin.customers.sandbox')->with('items', $items);

        Excel::create('listado-de-clientes', function($excel) use($items){
            $excel->sheet('Listado', function($sheet) use($items) {   
                $sheet->loadView('vadmin.customers.exportCustomerOrders', 
                compact('items'));
            });
        })->export("CSV");
    }

    // Exports All customer orders
    public function exportCustomersOrders(Request $request)
    {
        if($request->init_date != null && $request->expire_date != null)
        {
            $items = Customer::whereHas('carts', function($subQuery) {
                $subQuery->where('status', '!=', 'Active')->where('status', '!=', 'Canceled');
              })
              ->whereBetween('created_at', [new Carbon($request->init_date), new Carbon($request->expire_date)])
              ->orderBy('created_at', 'DESC')->get();
            // $items = Customer::has('carts', '==', '0')->whereBetween('created_at', [new Carbon($request->init_date), new Carbon($request->expire_date)])
            //     ->orderBy('created_at', 'DESC')->get();
        }
        else if($request->init_date != '')
        {
            $items = Customer::whereHas('carts', function($subQuery) {
                $subQuery->where('status', '!=', 'Active')->where('status', '!=', 'Canceled');
              })
                ->where('created_at', '>=', new Carbon($request->init_date))
                ->orderBy('created_at', 'DESC')->get();

            // $items = Customer::whereHas('carts', '==', '0')->where('created_at', '>=', new Carbon($request->init_date))
            //     ->orderBy('created_at', 'DESC')->get();
        }
        else
        {
            $items = Customer::whereHas('carts', function($subQuery) {
                $subQuery->where('status', '!=', 'Active')->where('status', '!=', 'Canceled');
              })->get();
        }

        // return view('vadmin.customers.sandbox')->with('items', $items);


        Excel::create('listado-de-clientes', function($excel) use($items){
            $excel->sheet('Listado', function($sheet) use($items) {   
                $sheet->loadView('vadmin.customers.exportCustomerOrders', 
                compact('items'));
            });
        })->export("CSV");
    }


    public function getData($params)
    {
        if($params == 'all'){
            $items = Customer::orderBy('id', 'ASC')->get(); 
            return $items;
        }

        parse_str($params , $query);
        if(isset($query['name'])){
            return $items = Customer::searchname($query['name'])->orderBy('id', 'ASC')->get(); 
        }

        if(isset($query['group'])){
            return $items = Customer::searchGroup($query['group'])->orderBy('id', 'ASC')->get();
        } 
        

        $items = Customer::orderBy('id', 'ASC')->get(); 
        return $items;
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    public function create()
    {
        $geoprovs = GeoProv::pluck('name','id');

        return view('vadmin.customers.create')
            ->with('geoprovs',$geoprovs);
    }

    public function store(Request $request)
    {
        $customer = new Customer($request->all());
        $this->validate($request,[
            'name'           => 'required',
            'email'          => 'min:3|max:250|required|unique:customers,email',
            'password'       => 'min:4|max:12listado-usuarios0|required|',   
        ],[
            'email.required' => 'Debe ingresar un email',
            'email.unique'   => 'El email ya existe',
            'password'       => 'Debe ingresar una contraseña',
        ]);

        if($request->file('avatar') != null){
            $avatar   = $request->file('avatar');
            $filename = $customer->username.'.jpg';
            Image::make($avatar)->encode('jpg', 80)->fit(300, 300)->save(public_path('images/customers/'.$filename));
            $customer->avatar = $filename;
        }

        $customer->password = bcrypt($request->password);
        $customer->save();

        return redirect('vadmin/customers')->with('message', 'Cliente creado correctamente');
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    public function edit($id)
    {
        $geoprovs = GeoProv::pluck('name','id');
        $customer = Customer::findOrFail($id);
        
        return view('vadmin.customers.edit')
        ->with('geoprovs',$geoprovs)
        ->with('customer',$customer);
    }
    
    public function update(Request $request, $id)
    {
        // dd($request->all());
        if($request->dni != NULL)
        {
            $this->validate($request,[
                'dni' => 'digits:8|unique:customers,dni,'.$id
            ]);
        }
        
        if($request->cuit != null )
        {
            $this->validate($request,[
                'cuit' => 'digits:11|unique:customers,cuit,'.$id
            ]);
        }
            
        
        $customer = Customer::findOrFail($id);
        $this->validate($request,[
            'name' => 'required|max:255',
            'username' => 'required|max:20|unique:customers,username,'.$customer->id,
            'email' => 'required|email|max:255|unique:customers,email,'.$customer->id,
            // 'cuit' => 'digits:11|int|unique:customers,cuit,'.$customer->id,
            // 'password' => 'required|min:6|confirmed',
        ],[
            'name.required' => 'Debe ingresar un nombre',
            'username.required' => 'Debe ingresar un nombre de usuario',
            'username.unique' => 'El nombre de usuario ya está siendo utilizado',
            'email.required' => 'Debe ingresar un email',
            'email.unique' => 'El email ya existe',
            'password.min' => 'El password debe tener al menos :min caracteres',
            'password.required' => 'Debe ingresar una contraseña',
            // 'password.confirmed' => 'Las contraseñas no coinciden',
        ]);

        $customer->fill($request->all());
        // $customer->password = bcrypt($request->password);

        if($request->file('avatar') != null){
            $avatar   = $request->file('avatar');
            $filename = $customer->username.'.jpg';
            Image::make($avatar)->encode('jpg', 80)->fit(300, 300)->save(public_path('images/customers/'.$filename));
            $customer->avatar = $filename;
        }

        $customer->save();

        return redirect('vadmin/customers')->with('Message', 'Cliente '. $customer->name .'editado correctamente');
    }

    // ---------- Update Avatar --------------- //


    public function updateCustomerAvatar(Request $request)
    {
        if ($request->hasFile('avatar')) {
            $customer = Customer::findOrFail(Auth::guard('customer')->user()->id);
            $avatar = $request->file('avatar');
            $filename = $customer->id.'.jpg';

            $path = public_path('webimages/customers/');
            try{
                if (!file_exists($path)) {
                    $oldmask = umask(0);
                    mkdir($path, 0777);
                    umask($oldmask);
                }
                
                Image::make($avatar)->encode('jpg', 80)->fit(300, 300)->save($path.$filename);
                $customer->avatar = $filename;
                $customer->save();

                return back();
            }   catch(\Exception $e){
                dd($e);
            }
        }
    }

    public function updateCustomerGroup(Request $request)
    {
        $customer = Customer::find($request->id);
        $customer->group = $request->group;
        $customer->save();

        return response()->json([
            'success'   => true,
            'message'   => 'Grupo actualizado'
        ]);    
    }
    /*
    |--------------------------------------------------------------------------
    | DESTROY
    |--------------------------------------------------------------------------
    */


    public function destroy(Request $request)
    {   
        
        $ids = json_decode('['.str_replace("'",'"',$request->id).']', true);
        
        try {
            foreach ($ids as $id) {
                $record = Customer::find($id);
                $record->delete();
            }
            return response()->json([
                'success'   => true,
            ]); 
        }  catch (\Exception $e) {
            return response()->json([
                'success'   => false,
                'error'    => 'Error: '.$e
            ]);    
        }
        
    }
}
