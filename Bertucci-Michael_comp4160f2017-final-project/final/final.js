/*
  Name: Michael Bertucci
  Email: Michael_Bertucci@student.uml.edu
  UMass Lowell, COMP.4610 GUI Programming I
  Created: Dec. 11, 2017
  Final Project

  Sources:
  https://code.tutsplus.com/tutorials/build-a-canvas-image-editor-with-canvas--net-18143
  https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas
  https://github.com/haltu/muuri
  https://haltu.github.io/muuri/
  jQuery API
*/



var grid_item_template = "<div class=\"grid-item\"><div class=\"grid-item-content\">" +
              "<a href={{imgUrl}} data-lightbox=\"image-clickable\">" +
                "<img class=\"image\" src={{imgUrl}} alt=\"Image\">" +
              "</a>" +
                "<div class=\"ctrl-buttons\">" +
                  "<button class=\"edit ctrl-btn\">Edit</button>" +
                  "<button class=\"share ctrl-btn\">Share</button>" +
                  "<button class=\"delete ctrl-btn\">Delete</button>" +
                "</div>" +
            "</div></div>";

var editor_template =   "<div id=\"imageEditor\">" +
    "<section id=\"editorContainer\">" +
      "<canvas id=\"editor\" width=\"480\" height=\"480\"></canvas>" + 
    "</section>" + 
    "<section id=\"toolbar\">" +
      "<a id=\"save\" href=\"#\" title=\"Save\">Save</a>" + 
      "<a id=\"brightness\" href=\"#\" title=\"Change Brightness\">Brightness</a>" + 
      "<a id=\"rotateR\" href=\"#\" title=\"Rotate right\">Rotate</a>" + 
      "<a id=\"crop\" href=\"#\" title=\"Resize\">Crop</a>" + 
      "<a id=\"greyscale\" href=\"#\" title=\"Convert to grayscale\">B&W</a>" + 
      "<a id=\"contrast\" href=\"#\" title=\"Change contrast\">Contrast</a>" + 
    "</section>" + 
  "</div>"; 

var share_template =   "<div class=\"share-dialog\">" +
    "<a href=\"https://www.facebook.com/sharer/sharer.php?u={{imgUrl_noQuote}}\" target=\"_blank\">" +
      "<button class=\"facebook-button\">Share on Facebook</button>" +
    "</a>" +
    "<p class=\"link-description\">Public Hyperlink:</p>" +
    "<a class=\"link-description\" href={{imgUrl}} target=\"_blank\">{{imgUrl_noQuote}}</a>" +
  "</div>";

var imagePath = "http://weblab.cs.uml.edu/~mbertucc/final/images/";

// Must be done before DOM loaded
Dropzone.options.uploadDropzone = {
    acceptedFiles: "image/*",
    maxFiles: 10,
    maxFileSize: 2,
    init: function() {
      this.on("success", function(file, response) {
        console.log(response);
        var _this = this;
        addImageToList(imagePath + response, muuri);
        $(file.previewElement).fadeOut({    // fade out thumbnail before removing
          complete: function() {
            _this.removeFile(file);
          },
          duration: 3000
        });
      });
      this.on("error", function(file, error) {
        console.log(error);
      });
    }
};

var model = [];

var muuri;  // This is the reorderable grid of image displays

var editDialog;

document.addEventListener('DOMContentLoaded', function () {


  var docElem = document.documentElement;
  var dragCounter = 0;
  var container = document.querySelector('.grid');

    muuri = new Muuri(container, {
      items: '.grid-item',
      layoutDuration: 400,
      layoutEasing: 'ease',
      dragEnabled: true,
      dragStartPredicate: {distance: 5, delay: 0, handle: false},
      dragSort: true,
      dragSortInterval: 0,
      dragContainer: document.body,
      dragReleaseDuration: 400,
      dragReleaseEasing: 'ease'
    })
    .on('dragStart', function (item) {
      ++dragCounter;
      docElem.classList.add('dragging');
      item.getElement().style.width = item.getWidth() + 'px';
      item.getElement().style.height = item.getHeight() + 'px';
    })
    .on('dragEnd', function (item) {
      if (--dragCounter < 1) {
        docElem.classList.remove('dragging');
      }
    })
    .on('move', function(data) {
      console.log(model);
      localStorage.savedOrder = JSON.stringify( getUrlsInCurrentGridOrder() );
      console.log("CURRENT ORDER: " + localStorage.savedOrder);
    });


  // Initialize grid list with images from server
  addImagesFromServer(muuri);


});  //document.addEventListener


function makeShareDialog(imgUrl) {
  var newItem = document.createElement('div');
  var itemContent = share_template.replace( /{{imgUrl}}/g, "\'" + imgUrl + "\'");
  itemContent = itemContent.replace( /{{imgUrl_noQuote}}/g, imgUrl);
  newItem.innerHTML = itemContent;
  newItem = newItem.firstChild;

  var shareDialog = $( newItem ).dialog({
      autoOpen: false,
      height: "auto",
      width: "auto",
      modal: true,
      close: function( event, ui ) {
        $(this).dialog('destroy').remove();
      }
    });
  shareDialog.dialog("open");
}


// Structure of this function was taken from the tutorial at
// https://code.tutsplus.com/tutorials/build-a-canvas-image-editor-with-canvas--net-18143
function makeEditDialog(imgUrl) {

console.log("Got image: " + imgUrl);

  var newItem = document.createElement('div');
  newItem.innerHTML = editor_template;
  newItem = newItem.firstChild;

  var editor = newItem.querySelector("#editor"),
               context = editor.getContext("2d"),       
               //create/load image 
               image = $("<img/>", { 
                src: imgUrl,
                crossorigin:"Anonymous",
                load: function() { 
                  var scaleW = editor.width / this.width;
                  var scaleH = editor.height / this.height;
                  var smallerRatio = Math.min(scaleW, scaleH);
                  var centerShift_x = ( editor.width - this.width*smallerRatio ) / 2;
                  var centerShift_y = ( editor.height - this.height*smallerRatio ) / 2;
                  context.clearRect(0, 0, editor.width, editor.height);
                  context.drawImage(this, 0, 0, this.width, this.height,
                                    centerShift_x, centerShift_y, this.width * smallerRatio, this.height * smallerRatio);   
                  } 
                }), 
                tools = { 
                //output to <img>  
                  save: function() { 
                  cman.save(imgUrl);
                  },

                  rotate: function(conf) { 

                  }, 
                  brightness: function() { 
                    cman.brightness(50);
                    cman.render();
                  }, 
                  rotateR: function() { 

                  },
                  crop: function() { 
                    cman.crop(200, 200);
                    cman.render();
                  },
                  greyscale: function() { 
                    cman.greyscale();
                    cman.render();
                  },
                  contrast: function() { 
                    cman.contrast(15);
                    cman.render();
                  }

                }; //tools

  var cman = Caman(editor, function() {
  });

  $(newItem.querySelector("#toolbar")).children().click(function(e) { 
    e.preventDefault();          
    //call the relevant function 
    tools[this.id].call(this); 
  });


  editDialog = $( newItem ).dialog({
      autoOpen: false,
      height: "auto",
      width: "auto",
      modal: true,
      close: function( event, ui ) {
        $(this).dialog('destroy').remove();
      }
    });
  editDialog.dialog("open");

}


function getUrlsInCurrentGridOrder() {
  var urlList = [];
  var elements = muuri.getItems();

  elements.forEach(function(item) {
    urlList.push( getImageUrlFromGridItem(item.getElement()) );
  });

  return urlList;
}


function addImagesFromServer(grid) {

$.ajax({
            url: "http://weblab.cs.uml.edu/~mbertucc/final/getImages.php",
            dataType: "json",
            success: function (data) {
                model.splice(0, model.length);  // clear model
                $.each(data, function(i,filename) {
                    console.log('<img src="'+ imagePath + filename +'"><br>');
                    model.push(imagePath + filename);
                });
                setGridFromModel(grid);
            }
        });

}


function setGridFromModel(grid) {
  var modelCopy = model;
  var newOrder = [];

  if(localStorage.getItem('savedOrder')) {
    var oldOrder = JSON.parse(localStorage.savedOrder);
    console.log("OLD: " + oldOrder);

    oldOrder.forEach(function(key) {
      var found = false;
      modelCopy = modelCopy.filter(function(item) {
        if(!found && item == key) {
            newOrder.push(item);
            found = true;
            return false;
        } else 
            return true;
      });
    });
    newOrder = newOrder.concat(modelCopy);

  } else {
    newOrder = modelCopy;
  }
  console.log("SORTED:  " + newOrder);

  newOrder.forEach(function(url) {
    addImageToList(url, grid);
  });
}


function addImageToList(imgUrl, grid) {
  var item = document.createElement('div');
  var itemContent = grid_item_template.replace( /{{imgUrl}}/g, "\'" + imgUrl + "\'");
  item.innerHTML = itemContent;

  // This is necessary to make the grid item resize around the image after it has loaded
  item.querySelector("img").addEventListener("load", function() { 
    console.log('onload!'); 
    grid.refreshItems().layout(); 
  });

  item.querySelector(".delete").addEventListener("click", function() {
    console.log("delete clicked");

    var url = getImageUrlFromGridItem(this);
    var _this = this;

    // Delete image from server, remove from UI if successful
    $.ajax({
      url: 'http://weblab.cs.uml.edu/~mbertucc/final/delete.php',
      type: 'POST',
      data: {'path':url},
      success: function() {
        removeImageFromList(_this, grid);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(errorThrown);
      }
    });
  });  // "delete" listener

  item.querySelector(".edit").addEventListener("click", function() {
    console.log("edit clicked");

    makeEditDialog(imgUrl);
  });  // "edit" listener

  item.querySelector(".share").addEventListener("click", function() {
    console.log("edit clicked");

    makeShareDialog(imgUrl);
  });  // "share" listener

  grid.add(item.firstChild);
}

function removeImageFromList(clickedItem, grid) {
  var elem = clickedItem.closest('.grid-item');

  grid.hide(elem, {
    onFinish: function (items) {
      var item = items[0];
      grid.remove(item, {removeElements: true});
      grid.synchronize();
  }});
}

function getImageUrlFromGridItem(clickedItem) {

  // First get root div of item
  var elem = clickedItem.closest('.grid-item');

  // Then from there find the img element
  elem = elem.querySelector('img');

  if (elem != null) {
    return elem.getAttribute("src");
  } else {
    return "";
  }
}
