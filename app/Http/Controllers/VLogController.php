<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class VLogController extends Controller
{
    public function index()
    {
        return view('vadmin.v-log');
    }

    public function create(Request $request)
    {
        $job = new VLog::($request->all());
        $job->save();
    }

    public function store(Request $request)
    {
        
    }
}
