<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CustomerCoupon extends Model
{
    protected $table = 'customer_coupons';

    protected $primaryKey = 'id';

    protected $fillable = ['customer_id', 'coupon_id'];
    
}
