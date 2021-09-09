<?php 

namespace App\Http\ViewComposes;

use Illuminate\Contracts\View\View;
use App\CatalogTag;
use App\CatalogAtribute1;

class ShowCatTagsAtrib
{
	public function compose(View $view)
	{
		$tags = CatalogTag::orderBy('name', 'desc')->get();
		$atributes1 = CatalogAtribute1::orderBy('name', 'asc')->get();
		
		$view->with('tags', $tags)->with('atributes1', $atributes1);
	}
}