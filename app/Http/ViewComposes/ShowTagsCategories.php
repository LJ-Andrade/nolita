<?php 

namespace App\Http\ViewComposes;

use Illuminate\Contracts\View\View;
use App\Category;
use App\Tag;

class ShowTagsCategories
{
	public function compose(View $view)
	{
		$categories = Category::orderBy('name', 'desc')->get();
		$tags       = Tag::orderBy('name', 'asc')->get();
		
		$view->with('categories', $categories)->with('tags', $tags);
	}
}