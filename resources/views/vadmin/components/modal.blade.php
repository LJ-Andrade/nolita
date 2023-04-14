<div class="modal fade" id="{{ $id }}" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">{{ $title }}</h4>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            </div>
            <div class="modal-body">
                {{ $content }}                
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline-secondary btn-sm" type="button" data-dismiss="modal">Cerrar</button>
                {{ $button }}
            </div>
        </div>
    </div>
</div>

<!-- Trigger the modal with a button -->
{{--  <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal">Open Modal</button>  --}}