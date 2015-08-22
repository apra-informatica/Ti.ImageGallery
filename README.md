# Ti.ImageGallery
Image gallery widget for Appcelerator Titanium

With this image gallery it's possible to show a sequence of local images, scrolling them by lateral buttons or using a simple "navigation" panel of thumbnails.
Images are zoomable, scrollable and pinchable on iOS and Android.

It uses https://github.com/apra-informatica/Ti.ImageViewer, which uses module org.iotashan.TiTouchImageView (on Android), and both these widget and module should be installed.

![image](docs/screenshot1.png?raw=true)

## Installation

Add in your *config.json*, under `dependencies`:

```
"dependencies": {
    "it.apra.tiimagegallery": "*"
}
```

## Usage
```javascript
var imagesData = itemImages.map(function(itemImage){
	return {
		'filepath' : '...', // image detail path
		'filename' : '...', // image detail filename
		'filepathThumb' : '...', // image thumb path
		'fetchFunction' : function(params){ // function for fetching of detail image
			params = params || {};
			params.success = params.success || function(){return;};
			params.error = params.error || function(e) { Ti.API.warn(e); };
			
			// ...
		},
		'fetchFunctionThumb' : function(params){ // function for fetching of thumb image
			params = params || {};
			params.success = params.success || function(){return;};
			params.error = params.error || function(e) { Ti.API.warn(e); };
			
			// ...
		}
	};
});

gallery = Alloy.createWidget('it.apra.tiimagegallery', {
	'imagesData': imagesData,
	'backgroundColor' : 'white',
	'emptyViewLabelParams' : {'color' : 'black'},
	'thumbsDefaultImage' : '/images/imageUnavailable.png'
});
```

**Args**
* **imagesData**: Images data array (object literals properties are showed in the example)
* **currentPage**: Page to show (default 0)
* **backgroundColor**: Background color (default 'black')
* **viewerParams**: Optional parameters for the tiimageviewer widget
* **emptyViewLabelParams**: Optional parameters for label used in empty views
* **loadingViewSpinnerImages**: Optional array of images used in the loading spinner
* **thumbsDefaultImage**: Optional image used as placeholder while thumbs are downloading
* **thumbsOpacity**: Optional opacity of thumbnails view (default 0.9)
* **thumbsDefaultDown**: If true keep down the thumbnails view as default
* **thumbsHidden**: If true hide thumbnails view (as default hided only in case of handheld device)
* **showMultiple**: If false only first image is showed

**Functions**
* **removeEventListeners**: remove all listeners on controls
* **isThumbsViewerVisible**: return if thumbs are visible

##Notes
* Could be useful having a bidirectionality between detail and thumbnails viewer. Also a preload of images close to the current one would be nice.
* Feel free to get the code and change it, any improving would be appreciated.