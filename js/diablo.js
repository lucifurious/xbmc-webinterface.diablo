/**
 * Initialize our page
 */
var _initialize = function() {

	var _diabloInfo = " \
		<h2>Welcome to Diablo!</h2> \
		<p></p> \
		<p>Please visit the <a href=\"http://github.com/lucifurious/xbmc-diablo/\">Diablo website</a> for support</p> \
";

	//	Hide all the loaders
	$('span.loading').css({display:'inline-block'}).hide();

	$().toastmessage({
		closeText : '<span class="ui-icon ui-icon-circle-close"></span>'
	});

	//	Configure notifications
	$().toastmessage(
		'showToast',
		{
			text	 : _diabloInfo,
			sticky   : false,
			stayTime : 5000
		}
	);

	//	Create our xbmc object
	_xbmc = new $.xbmc({
		serverHostName : 'japhrimel.gna.me'
	});
};

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

		success : function(response) {
			if (response.result && response.result.albums) {
				var $_list = $('.music-item-album-list',pane);
				$_list.html('<ul class="item-list-view"></ul>');

				$.each(response.result.albums,function(index,item) {
					$_list.appendTo('<li><a rel="'+item.albumid+'" href="#">'+item.label+'</a></li>');
				});
			}

			$().toastmessage('removeToast',$_loader);
			
			$('span.albums-loading').hide();
		}
	});

};
