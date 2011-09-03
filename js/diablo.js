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
				var $_div = $('.music-items-album-list');
				var _items = "";

				$.each(response.result.albums,function(index,item) {
					if (item.label) {
						_items += '<li class="list-item"><a rel="'+item.albumid+'" href="#">'+item.label+'</a></li>';
					}
				});
			}

			$_div.html('<ul class="list-item-view">'+_items+'</ul>');

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
		case 'music-albums':
			_loadAlbums(_pane);
			break;

		case 'music-genres':
			_loadGenres('music',_pane);
			break;
	}
};
