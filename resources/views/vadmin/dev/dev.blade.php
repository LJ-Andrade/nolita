@extends('vadmin.partials.main')
@section('title', 'Vadmin | DEV ZONE')

@section('styles')
    {!! Html::style('css/app.css') !!}
@endsection

@section('content')
	<div class="dashboard">
        <div class="content-body">
            <section id="global-settings" class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="icon-key"></i> DEV ZONE</h4>
                </div>
                
				<div class="card-body collapse in">
                    <div class="card-block">
                        <div class="card-text">
                            <div class="centered-form">
                                <a href="{{ url('vadmin/deleted-cart-log') }}"> Deleted Carts Log</a>

                                {{-- <form action="{{ url('/oauth/clients') }}" class="" method="POST">
                                    <label for="">Cliente</label>
                                    <input class="form-control" type="text" name="name" />
                                    <br>
                                    <label for="">Redirección</label>
                                    <input class="form-control" type="text" name="redirect" />
                                    <br>
                                    <button class="btn main-btn" type="submit" name="send">Enviar</butto>
                                    {{ csrf_field() }}
                                </form>
                                <br> --}}
                            
                            </div>
						</div>
					</div>
                </div>
                
           
			</section>
        </div>
	</div>
	<div id="Error"></div>
@endsection

@section('scripts')

@endsection


