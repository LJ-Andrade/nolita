/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 78);
/******/ })
/************************************************************************/
/******/ ({

/***/ 78:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(79);


/***/ }),

/***/ 79:
/***/ (function(module, exports) {

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//----------------------------------------------
//                    Colors
//----------------------------------------------

$('.Select-Colors').chosen({
    placeholder_text_multiple: 'Seleccione los colores',
    // max_selected_options: 3,
    search_contains: true,
    no_results_text: 'No se ha encontrado el color'
});

//----------------------------------------------
//                     Tags
//----------------------------------------------
$('.Select-Tags').chosen({
    placeholder_text_multiple: 'Seleccione las etiquetas',
    // max_selected_options: 3,
    search_contains: true,
    no_results_text: 'No se ha encontrado la etiqueta'
});

$('.Select-Brand').chosen({
    placeholder_text_single: 'Seleccione la marca',
    // max_selected_options: 3,
    search_contains: true,
    no_results_text: 'No se ha encontrado la marca'
});

$('.Select-Atribute').chosen({
    placeholder_text_multiple: 'Seleccionar',
    // max_selected_options: 3,
    search_contains: true,
    no_results_text: 'No se ha encontrado'
});

$('.Select-Category').chosen({
    placeholder_text_single: 'Seleccione una categoría'
});

$('.Select-Chosen').chosen({
    placeholder_text_single: 'Seleccione una categoría'
});

//----------------------------------------------
//              Slug creator
//----------------------------------------------

$(".SlugInput").keyup(function () {
    var Text = $(this).val();
    Text = Text.toLowerCase();
    var regExp = /\s+/g;
    Text = Text.replace(/[&\/\\#,¡!´#+()$~%.'":*?<>{}]/g, '');
    Text = Text.replace(regExp, '-');
    Text = Text.replace('ñ', 'n');
    Text = Text.replace('á', 'a');
    Text = Text.replace('é', 'e');
    Text = Text.replace('í', 'i');
    Text = Text.replace('ó', 'o');
    Text = Text.replace('ú', 'u');

    $(".SlugInput").val(Text);
});

// Slug AutoFillnput from title 

$("#TitleInput").keyup(function (event) {
    var stt = $(this).val();
    var Text = $(this).val();
    Text = Text.toLowerCase();
    var regExp = /\s+/g;
    Text = Text.replace(/[&\/\\#,¡!´#+()$~%.'":*?<>{}]/g, '');
    Text = Text.replace(regExp, '-');
    Text = Text.replace('ñ', 'n');
    Text = Text.replace('á', 'a');
    Text = Text.replace('é', 'e');
    Text = Text.replace('í', 'i');
    Text = Text.replace('ó', 'o');
    Text = Text.replace('ú', 'u');
    $(".SlugInput").val(Text);
});

//----------------------------------------------
//      CREATE FORM
//----------------------------------------------

// Show Notes Text Area
$('.ShowNotesTextArea').click(function () {
    var notes = $('.NotesTextArea');
    if (notes.hasClass('Hidden')) {
        notes.removeClass('Hidden');
    } else {
        notes.addClass('Hidden');
    }
});

// Add Another Address
$('.AddAnotherAddressBtn').click(function () {
    var addressInput = "<input class='form-control' placeholder='Ingrese otro teléfono' name='deliveryaddress[]' type='text' style='margin-top:5px'>";
    var locInput = "<input class='form-control' placeholder='Ingrese otro teléfono' name='deliveryaddress[]' type='text' style='margin-top:5px'>";

    $('.AnotherAddress').append(addressInput);
    $('.AnotherLoc').append(locInput);
});

//----------------------------------------------
//     CREATE ARTICLE VARIANTS
//----------------------------------------------

window.checkVariants = function () {
    var existingCombinations = [];
    $(".Combination").each(function () {
        existingCombinations.push($(this).data('combination'));
    });
    return existingCombinations;
};

window.makeVariants = function () {
    var variantsContainer = $('#ArticleVariants');
    var variantSize = $('.VariantSize');
    var variantColor = $('.VariantColor');

    var colors = [];
    var sizes = [];

    $.each(variantSize, function () {
        if ($(this).is(':checked')) {
            size = {};
            size['id'] = $(this).val();
            size['name'] = $(this).data('name');
            sizes.push(size);
        }
    });

    $.each(variantColor, function () {
        if ($(this).is(':checked')) {
            color = {};
            color['id'] = $(this).val();
            color['name'] = $(this).data('name');
            colors.push(color);
        }
    });

    var combinations = [];

    $.each(colors, function (index, color) {
        $.each(sizes, function (index, size) {
            var item = {};
            item['combination'] = color['name'] + "/" + size['name'];
            item['color'] = color['name'];
            item['color_id'] = color['id'];
            item['size'] = size['name'];
            item['size_id'] = size['id'];
            combinations.push(item);
        });
    });

    console.log(combinations);

    var existingCombinations = checkVariants();

    $.each(combinations, function (index, value) {
        // ECMA script 6 
        if (!existingCombinations.includes(value['combination'])) {
            var variantRow = "<tr>" + "<td class='Combination' data-combination=" + value['color'] + "/" + value['size'] + ">" + value['color'] + "/" + value['size'] + "</td>" + "<input name='variants[" + value['combination'] + "][color]' value=" + value['color_id'] + " type='hidden' class='form-control'>" + "<input name='variants[" + value['combination'] + "][size]' value=" + value['size_id'] + " type='hidden' class='form-control'>" + "<td><input name='variants[" + value['combination'] + "][stock]' value='10' type='number' min='0' class='form-control'></td>" + "<td><a class='RemoveDynRow delete-icon'><i class='delete-icon fa fa-trash'></i></a></td>" + "</tr>";
            variantsContainer.append(variantRow);
        }
    });
    $('#HeaderVariants').removeClass('Hidden');
};

// Remove new variants row
$('#ArticleVariants').on('click', '.RemoveDynRow', function (e) {
    e.preventDefault();
    $(this).parents('tr').remove();
});

$('.RemoveVariant').on('click', function () {
    console.log($(this).data('rowid'));
    deleteDBItem($(this).data('route'), $(this).data('id'), $(this).data('rowid'));
});

window.deleteDBItem = function (route, id, rowid) {
    $.ajax({
        url: route,
        method: 'POST',
        dataType: 'JSON',
        data: { id: id },
        beforeSend: function beforeSend() {},
        success: function success(data) {
            console.log(data);
            if (data.success == true) {
                // $("#"+rowid).hide();
                $("#" + rowid).remove();
            } else {
                alert_error('Ups!', 'Ha ocurrido un error al eliminar la variante');
                console.log(data);
                console.log(data.message);
                return false;
            }
        },
        error: function error(data) {
            $('#Error').html(data.responseText);
            console.log(data);
            console.log(data.message);
        }
    });
};

//----------------------------------------------
//   EDITORS AND FIELDS 
//----------------------------------------------

// $('#Multi_Images').fileuploader({
//     extensions: ['jpg', 'jpeg', 'png', 'gif'],
//     limit: null,
//     addMore: true,
//     // Peso máximo de todas las imágenes
//     maxSize: 5,
//     // Peso máximo por imágen
//     fileMaxSize: 2,
//     theme: 'thumbnails',
//     enableApi: true,
//     captions: {
//         button: function(options) { return 'Seleccionar ' + (options.limit == 1 ? 'Imágenes' : 'Imágen'); },
//         feedback: function(options) { return 'Haga click para agregar...'; },
//         feedback2: function(options) { return options.length + ' ' + (options.length > 1 ? ' imágenes seleccionadas' : ' imágen seleccionada'); },
//         drop: 'Arrastre las imágenes aquí',
//         paste: '<div class="fileuploader-pending-loader"><div class="left-half" style="animation-duration: ${ms}s"></div><div class="spinner" style="animation-duration: ${ms}s"></div><div class="right-half" style="animation-duration: ${ms}s"></div></div> Pasting a file, click here to cancel.',
//         removeConfirmation: 'Eliminar?',
//         errors: {
//             filesLimit: 'Solo es posible subir ${limit} imágen.',
//             filesType: 'Solo se aceptan los formatos: ${extensions}.',
//             fileSize: '${name} es muy grandes! Seleccione una de ${fileMaxSize}MB. como máximo',
//             filesSizeAll: '${name} son muy grandes! Seleccione unas de ${fileMaxSize}MB. como máximo',
//             fileName: 'La imágen con el nombre ${name} ya está seleccionada.',
//             folderUpload: 'No está permitido subir carpetas.'
//         },
//         dialogs: {
//             // alert dialog
//             alert: function(text) {
//                 return alert_confirm(text);
//             },
//             // confirm dialog
//             confirm: function(text, callback) {
//                 'confirm(text) ? callback() : null;'
//             }
//         },
//     }
// });

$('#Single_Image').fileuploader({
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
    limit: 1,
    addMore: false,
    fileMaxSize: 2,
    captions: {
        button: function button(options) {
            return 'Seleccionar ' + (options.limit == 1 ? 'Imágen' : 'Imágen');
        },
        feedback: function feedback(options) {
            return 'Agregar imágenes...';
        },
        feedback2: function feedback2(options) {
            return options.length + ' ' + (options.length > 1 ? ' imágenes seleccionadas' : ' imágen seleccionada');
        },
        drop: 'Arrastre las imágenes aquí',
        paste: '<div class="fileuploader-pending-loader"><div class="left-half" style="animation-duration: ${ms}s"></div><div class="spinner" style="animation-duration: ${ms}s"></div><div class="right-half" style="animation-duration: ${ms}s"></div></div> Pasting a file, click here to cancel.',
        removeConfirmation: 'Eliminar?',
        errors: {
            filesLimit: 'Solo es posible subir ${limit} imágen.',
            filesType: 'Solo se aceptan los formatos: ${extensions}.',
            fileSize: 'La imágen pesa mucho! Elija una de ${fileMaxSize}MB como máximo.',
            fileName: 'La imágen con ese nombre ya ha sido elegida',
            folderUpload: 'No está permitido subir carpetas.'
        },
        dialogs: {
            // alert dialog
            alert: function (_alert) {
                function alert(_x) {
                    return _alert.apply(this, arguments);
                }

                alert.toString = function () {
                    return _alert.toString();
                };

                return alert;
            }(function (text) {
                return alert(text);
            }),
            // confirm dialog
            confirm: function confirm(text, callback) {
                'confirm(text) ? callback() : null;';
            }
        }
    }
});

//enable fileuploader plugin
// $('#ImagesUploader').fileuploader({
//     extensions: ['jpg', 'jpeg', 'png', 'gif'],
//     addMore: true,
//     enableApi: true,
//     thumbnails: {
//         onImageLoaded: function(item) {
//             item.html.find('.fileuploader-action-remove').before('<a class="fileuploader-action fileuploader-action-sort fas fa-sort title="Sort"><i></i></a>');
//             if (!item.html.find('.fileuploader-action-edit').length)
//                 item.html.find('.fileuploader-action-remove').before('<a class="fileuploader-action fileuploader-action-popup fileuploader-action-edit fas fa-edit" title="Edit"><i></i></a>');
//         }
//     },
//     editor: {
//         cropper: {
//             ratio: '1:1',
//             minWidth: 100,
//             minHeight: 100,
//             showGrid: true
//         }
//     },
//     sorter: {
//         selectorExclude: null,
//         placeholder: null,
//         scrollContainer: window,
//         onSort: function(list, listEl, parentEl, newInputEl, inputEl) {
//             // onSort callback
//         }
//     }
// });


$('#Multi_Images').fileuploader({
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
    changeInput: ' ',
    theme: 'thumbnails',
    enableApi: true,
    addMore: true,
    dragDrop: {
        // set the drop container {null, String, jQuery Object}
        // example: 'body'
        container: null,

        // Callback fired on entering with dragging files the drop container
        onDragEnter: function onDragEnter(event, listEl, parentEl, newInputEl, inputEl) {
            // callback will go here
        },

        // Callback fired on leaving with dragging files the drop container
        onDragLeave: function onDragLeave(event, listEl, parentEl, newInputEl, inputEl) {
            // callback will go here
        },

        // Callback fired on dropping the files in the drop container
        onDrop: function onDrop(event, listEl, parentEl, newInputEl, inputEl) {
            // callback will go here
        }
    },
    sorter: {
        selectorExclude: null,
        placeholder: null,
        scrollContainer: window,
        onSort: function onSort(list, listEl, parentEl, newInputEl, inputEl) {
            $('#FeaturedImageName').val(list[0]['name']);
        }
    },
    thumbnails: _defineProperty({
        onItemShow: function onItemShow(item) {
            // add sorter button to the item html<i class="fas fa-sort"></i>
            item.html.find('.fileuploader-action-remove').before('<a class="fileuploader-action fileuploader-action-sort fas fa-sort" title="Sort"><i></i></a>');
        },
        box: '<div class="fileuploader-items">' + '<ul class="fileuploader-items-list">' + '<li class="fileuploader-thumbnails-input"><div class="fileuploader-thumbnails-input-inner">+</div></li>' + '</ul>' + '</div>',
        item: '<li class="fileuploader-item">' + '<div class="fileuploader-item-inner">' + '<div class="thumbnail-holder">${image}</div>' + '<div class="actions-holder">' + '<a class="fileuploader-action fileuploader-action-remove" title="${captions.remove}">X</a> ' + '<a class="fileuploader-action fileuploader-action-sort" title="Sort">></a> ' + '<span class="fileuploader-action-popup"></span>' + '</div>' + '<div class="progress-holder">${progressBar}</div>' + '</div>' + '</li>',

        startImageRenderer: true,
        canvasImage: false,
        _selectors: {
            list: '.fileuploader-items-list',
            item: '.fileuploader-item',
            start: '.fileuploader-action-start',
            retry: '.fileuploader-action-retry',
            sorter: '.fileuploader-action-sort',
            remove: '.fileuploader-action-remove'
        }
    }, 'onItemShow', function onItemShow(item, listEl, parentEl, newInputEl, inputEl) {
        var plusInput = listEl.find('.fileuploader-thumbnails-input'),
            api = $.fileuploader.getInstance(inputEl.get(0));

        plusInput.insertAfter(item.html)[api.getOptions().limit && api.getChoosedFiles().length >= api.getOptions().limit ? 'hide' : 'show']();

        if (item.format == 'image') {
            item.html.find('.fileuploader-item-icon').hide();
        }
    }),
    afterRender: function afterRender(listEl, parentEl, newInputEl, inputEl) {
        var plusInput = listEl.find('.fileuploader-thumbnails-input'),
            api = $.fileuploader.getInstance(inputEl.get(0));

        plusInput.on('click', function () {
            api.open();
        });
    },
    onRemove: function onRemove(item, listEl, parentEl, newInputEl, inputEl) {
        var plusInput = listEl.find('.fileuploader-thumbnails-input'),
            api = $.fileuploader.getInstance(inputEl.get(0));

        if (api.getOptions().limit && api.getChoosedFiles().length - 1 < api.getOptions().limit) plusInput.show();
    }
    /*
    // while using upload option, please set
    // startImageRenderer: false
    // for a better effect
    upload: {
        url: './php/upload_file.php',
        data: null,
        type: 'POST',
        enctype: 'multipart/form-data',
        start: true,
        synchron: true,
        beforeSend: null,
        onSuccess: function(data, item) {
            setTimeout(function() {
                item.html.find('.progress-holder').hide();
                item.renderThumbnail();
            }, 400);
        },
        onError: function(item) {
            item.html.find('.progress-holder').hide();
            item.html.find('.fileuploader-item-icon i').text('Failed!');
        },
        onProgress: function(data, item) {
            var progressBar = item.html.find('.progress-holder');
            
            if(progressBar.length > 0) {
                progressBar.show();
                progressBar.find('.fileuploader-progressbar .bar').width(data.percentage + "%");
            }
        }
    },
    dragDrop: {
        container: '.fileuploader-thumbnails-input'
    },
    onRemove: function(item) {
        $.post('php/upload_remove.php', {
            file: item.name
        });
    },
    */
});

function setImageOrderInputs() {
    console.log("Agregando Inputs");
    $('#OrderInputs').html("<input value='order' name='Test'> Orden");
}

$('.Display-Input-Modificable').click(function () {
    $(this).removeClass('display-input-disabled');
});

// ---- Modificable input text
// Html element
//<p data-editable class="SlugInput">{{ $article->slug }}</p>   

$('body').on('click', '[data-editable]', function () {

    var $el = $(this);

    var $input = $('<input/>').val($el.text());
    $el.replaceWith($input);

    var save = function save() {
        var $p = $('<p data-editable />').text($input.val());
        $input.replaceWith($p);
    };

    /**
      We're defining the callback with `one`, because we know that
      the element will be gone just after that, and we don't want 
      any callbacks leftovers take memory. 
      Next time `p` turns into `input` this single callback 
      will be applied again.
    */
    $input.one('blur', save).focus();
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOTA5OTVhNzdmNzMzZWY0ZTAxNDkiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy92YWRtaW4tZm9ybXMuanMiXSwibmFtZXMiOlsiJCIsImNob3NlbiIsInBsYWNlaG9sZGVyX3RleHRfbXVsdGlwbGUiLCJzZWFyY2hfY29udGFpbnMiLCJub19yZXN1bHRzX3RleHQiLCJwbGFjZWhvbGRlcl90ZXh0X3NpbmdsZSIsImtleXVwIiwiVGV4dCIsInZhbCIsInRvTG93ZXJDYXNlIiwicmVnRXhwIiwicmVwbGFjZSIsImV2ZW50Iiwic3R0IiwiY2xpY2siLCJub3RlcyIsImhhc0NsYXNzIiwicmVtb3ZlQ2xhc3MiLCJhZGRDbGFzcyIsImFkZHJlc3NJbnB1dCIsImxvY0lucHV0IiwiYXBwZW5kIiwid2luZG93IiwiY2hlY2tWYXJpYW50cyIsImV4aXN0aW5nQ29tYmluYXRpb25zIiwiZWFjaCIsInB1c2giLCJkYXRhIiwibWFrZVZhcmlhbnRzIiwidmFyaWFudHNDb250YWluZXIiLCJ2YXJpYW50U2l6ZSIsInZhcmlhbnRDb2xvciIsImNvbG9ycyIsInNpemVzIiwiaXMiLCJzaXplIiwiY29sb3IiLCJjb21iaW5hdGlvbnMiLCJpbmRleCIsIml0ZW0iLCJjb25zb2xlIiwibG9nIiwidmFsdWUiLCJpbmNsdWRlcyIsInZhcmlhbnRSb3ciLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInBhcmVudHMiLCJyZW1vdmUiLCJkZWxldGVEQkl0ZW0iLCJyb3V0ZSIsImlkIiwicm93aWQiLCJhamF4IiwidXJsIiwibWV0aG9kIiwiZGF0YVR5cGUiLCJiZWZvcmVTZW5kIiwic3VjY2VzcyIsImFsZXJ0X2Vycm9yIiwibWVzc2FnZSIsImVycm9yIiwiaHRtbCIsInJlc3BvbnNlVGV4dCIsImZpbGV1cGxvYWRlciIsImV4dGVuc2lvbnMiLCJsaW1pdCIsImFkZE1vcmUiLCJmaWxlTWF4U2l6ZSIsImNhcHRpb25zIiwiYnV0dG9uIiwib3B0aW9ucyIsImZlZWRiYWNrIiwiZmVlZGJhY2syIiwibGVuZ3RoIiwiZHJvcCIsInBhc3RlIiwicmVtb3ZlQ29uZmlybWF0aW9uIiwiZXJyb3JzIiwiZmlsZXNMaW1pdCIsImZpbGVzVHlwZSIsImZpbGVTaXplIiwiZmlsZU5hbWUiLCJmb2xkZXJVcGxvYWQiLCJkaWFsb2dzIiwiYWxlcnQiLCJ0ZXh0IiwiY29uZmlybSIsImNhbGxiYWNrIiwiY2hhbmdlSW5wdXQiLCJ0aGVtZSIsImVuYWJsZUFwaSIsImRyYWdEcm9wIiwiY29udGFpbmVyIiwib25EcmFnRW50ZXIiLCJsaXN0RWwiLCJwYXJlbnRFbCIsIm5ld0lucHV0RWwiLCJpbnB1dEVsIiwib25EcmFnTGVhdmUiLCJvbkRyb3AiLCJzb3J0ZXIiLCJzZWxlY3RvckV4Y2x1ZGUiLCJwbGFjZWhvbGRlciIsInNjcm9sbENvbnRhaW5lciIsIm9uU29ydCIsImxpc3QiLCJ0aHVtYm5haWxzIiwib25JdGVtU2hvdyIsImZpbmQiLCJiZWZvcmUiLCJib3giLCJzdGFydEltYWdlUmVuZGVyZXIiLCJjYW52YXNJbWFnZSIsIl9zZWxlY3RvcnMiLCJzdGFydCIsInJldHJ5IiwicGx1c0lucHV0IiwiYXBpIiwiZ2V0SW5zdGFuY2UiLCJnZXQiLCJpbnNlcnRBZnRlciIsImdldE9wdGlvbnMiLCJnZXRDaG9vc2VkRmlsZXMiLCJmb3JtYXQiLCJoaWRlIiwiYWZ0ZXJSZW5kZXIiLCJvcGVuIiwib25SZW1vdmUiLCJzaG93Iiwic2V0SW1hZ2VPcmRlcklucHV0cyIsIiRlbCIsIiRpbnB1dCIsInJlcGxhY2VXaXRoIiwic2F2ZSIsIiRwIiwib25lIiwiZm9jdXMiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVB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QW5CLEVBQXlCRyxLQUF6QjtBQUVELENBckJILEUiLCJmaWxlIjoiL2pzL3ZhZG1pbi1mb3Jtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA3OCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgOTA5OTVhNzdmNzMzZWY0ZTAxNDkiLCIvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gICAgICAgICAgICAgICAgICAgIENvbG9yc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiQoJy5TZWxlY3QtQ29sb3JzJykuY2hvc2VuKHtcclxuICAgIHBsYWNlaG9sZGVyX3RleHRfbXVsdGlwbGU6ICdTZWxlY2Npb25lIGxvcyBjb2xvcmVzJyxcclxuICAgIC8vIG1heF9zZWxlY3RlZF9vcHRpb25zOiAzLFxyXG4gICAgc2VhcmNoX2NvbnRhaW5zOiB0cnVlLFxyXG4gICAgbm9fcmVzdWx0c190ZXh0OiAnTm8gc2UgaGEgZW5jb250cmFkbyBlbCBjb2xvcidcclxufSk7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gICAgICAgICAgICAgICAgICAgICBUYWdzXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4kKCcuU2VsZWN0LVRhZ3MnKS5jaG9zZW4oe1xyXG4gICAgcGxhY2Vob2xkZXJfdGV4dF9tdWx0aXBsZTogJ1NlbGVjY2lvbmUgbGFzIGV0aXF1ZXRhcycsXHJcbiAgICAvLyBtYXhfc2VsZWN0ZWRfb3B0aW9uczogMyxcclxuICAgIHNlYXJjaF9jb250YWluczogdHJ1ZSxcclxuICAgIG5vX3Jlc3VsdHNfdGV4dDogJ05vIHNlIGhhIGVuY29udHJhZG8gbGEgZXRpcXVldGEnXHJcbn0pO1xyXG5cclxuJCgnLlNlbGVjdC1CcmFuZCcpLmNob3Nlbih7XHJcbiAgICBwbGFjZWhvbGRlcl90ZXh0X3NpbmdsZTogJ1NlbGVjY2lvbmUgbGEgbWFyY2EnLFxyXG4gICAgLy8gbWF4X3NlbGVjdGVkX29wdGlvbnM6IDMsXHJcbiAgICBzZWFyY2hfY29udGFpbnM6IHRydWUsXHJcbiAgICBub19yZXN1bHRzX3RleHQ6ICdObyBzZSBoYSBlbmNvbnRyYWRvIGxhIG1hcmNhJ1xyXG59KTtcclxuXHJcblxyXG5cclxuJCgnLlNlbGVjdC1BdHJpYnV0ZScpLmNob3Nlbih7XHJcbiAgICBwbGFjZWhvbGRlcl90ZXh0X211bHRpcGxlOiAnU2VsZWNjaW9uYXInLFxyXG4gICAgLy8gbWF4X3NlbGVjdGVkX29wdGlvbnM6IDMsXHJcbiAgICBzZWFyY2hfY29udGFpbnM6IHRydWUsXHJcbiAgICBub19yZXN1bHRzX3RleHQ6ICdObyBzZSBoYSBlbmNvbnRyYWRvJ1xyXG59KTtcclxuXHJcbiQoJy5TZWxlY3QtQ2F0ZWdvcnknKS5jaG9zZW4oe1xyXG4gICAgcGxhY2Vob2xkZXJfdGV4dF9zaW5nbGU6ICdTZWxlY2Npb25lIHVuYSBjYXRlZ29yw61hJyxcclxufSk7XHJcblxyXG4kKCcuU2VsZWN0LUNob3NlbicpLmNob3Nlbih7XHJcbiAgICBwbGFjZWhvbGRlcl90ZXh0X3NpbmdsZTogJ1NlbGVjY2lvbmUgdW5hIGNhdGVnb3LDrWEnLFxyXG59KTtcclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gICAgICAgICAgICAgIFNsdWcgY3JlYXRvclxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiQoXCIuU2x1Z0lucHV0XCIpLmtleXVwKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgVGV4dCAgICAgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgVGV4dCAgICAgICAgID0gVGV4dC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdmFyIHJlZ0V4cCAgID0gL1xccysvZztcclxuICAgIFRleHQgICAgICAgICA9IFRleHQucmVwbGFjZSgvWyZcXC9cXFxcIyzCoSHCtCMrKCkkfiUuJ1wiOio/PD57fV0vZywnJyk7XHJcbiAgICBUZXh0ICAgICAgICAgPSBUZXh0LnJlcGxhY2UocmVnRXhwLCctJyk7XHJcbiAgICBUZXh0ICAgICAgICAgPSBUZXh0LnJlcGxhY2UoJ8OxJywgJ24nKSA7XHJcbiAgICBUZXh0ICAgICAgICAgPSBUZXh0LnJlcGxhY2UoJ8OhJywgJ2EnKSA7XHJcbiAgICBUZXh0ICAgICAgICAgPSBUZXh0LnJlcGxhY2UoJ8OpJywgJ2UnKSA7XHJcbiAgICBUZXh0ICAgICAgICAgPSBUZXh0LnJlcGxhY2UoJ8OtJywgJ2knKSA7XHJcbiAgICBUZXh0ICAgICAgICAgPSBUZXh0LnJlcGxhY2UoJ8OzJywgJ28nKSA7XHJcbiAgICBUZXh0ICAgICAgICAgPSBUZXh0LnJlcGxhY2UoJ8O6JywgJ3UnKSA7XHJcbiAgICBcclxuICAgICQoXCIuU2x1Z0lucHV0XCIpLnZhbChUZXh0KTsgICBcclxufSk7XHJcblxyXG4vLyBTbHVnIEF1dG9GaWxsbnB1dCBmcm9tIHRpdGxlIFxyXG5cclxuJChcIiNUaXRsZUlucHV0XCIpLmtleXVwKGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgc3R0ID0gJCh0aGlzKS52YWwoKTtcclxuICAgIHZhciBUZXh0ICAgICA9ICQodGhpcykudmFsKCk7XHJcbiAgICBUZXh0ICAgICAgICAgPSBUZXh0LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB2YXIgcmVnRXhwICAgPSAvXFxzKy9nO1xyXG4gICAgVGV4dCAgICAgICAgID0gVGV4dC5yZXBsYWNlKC9bJlxcL1xcXFwjLMKhIcK0IysoKSR+JS4nXCI6Kj88Pnt9XS9nLCcnKTtcclxuICAgIFRleHQgICAgICAgICA9IFRleHQucmVwbGFjZShyZWdFeHAsJy0nKTtcclxuICAgIFRleHQgICAgICAgICA9IFRleHQucmVwbGFjZSgnw7EnLCAnbicpIDtcclxuICAgIFRleHQgICAgICAgICA9IFRleHQucmVwbGFjZSgnw6EnLCAnYScpIDtcclxuICAgIFRleHQgICAgICAgICA9IFRleHQucmVwbGFjZSgnw6knLCAnZScpIDtcclxuICAgIFRleHQgICAgICAgICA9IFRleHQucmVwbGFjZSgnw60nLCAnaScpIDtcclxuICAgIFRleHQgICAgICAgICA9IFRleHQucmVwbGFjZSgnw7MnLCAnbycpIDtcclxuICAgIFRleHQgICAgICAgICA9IFRleHQucmVwbGFjZSgnw7onLCAndScpIDtcclxuICAgICQoXCIuU2x1Z0lucHV0XCIpLnZhbChUZXh0KTsgICBcclxufSk7XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICAgICAgQ1JFQVRFIEZPUk1cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vLyBTaG93IE5vdGVzIFRleHQgQXJlYVxyXG4kKCcuU2hvd05vdGVzVGV4dEFyZWEnKS5jbGljayhmdW5jdGlvbigpe1xyXG4gICAgdmFyIG5vdGVzID0gJCgnLk5vdGVzVGV4dEFyZWEnKTtcclxuICAgIGlmIChub3Rlcy5oYXNDbGFzcygnSGlkZGVuJykpe1xyXG4gICAgICAgIG5vdGVzLnJlbW92ZUNsYXNzKCdIaWRkZW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbm90ZXMuYWRkQ2xhc3MoJ0hpZGRlbicpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vIEFkZCBBbm90aGVyIEFkZHJlc3NcclxuJCgnLkFkZEFub3RoZXJBZGRyZXNzQnRuJykuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgIHZhciBhZGRyZXNzSW5wdXQgPSBcIjxpbnB1dCBjbGFzcz0nZm9ybS1jb250cm9sJyBwbGFjZWhvbGRlcj0nSW5ncmVzZSBvdHJvIHRlbMOpZm9ubycgbmFtZT0nZGVsaXZlcnlhZGRyZXNzW10nIHR5cGU9J3RleHQnIHN0eWxlPSdtYXJnaW4tdG9wOjVweCc+XCI7XHJcbiAgICB2YXIgbG9jSW5wdXQgICAgID0gXCI8aW5wdXQgY2xhc3M9J2Zvcm0tY29udHJvbCcgcGxhY2Vob2xkZXI9J0luZ3Jlc2Ugb3RybyB0ZWzDqWZvbm8nIG5hbWU9J2RlbGl2ZXJ5YWRkcmVzc1tdJyB0eXBlPSd0ZXh0JyBzdHlsZT0nbWFyZ2luLXRvcDo1cHgnPlwiO1xyXG5cclxuICAgICQoJy5Bbm90aGVyQWRkcmVzcycpLmFwcGVuZChhZGRyZXNzSW5wdXQpO1xyXG4gICAgJCgnLkFub3RoZXJMb2MnKS5hcHBlbmQobG9jSW5wdXQpO1xyXG59KTtcclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gICAgIENSRUFURSBBUlRJQ0xFIFZBUklBTlRTXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxud2luZG93LmNoZWNrVmFyaWFudHMgPSBmdW5jdGlvbigpXHJcbntcclxuICAgIGxldCBleGlzdGluZ0NvbWJpbmF0aW9ucyA9IFtdO1xyXG4gICAgJChcIi5Db21iaW5hdGlvblwiKS5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZXhpc3RpbmdDb21iaW5hdGlvbnMucHVzaCgkKHRoaXMpLmRhdGEoJ2NvbWJpbmF0aW9uJykpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZXhpc3RpbmdDb21iaW5hdGlvbnM7XHJcbn1cclxuXHJcblxyXG53aW5kb3cubWFrZVZhcmlhbnRzID0gZnVuY3Rpb24oKVxyXG57XHJcbiAgICBjb25zdCB2YXJpYW50c0NvbnRhaW5lciA9ICQoJyNBcnRpY2xlVmFyaWFudHMnKTtcclxuICAgIGNvbnN0IHZhcmlhbnRTaXplID0gJCgnLlZhcmlhbnRTaXplJyk7XHJcbiAgICBjb25zdCB2YXJpYW50Q29sb3IgPSAkKCcuVmFyaWFudENvbG9yJyk7XHJcbiAgICBcclxuICAgIGxldCBjb2xvcnMgPSBbXTtcclxuICAgIGxldCBzaXplcyA9IFtdO1xyXG5cclxuICAgIFxyXG5cclxuICAgICQuZWFjaCh2YXJpYW50U2l6ZSwgZnVuY3Rpb24oKXtcclxuICAgICAgICBpZigkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKVxyXG4gICAgICAgIHsgICBcclxuICAgICAgICAgICAgc2l6ZSA9IHt9O1xyXG4gICAgICAgICAgICBzaXplWydpZCddID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgc2l6ZVsnbmFtZSddID0gJCh0aGlzKS5kYXRhKCduYW1lJyk7XHJcbiAgICAgICAgICAgIHNpemVzLnB1c2goc2l6ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgICQuZWFjaCh2YXJpYW50Q29sb3IsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYoJCh0aGlzKS5pcygnOmNoZWNrZWQnKSlcclxuICAgICAgICB7ICAgXHJcbiAgICAgICAgICAgIGNvbG9yID0ge307XHJcbiAgICAgICAgICAgIGNvbG9yWydpZCddID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgY29sb3JbJ25hbWUnXSA9ICQodGhpcykuZGF0YSgnbmFtZScpO1xyXG4gICAgICAgICAgICBjb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAgICBcclxuICAgIGxldCBjb21iaW5hdGlvbnMgPSBbXTtcclxuXHJcbiAgICAkLmVhY2goY29sb3JzLCBmdW5jdGlvbihpbmRleCwgY29sb3Ipe1xyXG4gICAgICAgICQuZWFjaChzaXplcywgIGZ1bmN0aW9uKGluZGV4LCBzaXplKXtcclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB7fTsgXHJcbiAgICAgICAgICAgIGl0ZW1bJ2NvbWJpbmF0aW9uJ10gPSBjb2xvclsnbmFtZSddK1wiL1wiK3NpemVbJ25hbWUnXTtcclxuICAgICAgICAgICAgaXRlbVsnY29sb3InXSA9IGNvbG9yWyduYW1lJ107XHJcbiAgICAgICAgICAgIGl0ZW1bJ2NvbG9yX2lkJ10gPSBjb2xvclsnaWQnXTtcclxuICAgICAgICAgICAgaXRlbVsnc2l6ZSddID0gc2l6ZVsnbmFtZSddO1xyXG4gICAgICAgICAgICBpdGVtWydzaXplX2lkJ10gPSBzaXplWydpZCddO1xyXG4gICAgICAgICAgICBjb21iaW5hdGlvbnMucHVzaChpdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGNvbWJpbmF0aW9ucyk7XHJcbiAgICBcclxuICAgIGxldCBleGlzdGluZ0NvbWJpbmF0aW9ucyA9IGNoZWNrVmFyaWFudHMoKTtcclxuXHJcbiAgICAkLmVhY2goY29tYmluYXRpb25zLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpXHJcbiAgICB7ICAgXHJcbiAgICAgICAgLy8gRUNNQSBzY3JpcHQgNiBcclxuICAgICAgICBpZighZXhpc3RpbmdDb21iaW5hdGlvbnMuaW5jbHVkZXModmFsdWVbJ2NvbWJpbmF0aW9uJ10pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHZhcmlhbnRSb3cgPSBcIjx0cj5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8dGQgY2xhc3M9J0NvbWJpbmF0aW9uJyBkYXRhLWNvbWJpbmF0aW9uPVwiKyB2YWx1ZVsnY29sb3InXSArXCIvXCIgKyB2YWx1ZVsnc2l6ZSddICsgXCI+XCIrIHZhbHVlWydjb2xvciddICtcIi9cIiArIHZhbHVlWydzaXplJ10gKyBcIjwvdGQ+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGlucHV0IG5hbWU9J3ZhcmlhbnRzW1wiK3ZhbHVlWydjb21iaW5hdGlvbiddK1wiXVtjb2xvcl0nIHZhbHVlPVwiKyB2YWx1ZVsnY29sb3JfaWQnXSArXCIgdHlwZT0naGlkZGVuJyBjbGFzcz0nZm9ybS1jb250cm9sJz5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8aW5wdXQgbmFtZT0ndmFyaWFudHNbXCIrdmFsdWVbJ2NvbWJpbmF0aW9uJ10rXCJdW3NpemVdJyB2YWx1ZT1cIisgdmFsdWVbJ3NpemVfaWQnXSArXCIgdHlwZT0naGlkZGVuJyBjbGFzcz0nZm9ybS1jb250cm9sJz5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8dGQ+PGlucHV0IG5hbWU9J3ZhcmlhbnRzW1wiK3ZhbHVlWydjb21iaW5hdGlvbiddK1wiXVtzdG9ja10nIHZhbHVlPScxMCcgdHlwZT0nbnVtYmVyJyBtaW49JzAnIGNsYXNzPSdmb3JtLWNvbnRyb2wnPjwvdGQ+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPHRkPjxhIGNsYXNzPSdSZW1vdmVEeW5Sb3cgZGVsZXRlLWljb24nPjxpIGNsYXNzPSdkZWxldGUtaWNvbiBmYSBmYS10cmFzaCc+PC9pPjwvYT48L3RkPlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjwvdHI+XCI7XHJcbiAgICAgICAgICAgIHZhcmlhbnRzQ29udGFpbmVyLmFwcGVuZCh2YXJpYW50Um93KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgICQoJyNIZWFkZXJWYXJpYW50cycpLnJlbW92ZUNsYXNzKCdIaWRkZW4nKTtcclxufVxyXG5cclxuXHJcbi8vIFJlbW92ZSBuZXcgdmFyaWFudHMgcm93XHJcbiQoJyNBcnRpY2xlVmFyaWFudHMnKS5vbignY2xpY2snLCAnLlJlbW92ZUR5blJvdycsIGZ1bmN0aW9uKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQodGhpcykucGFyZW50cygndHInKS5yZW1vdmUoKTtcclxufSk7XHJcblxyXG4kKCcuUmVtb3ZlVmFyaWFudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coJCh0aGlzKS5kYXRhKCdyb3dpZCcpKTtcclxuICAgIGRlbGV0ZURCSXRlbSgkKHRoaXMpLmRhdGEoJ3JvdXRlJyksICQodGhpcykuZGF0YSgnaWQnKSwgJCh0aGlzKS5kYXRhKCdyb3dpZCcpKTtcclxufSk7XHJcblxyXG5cclxud2luZG93LmRlbGV0ZURCSXRlbSA9IGZ1bmN0aW9uKHJvdXRlLCBpZCwgcm93aWQpe1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6IHJvdXRlLFxyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLCAgICAgICAgICAgICBcclxuICAgICAgICBkYXRhVHlwZTogJ0pTT04nLFxyXG4gICAgICAgIGRhdGE6IHsgaWQ6IGlkIH0sXHJcbiAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24oKXtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuc3VjY2VzcyA9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAkKFwiI1wiK3Jvd2lkKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkKFwiI1wiK3Jvd2lkKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0X2Vycm9yKCdVcHMhJywnSGEgb2N1cnJpZG8gdW4gZXJyb3IgYWwgZWxpbWluYXIgbGEgdmFyaWFudGUnKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGRhdGEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAkKCcjRXJyb3InKS5odG1sKGRhdGEucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEubWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICAgRURJVE9SUyBBTkQgRklFTERTIFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8vICQoJyNNdWx0aV9JbWFnZXMnKS5maWxldXBsb2FkZXIoe1xyXG4vLyAgICAgZXh0ZW5zaW9uczogWydqcGcnLCAnanBlZycsICdwbmcnLCAnZ2lmJ10sXHJcbi8vICAgICBsaW1pdDogbnVsbCxcclxuLy8gICAgIGFkZE1vcmU6IHRydWUsXHJcbi8vICAgICAvLyBQZXNvIG3DoXhpbW8gZGUgdG9kYXMgbGFzIGltw6FnZW5lc1xyXG4vLyAgICAgbWF4U2l6ZTogNSxcclxuLy8gICAgIC8vIFBlc28gbcOheGltbyBwb3IgaW3DoWdlblxyXG4vLyAgICAgZmlsZU1heFNpemU6IDIsXHJcbi8vICAgICB0aGVtZTogJ3RodW1ibmFpbHMnLFxyXG4vLyAgICAgZW5hYmxlQXBpOiB0cnVlLFxyXG4vLyAgICAgY2FwdGlvbnM6IHtcclxuLy8gICAgICAgICBidXR0b246IGZ1bmN0aW9uKG9wdGlvbnMpIHsgcmV0dXJuICdTZWxlY2Npb25hciAnICsgKG9wdGlvbnMubGltaXQgPT0gMSA/ICdJbcOhZ2VuZXMnIDogJ0ltw6FnZW4nKTsgfSxcclxuLy8gICAgICAgICBmZWVkYmFjazogZnVuY3Rpb24ob3B0aW9ucykgeyByZXR1cm4gJ0hhZ2EgY2xpY2sgcGFyYSBhZ3JlZ2FyLi4uJzsgfSxcclxuLy8gICAgICAgICBmZWVkYmFjazI6IGZ1bmN0aW9uKG9wdGlvbnMpIHsgcmV0dXJuIG9wdGlvbnMubGVuZ3RoICsgJyAnICsgKG9wdGlvbnMubGVuZ3RoID4gMSA/ICcgaW3DoWdlbmVzIHNlbGVjY2lvbmFkYXMnIDogJyBpbcOhZ2VuIHNlbGVjY2lvbmFkYScpOyB9LFxyXG4vLyAgICAgICAgIGRyb3A6ICdBcnJhc3RyZSBsYXMgaW3DoWdlbmVzIGFxdcOtJyxcclxuLy8gICAgICAgICBwYXN0ZTogJzxkaXYgY2xhc3M9XCJmaWxldXBsb2FkZXItcGVuZGluZy1sb2FkZXJcIj48ZGl2IGNsYXNzPVwibGVmdC1oYWxmXCIgc3R5bGU9XCJhbmltYXRpb24tZHVyYXRpb246ICR7bXN9c1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJzcGlubmVyXCIgc3R5bGU9XCJhbmltYXRpb24tZHVyYXRpb246ICR7bXN9c1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJyaWdodC1oYWxmXCIgc3R5bGU9XCJhbmltYXRpb24tZHVyYXRpb246ICR7bXN9c1wiPjwvZGl2PjwvZGl2PiBQYXN0aW5nIGEgZmlsZSwgY2xpY2sgaGVyZSB0byBjYW5jZWwuJyxcclxuLy8gICAgICAgICByZW1vdmVDb25maXJtYXRpb246ICdFbGltaW5hcj8nLFxyXG4vLyAgICAgICAgIGVycm9yczoge1xyXG4vLyAgICAgICAgICAgICBmaWxlc0xpbWl0OiAnU29sbyBlcyBwb3NpYmxlIHN1YmlyICR7bGltaXR9IGltw6FnZW4uJyxcclxuLy8gICAgICAgICAgICAgZmlsZXNUeXBlOiAnU29sbyBzZSBhY2VwdGFuIGxvcyBmb3JtYXRvczogJHtleHRlbnNpb25zfS4nLFxyXG4vLyAgICAgICAgICAgICBmaWxlU2l6ZTogJyR7bmFtZX0gZXMgbXV5IGdyYW5kZXMhIFNlbGVjY2lvbmUgdW5hIGRlICR7ZmlsZU1heFNpemV9TUIuIGNvbW8gbcOheGltbycsXHJcbi8vICAgICAgICAgICAgIGZpbGVzU2l6ZUFsbDogJyR7bmFtZX0gc29uIG11eSBncmFuZGVzISBTZWxlY2Npb25lIHVuYXMgZGUgJHtmaWxlTWF4U2l6ZX1NQi4gY29tbyBtw6F4aW1vJyxcclxuLy8gICAgICAgICAgICAgZmlsZU5hbWU6ICdMYSBpbcOhZ2VuIGNvbiBlbCBub21icmUgJHtuYW1lfSB5YSBlc3TDoSBzZWxlY2Npb25hZGEuJyxcclxuLy8gICAgICAgICAgICAgZm9sZGVyVXBsb2FkOiAnTm8gZXN0w6EgcGVybWl0aWRvIHN1YmlyIGNhcnBldGFzLidcclxuLy8gICAgICAgICB9LFxyXG4vLyAgICAgICAgIGRpYWxvZ3M6IHtcclxuLy8gICAgICAgICAgICAgLy8gYWxlcnQgZGlhbG9nXHJcbi8vICAgICAgICAgICAgIGFsZXJ0OiBmdW5jdGlvbih0ZXh0KSB7XHJcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gYWxlcnRfY29uZmlybSh0ZXh0KTtcclxuLy8gICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgLy8gY29uZmlybSBkaWFsb2dcclxuLy8gICAgICAgICAgICAgY29uZmlybTogZnVuY3Rpb24odGV4dCwgY2FsbGJhY2spIHtcclxuLy8gICAgICAgICAgICAgICAgICdjb25maXJtKHRleHQpID8gY2FsbGJhY2soKSA6IG51bGw7J1xyXG4vLyAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgfSxcclxuLy8gICAgIH1cclxuLy8gfSk7XHJcblxyXG4kKCcjU2luZ2xlX0ltYWdlJykuZmlsZXVwbG9hZGVyKHtcclxuICAgIGV4dGVuc2lvbnM6IFsnanBnJywgJ2pwZWcnLCAncG5nJywgJ2dpZiddLFxyXG4gICAgbGltaXQ6IDEsXHJcbiAgICBhZGRNb3JlOiBmYWxzZSxcclxuICAgIGZpbGVNYXhTaXplOiAyLFxyXG4gICAgY2FwdGlvbnM6IHtcclxuICAgICAgICBidXR0b246IGZ1bmN0aW9uKG9wdGlvbnMpIHsgcmV0dXJuICdTZWxlY2Npb25hciAnICsgKG9wdGlvbnMubGltaXQgPT0gMSA/ICdJbcOhZ2VuJyA6ICdJbcOhZ2VuJyk7IH0sXHJcbiAgICAgICAgZmVlZGJhY2s6IGZ1bmN0aW9uKG9wdGlvbnMpIHsgcmV0dXJuICdBZ3JlZ2FyIGltw6FnZW5lcy4uLic7IH0sXHJcbiAgICAgICAgZmVlZGJhY2syOiBmdW5jdGlvbihvcHRpb25zKSB7IHJldHVybiBvcHRpb25zLmxlbmd0aCArICcgJyArIChvcHRpb25zLmxlbmd0aCA+IDEgPyAnIGltw6FnZW5lcyBzZWxlY2Npb25hZGFzJyA6ICcgaW3DoWdlbiBzZWxlY2Npb25hZGEnKTsgfSxcclxuICAgICAgICBkcm9wOiAnQXJyYXN0cmUgbGFzIGltw6FnZW5lcyBhcXXDrScsXHJcbiAgICAgICAgcGFzdGU6ICc8ZGl2IGNsYXNzPVwiZmlsZXVwbG9hZGVyLXBlbmRpbmctbG9hZGVyXCI+PGRpdiBjbGFzcz1cImxlZnQtaGFsZlwiIHN0eWxlPVwiYW5pbWF0aW9uLWR1cmF0aW9uOiAke21zfXNcIj48L2Rpdj48ZGl2IGNsYXNzPVwic3Bpbm5lclwiIHN0eWxlPVwiYW5pbWF0aW9uLWR1cmF0aW9uOiAke21zfXNcIj48L2Rpdj48ZGl2IGNsYXNzPVwicmlnaHQtaGFsZlwiIHN0eWxlPVwiYW5pbWF0aW9uLWR1cmF0aW9uOiAke21zfXNcIj48L2Rpdj48L2Rpdj4gUGFzdGluZyBhIGZpbGUsIGNsaWNrIGhlcmUgdG8gY2FuY2VsLicsXHJcbiAgICAgICAgcmVtb3ZlQ29uZmlybWF0aW9uOiAnRWxpbWluYXI/JyxcclxuICAgICAgICBlcnJvcnM6IHtcclxuICAgICAgICAgICAgZmlsZXNMaW1pdDogJ1NvbG8gZXMgcG9zaWJsZSBzdWJpciAke2xpbWl0fSBpbcOhZ2VuLicsXHJcbiAgICAgICAgICAgIGZpbGVzVHlwZTogJ1NvbG8gc2UgYWNlcHRhbiBsb3MgZm9ybWF0b3M6ICR7ZXh0ZW5zaW9uc30uJyxcclxuICAgICAgICAgICAgZmlsZVNpemU6ICdMYSBpbcOhZ2VuIHBlc2EgbXVjaG8hIEVsaWphIHVuYSBkZSAke2ZpbGVNYXhTaXplfU1CIGNvbW8gbcOheGltby4nLFxyXG4gICAgICAgICAgICBmaWxlTmFtZTogJ0xhIGltw6FnZW4gY29uIGVzZSBub21icmUgeWEgaGEgc2lkbyBlbGVnaWRhJyxcclxuICAgICAgICAgICAgZm9sZGVyVXBsb2FkOiAnTm8gZXN0w6EgcGVybWl0aWRvIHN1YmlyIGNhcnBldGFzLicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaWFsb2dzOiB7XHJcbiAgICAgICAgICAgIC8vIGFsZXJ0IGRpYWxvZ1xyXG4gICAgICAgICAgICBhbGVydDogZnVuY3Rpb24odGV4dCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFsZXJ0KHRleHQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBjb25maXJtIGRpYWxvZ1xyXG4gICAgICAgICAgICBjb25maXJtOiBmdW5jdGlvbih0ZXh0LCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgJ2NvbmZpcm0odGV4dCkgPyBjYWxsYmFjaygpIDogbnVsbDsnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vZW5hYmxlIGZpbGV1cGxvYWRlciBwbHVnaW5cclxuLy8gJCgnI0ltYWdlc1VwbG9hZGVyJykuZmlsZXVwbG9hZGVyKHtcclxuLy8gICAgIGV4dGVuc2lvbnM6IFsnanBnJywgJ2pwZWcnLCAncG5nJywgJ2dpZiddLFxyXG4vLyAgICAgYWRkTW9yZTogdHJ1ZSxcclxuLy8gICAgIGVuYWJsZUFwaTogdHJ1ZSxcclxuLy8gICAgIHRodW1ibmFpbHM6IHtcclxuLy8gICAgICAgICBvbkltYWdlTG9hZGVkOiBmdW5jdGlvbihpdGVtKSB7XHJcbi8vICAgICAgICAgICAgIGl0ZW0uaHRtbC5maW5kKCcuZmlsZXVwbG9hZGVyLWFjdGlvbi1yZW1vdmUnKS5iZWZvcmUoJzxhIGNsYXNzPVwiZmlsZXVwbG9hZGVyLWFjdGlvbiBmaWxldXBsb2FkZXItYWN0aW9uLXNvcnQgZmFzIGZhLXNvcnQgdGl0bGU9XCJTb3J0XCI+PGk+PC9pPjwvYT4nKTtcclxuLy8gICAgICAgICAgICAgaWYgKCFpdGVtLmh0bWwuZmluZCgnLmZpbGV1cGxvYWRlci1hY3Rpb24tZWRpdCcpLmxlbmd0aClcclxuLy8gICAgICAgICAgICAgICAgIGl0ZW0uaHRtbC5maW5kKCcuZmlsZXVwbG9hZGVyLWFjdGlvbi1yZW1vdmUnKS5iZWZvcmUoJzxhIGNsYXNzPVwiZmlsZXVwbG9hZGVyLWFjdGlvbiBmaWxldXBsb2FkZXItYWN0aW9uLXBvcHVwIGZpbGV1cGxvYWRlci1hY3Rpb24tZWRpdCBmYXMgZmEtZWRpdFwiIHRpdGxlPVwiRWRpdFwiPjxpPjwvaT48L2E+Jyk7XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgfSxcclxuLy8gICAgIGVkaXRvcjoge1xyXG4vLyAgICAgICAgIGNyb3BwZXI6IHtcclxuLy8gICAgICAgICAgICAgcmF0aW86ICcxOjEnLFxyXG4vLyAgICAgICAgICAgICBtaW5XaWR0aDogMTAwLFxyXG4vLyAgICAgICAgICAgICBtaW5IZWlnaHQ6IDEwMCxcclxuLy8gICAgICAgICAgICAgc2hvd0dyaWQ6IHRydWVcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9LFxyXG4vLyAgICAgc29ydGVyOiB7XHJcbi8vICAgICAgICAgc2VsZWN0b3JFeGNsdWRlOiBudWxsLFxyXG4vLyAgICAgICAgIHBsYWNlaG9sZGVyOiBudWxsLFxyXG4vLyAgICAgICAgIHNjcm9sbENvbnRhaW5lcjogd2luZG93LFxyXG4vLyAgICAgICAgIG9uU29ydDogZnVuY3Rpb24obGlzdCwgbGlzdEVsLCBwYXJlbnRFbCwgbmV3SW5wdXRFbCwgaW5wdXRFbCkge1xyXG4vLyAgICAgICAgICAgICAvLyBvblNvcnQgY2FsbGJhY2tcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vIH0pO1xyXG5cclxuXHJcbiQoJyNNdWx0aV9JbWFnZXMnKS5maWxldXBsb2FkZXIoe1xyXG4gICAgZXh0ZW5zaW9uczogWydqcGcnLCAnanBlZycsICdwbmcnLCAnZ2lmJywgJ2JtcCddLFxyXG4gICAgY2hhbmdlSW5wdXQ6ICcgJyxcclxuICAgIHRoZW1lOiAndGh1bWJuYWlscycsXHJcbiAgICBlbmFibGVBcGk6IHRydWUsXHJcbiAgICBhZGRNb3JlOiB0cnVlLFxyXG4gICAgZHJhZ0Ryb3A6IHtcclxuICAgICAgICAvLyBzZXQgdGhlIGRyb3AgY29udGFpbmVyIHtudWxsLCBTdHJpbmcsIGpRdWVyeSBPYmplY3R9XHJcbiAgICAgICAgLy8gZXhhbXBsZTogJ2JvZHknXHJcbiAgICAgICAgY29udGFpbmVyOiBudWxsLFxyXG4gICAgXHJcbiAgICAgICAgLy8gQ2FsbGJhY2sgZmlyZWQgb24gZW50ZXJpbmcgd2l0aCBkcmFnZ2luZyBmaWxlcyB0aGUgZHJvcCBjb250YWluZXJcclxuICAgICAgICBvbkRyYWdFbnRlcjogZnVuY3Rpb24oZXZlbnQsIGxpc3RFbCwgcGFyZW50RWwsIG5ld0lucHV0RWwsIGlucHV0RWwpIHtcclxuICAgICAgICAgICAgLy8gY2FsbGJhY2sgd2lsbCBnbyBoZXJlXHJcbiAgICAgICAgfSxcclxuICAgIFxyXG4gICAgICAgIC8vIENhbGxiYWNrIGZpcmVkIG9uIGxlYXZpbmcgd2l0aCBkcmFnZ2luZyBmaWxlcyB0aGUgZHJvcCBjb250YWluZXJcclxuICAgICAgICBvbkRyYWdMZWF2ZTogZnVuY3Rpb24oZXZlbnQsIGxpc3RFbCwgcGFyZW50RWwsIG5ld0lucHV0RWwsIGlucHV0RWwpIHtcclxuICAgICAgICAgICAgLy8gY2FsbGJhY2sgd2lsbCBnbyBoZXJlXHJcbiAgICAgICAgfSxcclxuICAgIFxyXG4gICAgICAgIC8vIENhbGxiYWNrIGZpcmVkIG9uIGRyb3BwaW5nIHRoZSBmaWxlcyBpbiB0aGUgZHJvcCBjb250YWluZXJcclxuICAgICAgICBvbkRyb3A6IGZ1bmN0aW9uKGV2ZW50LCBsaXN0RWwsIHBhcmVudEVsLCBuZXdJbnB1dEVsLCBpbnB1dEVsKSB7XHJcbiAgICAgICAgICAgIC8vIGNhbGxiYWNrIHdpbGwgZ28gaGVyZVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzb3J0ZXI6IHtcclxuICAgICAgICBzZWxlY3RvckV4Y2x1ZGU6IG51bGwsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6IG51bGwsXHJcbiAgICAgICAgc2Nyb2xsQ29udGFpbmVyOiB3aW5kb3csXHJcbiAgICAgICAgb25Tb3J0OiBmdW5jdGlvbihsaXN0LCBsaXN0RWwsIHBhcmVudEVsLCBuZXdJbnB1dEVsLCBpbnB1dEVsKSB7XHJcbiAgICAgICAgICAgICQoJyNGZWF0dXJlZEltYWdlTmFtZScpLnZhbChsaXN0WzBdWyduYW1lJ10pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0aHVtYm5haWxzOiB7XHJcbiAgICAgICAgb25JdGVtU2hvdzogZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAvLyBhZGQgc29ydGVyIGJ1dHRvbiB0byB0aGUgaXRlbSBodG1sPGkgY2xhc3M9XCJmYXMgZmEtc29ydFwiPjwvaT5cclxuICAgICAgICAgICAgaXRlbS5odG1sLmZpbmQoJy5maWxldXBsb2FkZXItYWN0aW9uLXJlbW92ZScpLmJlZm9yZSgnPGEgY2xhc3M9XCJmaWxldXBsb2FkZXItYWN0aW9uIGZpbGV1cGxvYWRlci1hY3Rpb24tc29ydCBmYXMgZmEtc29ydFwiIHRpdGxlPVwiU29ydFwiPjxpPjwvaT48L2E+Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBib3g6ICc8ZGl2IGNsYXNzPVwiZmlsZXVwbG9hZGVyLWl0ZW1zXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICc8dWwgY2xhc3M9XCJmaWxldXBsb2FkZXItaXRlbXMtbGlzdFwiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cImZpbGV1cGxvYWRlci10aHVtYm5haWxzLWlucHV0XCI+PGRpdiBjbGFzcz1cImZpbGV1cGxvYWRlci10aHVtYm5haWxzLWlucHV0LWlubmVyXCI+KzwvZGl2PjwvbGk+JyArXHJcbiAgICAgICAgICAgICAgICAgICc8L3VsPicgK1xyXG4gICAgICAgICAgICAgICc8L2Rpdj4nLFxyXG4gICAgICAgIGl0ZW06ICc8bGkgY2xhc3M9XCJmaWxldXBsb2FkZXItaXRlbVwiPicgKyBcclxuICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZmlsZXVwbG9hZGVyLWl0ZW0taW5uZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInRodW1ibmFpbC1ob2xkZXJcIj4ke2ltYWdlfTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiYWN0aW9ucy1ob2xkZXJcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhIGNsYXNzPVwiZmlsZXVwbG9hZGVyLWFjdGlvbiBmaWxldXBsb2FkZXItYWN0aW9uLXJlbW92ZVwiIHRpdGxlPVwiJHtjYXB0aW9ucy5yZW1vdmV9XCI+WDwvYT4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8YSBjbGFzcz1cImZpbGV1cGxvYWRlci1hY3Rpb24gZmlsZXVwbG9hZGVyLWFjdGlvbi1zb3J0XCIgdGl0bGU9XCJTb3J0XCI+PjwvYT4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImZpbGV1cGxvYWRlci1hY3Rpb24tcG9wdXBcIj48L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtaG9sZGVyXCI+JHtwcm9ncmVzc0Jhcn08L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgJzwvbGk+JyxcclxuXHJcbiAgICAgICAgc3RhcnRJbWFnZVJlbmRlcmVyOiB0cnVlLFxyXG4gICAgICAgIGNhbnZhc0ltYWdlOiBmYWxzZSxcclxuICAgICAgICBfc2VsZWN0b3JzOiB7XHJcbiAgICAgICAgICAgIGxpc3Q6ICcuZmlsZXVwbG9hZGVyLWl0ZW1zLWxpc3QnLFxyXG4gICAgICAgICAgICBpdGVtOiAnLmZpbGV1cGxvYWRlci1pdGVtJyxcclxuICAgICAgICAgICAgc3RhcnQ6ICcuZmlsZXVwbG9hZGVyLWFjdGlvbi1zdGFydCcsXHJcbiAgICAgICAgICAgIHJldHJ5OiAnLmZpbGV1cGxvYWRlci1hY3Rpb24tcmV0cnknLFxyXG4gICAgICAgICAgICBzb3J0ZXI6ICcuZmlsZXVwbG9hZGVyLWFjdGlvbi1zb3J0JyxcclxuICAgICAgICAgICAgcmVtb3ZlOiAnLmZpbGV1cGxvYWRlci1hY3Rpb24tcmVtb3ZlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25JdGVtU2hvdzogZnVuY3Rpb24oaXRlbSwgbGlzdEVsLCBwYXJlbnRFbCwgbmV3SW5wdXRFbCwgaW5wdXRFbCkge1xyXG4gICAgICAgICAgICB2YXIgcGx1c0lucHV0ID0gbGlzdEVsLmZpbmQoJy5maWxldXBsb2FkZXItdGh1bWJuYWlscy1pbnB1dCcpLFxyXG4gICAgICAgICAgICAgICAgYXBpID0gJC5maWxldXBsb2FkZXIuZ2V0SW5zdGFuY2UoaW5wdXRFbC5nZXQoMCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcGx1c0lucHV0Lmluc2VydEFmdGVyKGl0ZW0uaHRtbClbYXBpLmdldE9wdGlvbnMoKS5saW1pdCAmJiBhcGkuZ2V0Q2hvb3NlZEZpbGVzKCkubGVuZ3RoID49IGFwaS5nZXRPcHRpb25zKCkubGltaXQgPyAnaGlkZScgOiAnc2hvdyddKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZihpdGVtLmZvcm1hdCA9PSAnaW1hZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmh0bWwuZmluZCgnLmZpbGV1cGxvYWRlci1pdGVtLWljb24nKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYWZ0ZXJSZW5kZXI6IGZ1bmN0aW9uKGxpc3RFbCwgcGFyZW50RWwsIG5ld0lucHV0RWwsIGlucHV0RWwpIHtcclxuICAgICAgICB2YXIgcGx1c0lucHV0ID0gbGlzdEVsLmZpbmQoJy5maWxldXBsb2FkZXItdGh1bWJuYWlscy1pbnB1dCcpLFxyXG4gICAgICAgICAgICBhcGkgPSAkLmZpbGV1cGxvYWRlci5nZXRJbnN0YW5jZShpbnB1dEVsLmdldCgwKSk7XHJcbiAgICBcclxuICAgICAgICBwbHVzSW5wdXQub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGFwaS5vcGVuKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGxpc3RFbCwgcGFyZW50RWwsIG5ld0lucHV0RWwsIGlucHV0RWwpIHtcclxuICAgICAgICB2YXIgcGx1c0lucHV0ID0gbGlzdEVsLmZpbmQoJy5maWxldXBsb2FkZXItdGh1bWJuYWlscy1pbnB1dCcpLFxyXG4gICAgICAgICAgICBhcGkgPSAkLmZpbGV1cGxvYWRlci5nZXRJbnN0YW5jZShpbnB1dEVsLmdldCgwKSk7XHJcbiAgICBcclxuICAgICAgICBpZiAoYXBpLmdldE9wdGlvbnMoKS5saW1pdCAmJiBhcGkuZ2V0Q2hvb3NlZEZpbGVzKCkubGVuZ3RoIC0gMSA8IGFwaS5nZXRPcHRpb25zKCkubGltaXQpXHJcbiAgICAgICAgICAgIHBsdXNJbnB1dC5zaG93KCk7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgIC8vIHdoaWxlIHVzaW5nIHVwbG9hZCBvcHRpb24sIHBsZWFzZSBzZXRcclxuICAgIC8vIHN0YXJ0SW1hZ2VSZW5kZXJlcjogZmFsc2VcclxuICAgIC8vIGZvciBhIGJldHRlciBlZmZlY3RcclxuICAgIHVwbG9hZDoge1xyXG4gICAgICAgIHVybDogJy4vcGhwL3VwbG9hZF9maWxlLnBocCcsXHJcbiAgICAgICAgZGF0YTogbnVsbCxcclxuICAgICAgICB0eXBlOiAnUE9TVCcsXHJcbiAgICAgICAgZW5jdHlwZTogJ211bHRpcGFydC9mb3JtLWRhdGEnLFxyXG4gICAgICAgIHN0YXJ0OiB0cnVlLFxyXG4gICAgICAgIHN5bmNocm9uOiB0cnVlLFxyXG4gICAgICAgIGJlZm9yZVNlbmQ6IG51bGwsXHJcbiAgICAgICAgb25TdWNjZXNzOiBmdW5jdGlvbihkYXRhLCBpdGVtKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmh0bWwuZmluZCgnLnByb2dyZXNzLWhvbGRlcicpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIGl0ZW0ucmVuZGVyVGh1bWJuYWlsKCk7XHJcbiAgICAgICAgICAgIH0sIDQwMCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkVycm9yOiBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uaHRtbC5maW5kKCcucHJvZ3Jlc3MtaG9sZGVyJykuaGlkZSgpO1xyXG4gICAgICAgICAgICBpdGVtLmh0bWwuZmluZCgnLmZpbGV1cGxvYWRlci1pdGVtLWljb24gaScpLnRleHQoJ0ZhaWxlZCEnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uUHJvZ3Jlc3M6IGZ1bmN0aW9uKGRhdGEsIGl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIHByb2dyZXNzQmFyID0gaXRlbS5odG1sLmZpbmQoJy5wcm9ncmVzcy1ob2xkZXInKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKHByb2dyZXNzQmFyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyLmZpbmQoJy5maWxldXBsb2FkZXItcHJvZ3Jlc3NiYXIgLmJhcicpLndpZHRoKGRhdGEucGVyY2VudGFnZSArIFwiJVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBkcmFnRHJvcDoge1xyXG4gICAgICAgIGNvbnRhaW5lcjogJy5maWxldXBsb2FkZXItdGh1bWJuYWlscy1pbnB1dCdcclxuICAgIH0sXHJcbiAgICBvblJlbW92ZTogZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICQucG9zdCgncGhwL3VwbG9hZF9yZW1vdmUucGhwJywge1xyXG4gICAgICAgICAgICBmaWxlOiBpdGVtLm5hbWVcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAqL1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIHNldEltYWdlT3JkZXJJbnB1dHMoKSBcclxue1xyXG4gICAgY29uc29sZS5sb2coXCJBZ3JlZ2FuZG8gSW5wdXRzXCIpO1xyXG4gICAgJCgnI09yZGVySW5wdXRzJykuaHRtbChcIjxpbnB1dCB2YWx1ZT0nb3JkZXInIG5hbWU9J1Rlc3QnPiBPcmRlblwiKTtcclxufVxyXG5cclxuXHJcbiQoJy5EaXNwbGF5LUlucHV0LU1vZGlmaWNhYmxlJykuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2Rpc3BsYXktaW5wdXQtZGlzYWJsZWQnKTsgXHJcbn0pO1xyXG5cclxuXHJcbi8vIC0tLS0gTW9kaWZpY2FibGUgaW5wdXQgdGV4dFxyXG4vLyBIdG1sIGVsZW1lbnRcclxuLy88cCBkYXRhLWVkaXRhYmxlIGNsYXNzPVwiU2x1Z0lucHV0XCI+e3sgJGFydGljbGUtPnNsdWcgfX08L3A+ICAgXHJcblxyXG4kKCdib2R5Jykub24oJ2NsaWNrJywgJ1tkYXRhLWVkaXRhYmxlXScsIGZ1bmN0aW9uKCl7XHJcbiAgXHJcbiAgICB2YXIgJGVsID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgdmFyICRpbnB1dCA9ICQoJzxpbnB1dC8+JykudmFsKCAkZWwudGV4dCgpICk7XHJcbiAgICAkZWwucmVwbGFjZVdpdGgoICRpbnB1dCApO1xyXG4gICAgXHJcbiAgICB2YXIgc2F2ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciAkcCA9ICQoJzxwIGRhdGEtZWRpdGFibGUgLz4nKS50ZXh0KCAkaW5wdXQudmFsKCkgKTtcclxuICAgICAgJGlucHV0LnJlcGxhY2VXaXRoKCAkcCApO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgIFdlJ3JlIGRlZmluaW5nIHRoZSBjYWxsYmFjayB3aXRoIGBvbmVgLCBiZWNhdXNlIHdlIGtub3cgdGhhdFxyXG4gICAgICB0aGUgZWxlbWVudCB3aWxsIGJlIGdvbmUganVzdCBhZnRlciB0aGF0LCBhbmQgd2UgZG9uJ3Qgd2FudCBcclxuICAgICAgYW55IGNhbGxiYWNrcyBsZWZ0b3ZlcnMgdGFrZSBtZW1vcnkuIFxyXG4gICAgICBOZXh0IHRpbWUgYHBgIHR1cm5zIGludG8gYGlucHV0YCB0aGlzIHNpbmdsZSBjYWxsYmFjayBcclxuICAgICAgd2lsbCBiZSBhcHBsaWVkIGFnYWluLlxyXG4gICAgKi9cclxuICAgICRpbnB1dC5vbmUoJ2JsdXInLCBzYXZlKS5mb2N1cygpO1xyXG4gICAgXHJcbiAgfSk7XHJcbiAgXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy92YWRtaW4tZm9ybXMuanMiXSwic291cmNlUm9vdCI6IiJ9