<?php
    
//////////////////////////////////////////////
//         Numbers, Calcs. & Converts       //
//////////////////////////////////////////////

function validateValueLenght($data, $value)
{
    //
}

function brMe($text, $separator)
{
    $brText = explode($separator, $text);
    $finalText = '';
    foreach($brText as $item) {
        $finalText .= $item. '<br>';
    }
    return $finalText;
}

function showPrice($articlePrice, $articleDiscount)
{
    $price = calcValuePercentNeg($articlePrice, $articleDiscount);
    return $price;
}


function calcFinalPriceConvert($cost, $percent, $currencyActualValue)
{
    $percent = $cost * $percent / 100;
    $result  = $cost + $percent;
    $result  = $result * $currencyActualValue;
    return $result;
}

function calcArticlePrice($price, $discount)
{
    $result = $price + 0;
    
    if($discount > 0)
    {
        $percent = $price * $discount / 100;
        $result =  $price - $discount;
        $result = convertAndRoundDecimal($result, 2);
    }
    
    return $result;
}
    
function calcValuePercentNeg($price, $percent)
{
    $percent = $price * $percent / 100;
    $result =  $price - $percent;
    return convertAndRoundDecimal($result, 2);
}

function finalPriceRounded($price, $percent)
{
    $percent = $price * $percent / 100;
    $result =  $price - $percent;
    return ceil($result);
}

function calcValuePercentPos($price, $percent)
{
    $percent = $price * $percent / 100;
    $result =  $price + $percent;
    return convertAndRoundDecimal($result, 2);
}

function calcPercent($price, $percent)
{
    $percent = okNum($price) * floatVal($percent) / floatVal(100);
    $result = convertAndRoundDecimal($percent, 2);
    if($result == '0'){
        $result = '0.00';
    }
    return okNum($result);
}

function okNum($number)
{
    if(is_string($number)){
	$number = floatval(str_replace(',', '', $number));
    }
    return $number;
}

function formatNum($number, $digits)
{
    $root       = 10;
    $multiplier = pow($root, $digits);
    $result     = (($number * $multiplier)) / $multiplier;
    return number_format($result, $digits, '', '.');
}
    
function convertAndRoundDecimal($number, $precision)
{
    $number = floatval($number);
    $p      = pow(10, $precision);
    return ceil(round($number * $p, 1)) / $p; 
}
    
function calcFinalPrice($cost, $pje)
{
    $result = $cost * $pje / 100;
    $result = $result + $cost;
    return $result;
}




//////////////////////////////////////////////
//               Translations               //
//////////////////////////////////////////////

function roleTrd($role)
{
    // Roles: 1 Superadmin - 2 Admin - 3 User - 4 Guest
    switch ($role) {
        case 1:
            echo 'SuperAdmin';
            break;
        case 2:
            echo 'Admin';
            break;
        case 3:
            echo 'Usuario';
            break;
        case 4:
            echo 'Invitado';
            break;
        default:
            echo '';
            break;
    }
}

function groupTrd($group)
{   
    // Group: 1 Member - 2 Client - 3 ClientBig
    switch ($group) {
        case 1:
            echo 'Miembro';
            break;
        case 2:
            echo 'Cliente';
            break;
        case 3:
            echo 'Mayorísta';
            break;
        default:
            echo '';
            break;
    }
}

function transStatusCoupon($status)
{
    switch ($status) 
    {
        case 'Active':
            echo 'Activo';
            break;
        case 'Expired':
            echo 'Expirado';
            break;
        default:
            echo '';
            break;
    }
}

function clientGroupTrd($group)
{   
    // Group: 1 New - 2 SmallClient - 3 BigClient
    switch ($group) {
        case 1:
            echo 'Nuevo';
            break;
        case 2:
            echo 'Minorísta';
            break;
        case 3:
            echo 'Mayorísta';
            break;
        default:
            echo '';
            break;
    }
}


function orderStatusTrd($status)
{
    switch ($status) {
        case 'Active':
            echo '<span class="text-info">Activo</span>';
            break;
        case 'Process':
            echo '<span class="text-warning">Pendiente</span>';
            break;
        case 'Approved':
            echo '<span class="text-success">Aprobada</span>';
            break;
        case 'Canceled':
            echo '<span class="text-danger">Cancelada</span>';
            break;
        case 'Finished':
            echo '<span class="text-muted">Finalizada</span>';
            break;
        default:
            echo 'Sin traducción';
            break;
    }
}

function messageStatusTrd($status)
{
    switch ($status) {
        case '0':
            echo 'No leído';
            break;
        case '1':
            echo 'Leído';
            break;
        case '2':
            echo 'Pasado';
            break;
        case '3':
            echo 'Respondido';
            break;
        default:
            echo 'Sin estado';
            break;
    }
}

function transDateT($data)
{
    if($data != null){
        $a        = explode(' ', $data);
        $b        = explode('-', $a[0]);
        $date     = $b[2]."/".$b[1]."/".$b[0];
        return $date;
    } else {
        return '';
    }
}

function transDateAndTime($data)
{
    if($data != null){
        $a        = explode(' ', $data);
        $b        = explode('-', $a[0]);
        $pretime  = explode(':', $a[1]);
        $time     = $pretime[0].':'.$pretime[1];
        $date     = $b[2]."/".$b[1]."/".$b[0];
        $datetime = $date.' ('.$time.')';
        return $datetime;
    } else {
        return '';
    }
}

function transDateTO($data)
{
    if($data != null){
        $a        = explode('-', $data);
        $date     = $a[2].'/'.$a[1].'/'.$a[0];
        return $date;
    } else {
        return '';
    }
}

function getMonthName($month)
{
    switch ($month) {
        case '01':
        return 'Enero';
            break;
        case '02':
        return 'Febrero';
            break;
        case '03':
        return 'Marzo';
            break;
        case '04':
        return 'Abril';
            break;
        case '05':
        return 'Mayo';
            break;
        case '06':
        return 'Junio';
            break;
        case '07':
        return 'Julio';
            break;
        case '08':
        return 'Agosto';
            break;
        case '09':
        return 'Septiembre';
            break;
        case '10':
        return 'Octubre';
            break;
        case '11':
        return 'Noviembre';
            break;
        case '12':
        return 'Diciembre';
            break;
        default:
        return 'Sin Mes';
        break;
    }
}

//////////////////////////////////////////////
//             Misc. Functions              //
//////////////////////////////////////////////

function getPreviousUrl()
{
    $rawPreviousUrl = url()->previous();
    $previousUrl = explode( '?', $rawPreviousUrl);
    $previousUrl = end($previousUrl);
    return $previousUrl;
}

function getUrl()
{
    $url = $_SERVER['REQUEST_URI'];
    return $url;
}

// This class is for get View Name
// Ex of use = To show Active Menu Links
class Menu
{
    public static function activeMenu($uri='')
    {
     $active = '';
   
     if (Request::is(Request::segment(1) . '/' . $uri . '/*') || Request::is(Request::segment(1) . '/' . $uri) || Request::is($uri))
     {
      $active = 'active';
     }
   
     return $active;
    }   
}


//////////////////////////////////////////////
//              GENERATORS                  //
//////////////////////////////////////////////
function assign_rand_value($num) {

    // accepts 1 - 36
    switch($num) {
        case "1"  : $rand_value = "a"; break;
        case "2"  : $rand_value = "b"; break;
        case "3"  : $rand_value = "c"; break;
        case "4"  : $rand_value = "d"; break;
        case "5"  : $rand_value = "e"; break;
        case "6"  : $rand_value = "f"; break;
        case "7"  : $rand_value = "g"; break;
        case "8"  : $rand_value = "h"; break;
        case "9"  : $rand_value = "i"; break;
        case "10" : $rand_value = "j"; break;
        case "11" : $rand_value = "k"; break;
        case "12" : $rand_value = "l"; break;
        case "13" : $rand_value = "m"; break;
        case "14" : $rand_value = "n"; break;
        case "15" : $rand_value = "o"; break;
        case "16" : $rand_value = "p"; break;
        case "17" : $rand_value = "q"; break;
        case "18" : $rand_value = "r"; break;
        case "19" : $rand_value = "s"; break;
        case "20" : $rand_value = "t"; break;
        case "21" : $rand_value = "u"; break;
        case "22" : $rand_value = "v"; break;
        case "23" : $rand_value = "w"; break;
        case "24" : $rand_value = "x"; break;
        case "25" : $rand_value = "y"; break;
        case "26" : $rand_value = "z"; break;
        case "27" : $rand_value = "0"; break;
        case "28" : $rand_value = "1"; break;
        case "29" : $rand_value = "2"; break;
        case "30" : $rand_value = "3"; break;
        case "31" : $rand_value = "4"; break;
        case "32" : $rand_value = "5"; break;
        case "33" : $rand_value = "6"; break;
        case "34" : $rand_value = "7"; break;
        case "35" : $rand_value = "8"; break;
        case "36" : $rand_value = "9"; break;
    }
    return $rand_value;
}

function get_rand_alphanumeric($length) {
    if ($length>0) {
        $rand_id="";
        for ($i=1; $i<=$length; $i++) {
            mt_srand((double)microtime() * 1000000);
            $num = mt_rand(1,36);
            $rand_id .= assign_rand_value($num);
        }
    }
    return $rand_id;
}

function get_rand_numbers($length) {
    if ($length>0) {
        $rand_id="";
        for($i=1; $i<=$length; $i++) {
            mt_srand((double)microtime() * 1000000);
            $num = mt_rand(27,36);
            $rand_id .= assign_rand_value($num);
        }
    }
    return $rand_id;
}

function get_rand_letters($length) {
    if ($length>0) {
        $rand_id="";
        for($i=1; $i<=$length; $i++) {
            mt_srand((double)microtime() * 1000000);
            $num = mt_rand(1,26);
            $rand_id .= assign_rand_value($num);
        }
    }
    return strtoupper($rand_id);
}
