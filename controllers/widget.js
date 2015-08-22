var args = arguments[0] || {},
	imagesData = args.imagesData || [],
	currentPage = args.currentPage || 0,
	viewerParams = args.viewerParams || {},
	backgroundColor = args.backgroundColor || 'black',
	emptyViewLabelParams = args.emptyViewLabelParams,
	loadingViewSpinnerImages = args.loadingViewSpinnerImages,
	thumbsDefaultImage = args.thumbsDefaultImage,
	thumbsOpacity = args.thumbsOpacity || 0.9,
	thumbsDefaultDown = args.thumbsDefaultDown || false,
	thumbsHidden = !_.isUndefined(args.thumbsHidden) ? args.thumbsHidden : Alloy.isHandheld,
	showMultiple = !_.isUndefined(args.showMultiple) ? args.showMultiple : true;

var imageViewers, createEmptyView, createLoadingView, createViewer, updateView, loadView,
	showPage, scrollLeftContainerClick, scrollRightContainerClick, thumbsViewerToggle, thumbsViewerSwipe,
	isThumbsViewerVisible, removeEventListeners, showThumbsAnimation, hideThumbsAnimation, thumbsViewerBottomHidden,
	thumbsViewerBottomShowed, thumbsViewerShow, thumbsViewerHide, thumbsButtonImageOpen, thumbsButtonImageClose;

imageViewers = [];

thumbsViewerBottomHidden = "-160dp";
thumbsViewerBottomShowed = "0dp";

showThumbsAnimation = Ti.UI.createAnimation({
	'bottom': thumbsViewerBottomShowed,
	'duration': 300
});
hideThumbsAnimation = Ti.UI.createAnimation({
	'bottom': thumbsViewerBottomHidden,
	'duration': 300
});
thumbsButtonImageOpen = WPATH("/images/btn_open_thumbs.png");
thumbsButtonImageClose = WPATH("/images/btn_close_thumbs.png");

Ti.API.debug("Creating image gallery for data " + JSON.stringify(imagesData));

if (!showMultiple && imagesData.length > 1){
	Ti.API.info("Truncating images, showing only first in priority");
	imagesData = [imagesData[0]];
}

createEmptyView = function(params){
	params = params || {};
	params.hideLabel = params.hideLabel || false;
	
	var view, labelParams;
	
	view = Ti.UI.createView({'width' : Ti.UI.FILL, 'height': Ti.UI.FILL, 'backgroundColor' : backgroundColor});
	
	if (!params.hideLabel){
		labelParams = {'text' : L('tiimagegallery.imageUnavailable', "Image not found"), 'color' : 'white'};
		_.extend(labelParams, emptyViewLabelParams);
		view.add(Ti.UI.createLabel(labelParams));
	}
	
	return view;
};
createLoadingView = function(){
	var wrapper, spinner, spinnerImages;
	
	wrapper = Ti.UI.createView({'layout' : 'composite', 'width' : Ti.UI.FILL, 'height': Ti.UI.FILL, 'backgroundColor' : backgroundColor});
	
	spinnerImages = loadingViewSpinnerImages || [
		WPATH('/images/loading_1.png'),
		WPATH('/images/loading_2.png'),
		WPATH('/images/loading_3.png'),
		WPATH('/images/loading_4.png'),
		WPATH('/images/loading_5.png'),
		WPATH('/images/loading_6.png'),
		WPATH('/images/loading_7.png'),
		WPATH('/images/loading_8.png'),
		WPATH('/images/loading_9.png')
	];
	spinner = Ti.UI.createImageView({
		'backgroundColor' : 'transparent',
		'width' : '64dp',
		'height' : '64dp',
		'images' : spinnerImages
	});
	wrapper.add(spinner);
	spinner.start();
	
	return wrapper;
};

createViewer = function(index, filepath, filename, description){
	Ti.API.debug("Creating widget for " + filename);
	
	var params = viewerParams;
	_.extend(params, {
		'image' : filepath,
		'title' : filename,
		'subtitle' : description,
		'backgroundColor' : backgroundColor,
		'lowerInfoHidden' : viewerParams.lowerInfoHidden
	});
	
	return Widget.createWidget('it.apra.tiimageviewer', params);
};

updateView = function(params){
	params = params || {};
	params.index = params.index;
	params.view = params.view;
	params.viewer = params.viewer;
	
	if (imageViewers[params.index]){
		imageViewers[params.index].removeEventListeners();
		imageViewers[params.index] = null;
	}
	if (params.viewer){
		imageViewers[params.index] = params.viewer;
	}
	
	var views = $.scrollableView.views;
	views[params.index].removeAllChildren();
	views[params.index] = params.viewer ? params.viewer.getView() : params.view;
	$.scrollableView.views = views;
	
	if (params.viewer){
		params.viewer.reloadImage();
	}
};

loadView = function(page){
	var imageData, imageFile;
	
	imageData = imagesData[page];
	imageFile = Ti.Filesystem.getFile(imageData.filepath);
	
	if (imageFile.exists()){
		updateView({
			'index' : page,
			'viewer' : createViewer(page, imageData.filepath, imageData.filename, imageData.description)
		});
	} else {
		Ti.API.debug("Image doesn't exists: " + imageData.filepath);
		
		if (Ti.Network.online && imageData.fetchFunction){
			updateView({'index' : page, 'view' : createLoadingView()});
			
			imageData.fetchFunction({
				'success' : function(e){
					Ti.API.debug("Image downloaded: " + imageData.filepath + " at page " + page);
					
					updateView({
						'index' : page,
						'viewer' : createViewer(page, imageData.filepath, imageData.filename, imageData.description)
					});
				}
			});
		}
	}
};

showPage = function(newPage){
	newPage = Math.max(newPage, 0);
	newPage = Math.min(newPage, imagesData.length - 1);
	
	loadView(newPage);
	
	$.scrollableView.scrollToView(newPage);
	
	$.scrollLeftContainer.visible = (newPage > 0);
	$.scrollLeftContainer.layout = 'absolute';
	$.scrollRightContainer.visible = (newPage < imagesData.length - 1);
	$.scrollRightContainer.layout = 'absolute';
};

isThumbsViewerVisible = function(){
	return $.thumbsViewer.visible && $.thumbsViewer.bottom === thumbsViewerBottomShowed;
};

scrollLeftContainerClick = function(){
	showPage($.scrollableView.currentPage - 1);
};
$.scrollLeftContainer.addEventListener('click', scrollLeftContainerClick);

scrollRightContainerClick = function(){
	showPage($.scrollableView.currentPage + 1);
};
$.scrollRightContainer.addEventListener('click', scrollRightContainerClick);

thumbsViewerHide = function(){
	$.thumbsViewer.animate(hideThumbsAnimation, function(){
		$.thumbsViewer.bottom = thumbsViewerBottomHidden;
		$.thumbsButton.backgroundImage = thumbsButtonImageOpen;
	});
};
thumbsViewerShow = function(){
	$.thumbsViewer.animate(showThumbsAnimation, function(){
		$.thumbsViewer.bottom = thumbsViewerBottomShowed;
		$.thumbsButton.backgroundImage = thumbsButtonImageClose;
	});
};
thumbsViewerToggle = function(){
	if (isThumbsViewerVisible()){
		thumbsViewerHide();
	} else {
		thumbsViewerShow();
	}
};
$.thumbsButton.addEventListener('click', thumbsViewerToggle);

thumbsViewerSwipe = function(e){
	if (e.direction === 'up' || e.direction === 'down'){
		thumbsViewerToggle(e);
	}
};
$.thumbsViewer.addEventListener('swipe', thumbsViewerSwipe);

removeEventListeners = function(){
	Ti.API.debug('tiImageGallery: removing event listeners');
	
	$.scrollLeftContainer.removeEventListener('click', scrollLeftContainerClick);
	$.scrollRightContainer.removeEventListener('click', scrollRightContainerClick);
	$.thumbsButton.removeEventListener('click', thumbsViewerToggle);
	$.thumbsViewer.removeEventListener('swipe', thumbsViewerSwipe);
	
	_.each(imageViewers, function(imageViewer, i){
		if (imageViewer){
			imageViewer.removeEventListeners();
		}
	});
};

if (thumbsDefaultDown){
	$.thumbsViewer.bottom = thumbsViewerBottomHidden;
	$.thumbsButton.backgroundImage = thumbsButtonImageOpen;
} else {
	$.thumbsViewer.bottom = thumbsViewerBottomShowed;
	$.thumbsButton.backgroundImage = thumbsButtonImageClose;
}

_.each(imagesData, function(imageData, imageIndex){
	$.scrollableView.addView(createEmptyView());
});
$.scrollableView.currentPage = currentPage;

if (imagesData.length <= 1 || thumbsHidden){
	$.thumbsViewer.visible = false;
	$.thumbsButton.visible = false;
} else {
	$.thumbsViewer.opacity = thumbsOpacity;
	
	_.each(imagesData, function(imageData, itemIndex){
		var imagePath, imageView;
		
		if (!Ti.Filesystem.getFile(imageData.filepathThumb).exists() && thumbsDefaultImage){
			imagePath = thumbsDefaultImage;
		} else {
			imagePath = imageData.filepathThumb;
		}
		
		imageView = Ti.UI.createImageView({
			'image': imagePath,
			'left': "10dp",
			'top': "5dp",
			'width': "150dp",
			'height': "150dp"
		});
		imageView.addEventListener('singletap', function(){
			if (itemIndex !== $.scrollableView.currentPage){
				showPage(itemIndex);
			}
		});
		
		$.thumbsContainer.add(imageView);
		
		if (!Ti.Filesystem.getFile(imageData.filepathThumb).exists() && imageData.fetchFunctionThumb){
			imageData.fetchFunctionThumb({'success' : function(){
				imageView.image = imageData.filepathThumb;
			}});
		}
	});
}

showPage(currentPage);


exports.removeEventListeners = removeEventListeners;
exports.isThumbsViewerVisible = isThumbsViewerVisible;