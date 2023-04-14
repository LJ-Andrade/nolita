<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Contact;
use App\Cart;
use App\CatalogArticle;
use App\Customer;
use App\User;
use App\Settings;
use App\Mail\SendSupportMail;
use App\Mail\SendMail;
use Mail;


class VadminTestsController extends Controller
{   
    public function __construct()
    {
        $this->middleware('auth:user');
    }
    

    public function tests()
    {
        $carts = Cart::where('status','ACTIVE')->get();
        return view('vadmin.tools.tests')->with('carts', $carts);
    }

    public function devZone()
    {
        return view('vadmin.dev.dev');
    }

    public function testMailSending(Request $request)
    {
        $class = $request->mailclass;

        try 
        {
            Mail::to($request->maildestiny)->send(new SendMail("Mail de prueba", 'SimpleMail', "Este es un mail de prueba, no responder, gracias."));
            return back()->with('message', 'Mail enviado?');
        } 
        catch (\Exception $e) 
        {
            return back()->with('message', $e->getMessage());
        }
    }  

    public function testImageUpload(Request $request)
    {
        // dd($request->all());
        
        $imgPath = public_path("webimages/imgTest/");
    
        $FileUploader = new FileUploader('files', array(
            'uploadDir' => $imgPath
        ));
        // call to upload the files
        $data = $FileUploader->upload();
        dd($data);
        $path = $data['files'][0]['file'];
        
        // $path = '/var/www/html/kelolahunian/public/storage/' . $title;
        $uploader = Upload::upload($path);
        $url = $uploader->url;
        // dd($uploader);
        
        echo json_encode($url);

    }
    
    public function deletedCartsLog()
    {
        $logs = \App\VLog::paginate(100);
        return view('vadmin.dev.deleted-carts-log', compact('logs'));

    }

}
