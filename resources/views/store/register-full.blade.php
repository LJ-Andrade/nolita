@extends('store.partials.main')

@section('styles')
    <style>
        body {
            background: url("{{ asset('images/web/background.jpg') }}") no-repeat center top fixed;
	        -webkit-background-size: cover;
	        -moz-background-size: cover;
	        -o-background-size: cover;
	        background-size: cover;
        }    
    </style>
@endsection

@section('content')
<div class="container padding-bottom-3x">
	<div class="row centered-form">
        <form id="RegisterForm" class="login-box form-simple inner" method="POST" action="{{ route('customer.process-register') }}">
            {{ csrf_field() }}
            <input id="IsResellerCheckbox" type="checkbox" name="isreseller" class="Hidden">
            <div class="NormaClientTitle">
                <h3 class="text-center">Registro de Usuario</h3>
            </div>
            <div class="ResellerTitle text-center" style="display: none">
                <a class="top-right-element cursor-pointer" onClick="closeResellerRegistration();">Volver</a>
                <h3>Registro de Usuario Mayorísta</h3>
                <p>Complete todos los datos</p>
            </div>
            <div class="row">
                {{-- USERNAME --}}
                <div class="col-sm-6 form-group{{ $errors->has('username') ? ' has-error' : '' }}">
                    <label for="reg-fn">Nombre de Usuario (Apodo)</label>
                    <input id="username" type="text" name="username" class="form-control round" placeholder="Ingrese su nombre de usuario" value="{{ old('username') }}" required>
                    @if ($errors->has('username'))
                        <span class="help-block">
                            <strong>{{ $errors->first('username') }}</strong>
                        </span>
                    @endif
                </div> 	
                {{-- EMAIL --}}
                <div class="col-sm-6 form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                    <label for="reg-fn">E-Mail</label>
                    <input type="text" name="email" class="form-control round" placeholder="Ingrese su email" value="{{ old('email') }}" required>
                    @if ($errors->has('email'))
                        <span class="help-block">
                            <strong>{{ $errors->first('email') }}</strong>
                        </span>
                    @endif
                </div> 
            </div>
            <div class="row">
                {{-- NAME --}}
                <div class="col-sm-6 form-group{{ $errors->has('name') ? ' has-error' : '' }}">
                    <label>Nombre</label>
                    <input  type="text" name="name" class="form-control round" placeholder="Ingrese su nombre" value="{{ old('name') }}" required>
                    @if ($errors->has('name'))
                        <span class="help-block">
                            <strong>{{ $errors->first('name') }}</strong>
                        </span>
                    @endif
                </div> 	
                {{-- LASTNAME --}}
                <div class="col-sm-6 form-group{{ $errors->has('surname') ? ' has-error' : '' }}">
                    <label for="reg-fn">Apellido</label>
                    <input type="text" name="surname" class="form-control round" placeholder="Ingrese su email" value="{{ old('surname') }}" required>
                    @if ($errors->has('surname'))
                        <span class="help-block">
                            <strong>{{ $errors->first('surname') }}</strong>
                        </span>
                    @endif
                </div> 
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Tipo de Negocio</label>
                        {!! Form::select('business_type', ['Local' => 'Local', 'ShowRoom' => 'ShowRoom', 'Revendedora' => 'Revendedora'], null,
                        ['class' => 'form-control', 'placeholder' => 'Seleccione una opción', 'required' => '']) !!}
                    </div>
                </div>

                {{-- PHONE --}}
                <div class="col-sm-6 form-group{{ $errors->has('phone') ? ' has-error' : '' }}">
                    <label>WhatsApp</label>
                    <input  type="number" name="phone" class="form-control round" placeholder="Ej.: (+54) 11 1234-5678 " value="{{ old('phone') }}" required>
                    @if ($errors->has('phone'))
                        <span class="help-block">
                            <strong>{{ $errors->first('phone') }}</strong>
                        </span>
                    @endif
                </div> 	
            </div>
            
            <div class="row">
                {{-- ADDRESS --}}
                <div class="col-sm-6 form-group{{ $errors->has('address') ? ' has-error' : '' }}">
                    <label for="reg-fn">Dirección</label>
                    <input type="text" name="address" class="form-control round" placeholder="Ingrese su dirección" value="{{ old('address') }}" required>
                    @if ($errors->has('address'))
                        <span class="help-block">
                            <strong>{{ $errors->first('address') }}</strong>
                        </span>
                    @endif
                </div>
                {{-- C.P. --}}
                <div class="col-sm-6 form-group{{ $errors->has('cp') ? ' has-error' : '' }}">
                    <label for="reg-fn">Código Postal</label>
                    <input type="text" name="cp" class="form-control round" placeholder="Ingrese su código postal" value="{{ old('cp') }}" required>
                    @if ($errors->has('cp'))
                        <span class="help-block">
                            <strong>{{ $errors->first('cp') }}</strong>
                        </span>
                    @endif
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Provincia</label>
                        {!! Form::select('geoprov_id', $geoprovs, null,
                        ['class' => 'GeoProvSelect form-control', 'placeholder' => 'Seleccione una opción']) !!}
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Localidad</label>
                        <select id='GeoLocsSelect' name="geoloc_id" 
                            data-actualloc="" 
                            data-actuallocid="" 
                            class="form-control GeoLocsSelect" required>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <label>Ingrese CUIT/CUIL o DNI</label>
                    <div id="UseCuitContainer" class="">
                        <input id="CuitInput" type="number" name="cuit" class="IfResellerEnable form-control round" min="0" placeholder="Ingrese número de CUIT/CUIL">
                    </div>
                    <div id="UseDniContainer" class="Hidden">
                        <input id="DniInput" type="number" name="dni" class="IfResellerEnable form-control round" min="0" placeholder="Ingrese número de DNI">
                    </div>
                    <div class="row" style="margin-top: 10px; margin-bottom: 10px">
                        <div class="col-md-3">
                            <label class="radio-inline"><input id="UseCuit" type="radio" name="CuitOrDni" value="Cuit" checked> CUIT</label>
                            <label class="radio-inline"><input id="UseDni"  type="radio" name="CuitOrDni" value="Dni"> DNI</label>
                        </div>
                        <div id="CuitDniValidation" class="col-md-9"></div>
                    </div>
                </div>
            </div>
            <div class="row">
                {{-- Password --}}
                <div class="col-sm-6 form-group{{ $errors->has('password') ? ' has-error' : '' }} position-relative has-icon-left">
                    <label for="reg-fn">Contraseña</label>
                    <input id="password" type="password"  name="password" class="form-control round" placeholder="Contraseña" required>
                    @if ($errors->has('password'))
                        <span class="help-block">
                            <strong>{{ $errors->first('password') }}</strong>
                        </span>
                    @endif
                </div> 	
                {{-- Password Confirmation --}}
                <div class="col-sm-6 form-group{{ $errors->has('password') ? ' has-error' : '' }} position-relative has-icon-left">
                    <label for="reg-fn">Confirmar Contraseña</label>
                    <input id="password-confirm" type="password" name="password_confirmation" class="form-control round" placeholder="Confirme Contraseña" required>
                    @if ($errors->has('name'))
                        <span class="help-block">
                            <strong>{{ $errors->first('name') }}</strong>
                        </span>
                    @endif
                </div>
            </div>
            {{-- Group 3 is reseller --}}
            <input type="hidden" value="3" name="group">
            {{-- Submit --}}
            <button id="SubmitFormBtn" type="button" class="btn btn-primary btn-block cursor-pointer"><i class="icon-unlock"></i> Registrarse</button>
            <button id="SubmitForm" type="submit" class="Hidden"> Registrarse</button>
            <div class="bottom-text">Ya tiene cuenta? | <a href="{{ route('customer.login') }}">Ingresar</a></div>
        </form>
    </div>
</div>
@if(isset($selectedLoc))
    dd($selectedLoc)
@endif
@endsection

@section('scripts')
    @include('store.components.bladejs')
    <script>
        $(document).ready(function(){

            $('.GeoProvSelect').on('change', function(){
                let prov_id = $(this).val();

                getGeoLocs(prov_id);
            });

            $(".GeoProvSelect").mouseup(function() {
                let prov_id = $(this).val();
                getGeoLocs(prov_id);
            });


            $('#UseCuit').click(function(){
                $('#UseCuitContainer').removeClass('Hidden');
                $('#UseDniContainer').addClass('Hidden');
                // $('#UseCuit').prop('checked', true);
                // $('#UseDni').prop('checked', false);
            });

            $('#UseDni').click(function(){
                $('#UseCuitContainer').addClass('Hidden');
                $('#UseDniContainer').removeClass('Hidden');
                // $('#UseCuit').prop('checked', false);
                // $('#UseDni').prop('checked', true);
            });

            $('#SubmitFormBtn').on('click', function(){
                let cuit = $('#CuitInput').val();
                let dni = $('#DniInput').val();
                
                if($('#UseCuit').prop('checked'))
                    if(cuit.length != 11)
                        $('#CuitDniValidation').html("El CUIT debe tener 11 números");   
                    else
                    {
                        $('#CuitDniValidation').html(" ");
                        $('#SubmitForm').click();
                    }
                
                if($('#UseDni').prop('checked'))
                    if(dni.length != 8)
                        $('#CuitDniValidation').html("El DNI debe tener 8 números");
                    else
                    {
                        $('#CuitDniValidation').html(" ");
                        $('#SubmitForm').click();
                    }
            });


            
           
        });
        </script>
@endsection
