<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VLog extends Model
{
    protected $table = "v_log";

    protected $fillable = ['name', 'details', 'data'];

    public static function saveLog($name = 'Sin Nombre', $details = 'Sin Detalle', $itemCreationDate)
    {
        $job = new VLog();
        $job->name = $name;
        $job->details = $details;
        $job->item_creation_date = $itemCreationDate;
        $job->save();
    }
}
