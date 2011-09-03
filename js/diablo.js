/**
 * @var object Our XBMC object
 */
var _xbmc = null;
/**
 * @var int The current tab
 */
var _tabId = null;
/**
 * @var string
 */
var _diabloInfo = " \
	<h2>Welcome to Diablo!</h2> \
	<p></p> \
	<p>Please visit the <a href=\"http://github.com/lucifurious/xbmc-diablo/\">Diablo website</a> for support</p> \
";

/**
 * Loads appropriate genre list
 * @param genre
 * @param pane
 */
var _loadGenres = function(genre,pane) {

	var _library = false;

	if ( 'music' == genre.toLowerCase().trim() ) {
		_library = _xbmc.AudioLibrary;
	} else if ( 'video' == genre.toLowerCase().trim() ) {
		_library = _xbmc.VideoLibrary;
	} else {
		$().toastmessage(
			'showToast',
			{
				text     : 'Unable to load genres of type "' + genre + '"',
				sticky   : true,
				type     : 'error'
			}
		);

		return;
	}

	var _selector = '#'+genre+'-item-genre-list';

	if ( $(_selector,pane).children().length ) {
		console.log('already have genres');
		return;
	}

	var $_loader = $().toastmessage(
		'showToast',
		{
			text     : '<h2>Loading...</h2><p>Something wonderful is happening now.</p>',
			title	 : 'Loading...',
			sticky   : true,
			type     : 'loading'
		}
	);

	$('span.genres-loading').css({display:"inline-block"}).show();

	_library('getGenres',function(response) {
		$().toastmessage('removeToast',$_loader);

		if (response.result && response.result.genres) {
			var $_list = $(_selector);
			$_list.empty().hide();

			$.each(response.result.genres,function(index,item) {
				$_list.append('<h3><a href="#">'+item.label+'</a></h3><div class="sub-page-info"></div>');
			});

			//	Setup the accordion
			$(_selector).accordion().css({overflow:'auto'}).show();
		}

		$('span.genres-loading').hide();
	});

};

/**
 * Loads album list
 * @param pane
 */
var _loadAlbums = function(pane) {

	var _library = _xbmc.AudioLibrary;

	if ( $('.music-item-album-list',pane).children().length ) {
		return;
	}

	var $_loader = $().toastmessage(
		'showToast',
		{
			text     : '<h2>Loading...</h2><p>Something wonderful is happening now.</p>',
			sticky   : true,
			type     : 'loading'
		}
	);

	$('span.albums-loading').css({display:"inline-block"}).show();

	_library('getAlbums',{

		params : {
			limits: {
				start : 0,
				end : 50
			}
		},

		success : function(response) {
			if (response.result && response.result.albums) {
				var $_list = $('.music-items-album-list');

				$.each(response.result.albums,function(index,item) {
					$_list.append('<div class="item"><li><a rel="'+item.albumid+'" href="#">'+item.label+'</a></li></div>');
				});
			}

			$().toastmessage('removeToast',$_loader);
			
			$('span.albums-loading').hide();
		}
	});

};

//noinspection JSUnusedLocalSymbols
/**
 * Sets the inner pane based on the tab selection
 * @param event
 * @param i
 */
var _selectPane = function(page, event, i) {
	page.focus();

	var _pane = page.getItems().eq(page.getIndex());
	var _id = _pane.attr('id');

	//	Now do whatever
	switch ( _id ) {
		case 'music-item-albums':
			_loadAlbums(_pane);
			break;

		case 'music-item-genres':
			_loadGenres('music',_pane);
			break;
	}
};

//noinspection JSUnusedLocalSymbols
/**
 * Creates the navigator/display for the selected tab
 * @param pane
 * @param event
 * @param ui
 */
var _displayTab = function(pane,event,ui) {
//	//	Create vertical inner-page tabs
//	$('.items').scrollable({
//
//		items : '.items',
//
//		//	Vertical tabs
//		vertical: true,
//
//		//	Capture keyboard for up/down/left/right
//		keyboard: true,
//
//		onSeek: function(event,i) {
//			_selectPane(this.data('scrollable'), event,i);
//		}
//	}).navigator('ul.tab-navi');
};
