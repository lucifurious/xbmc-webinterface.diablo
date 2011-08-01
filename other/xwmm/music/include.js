
// -----------------------------------------
// MUSIC include.js
//------------------------------------------ 

Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';

function updateMusicAlbum() {

	var record = Ext.getCmp('albumGrid').getSelectionModel().getSelected();
	
	if (Ext.getCmp('scrapertype').isDirty() || Ext.getCmp('scraperlabel').isDirty() || Ext.getCmp('scraperextgenre').isDirty() || Ext.getCmp('scraperstyles').isDirty() || Ext.getCmp('scrapermoods').isDirty() || Ext.getCmp('scraperthemes').isDirty()) {
		//record.data.iYearScraper = Ext.getCmp('scraperyear').getValue();
		// record.data.strExtraGenres = Ext.getCmp('scraperextgenre').getValue;
		
		record.data.strMoods = Ext.getCmp('scrapermoods').getValue();
		record.data.strStyles = Ext.getCmp('scraperstyles').getValue();
		record.data.strThemes = Ext.getCmp('scraperthemes').getValue();
		record.data.strLabel = Ext.getCmp('scraperlabel').getValue();
		record.data.strType = Ext.getCmp('scrapertype').getValue();
		updateXBMCAlbumScraperInfo(record)
	}
	
	if (Ext.getCmp('albumratingfield').isDirty() || Ext.getCmp('albumreviewfield').isDirty()) {
		record.data.iRating = Ext.getCmp('albumratingfield').getValue();
		record.data.strReview = Ext.getCmp('albumreviewfield').getValue();
		updateXBMCAlbumInfo(record)
	};
	
	if (Ext.getCmp('albumartistfield').isDirty() || Ext.getCmp('albumtitlefield').isDirty() || Ext.getCmp('albumgenrefield').isDirty() || Ext.getCmp('albumyearfield').isDirty()) {
		//get the Artist id from combobox
		var x = ArtistStore.findExact('strArtist', Ext.getCmp('albumartistfield').getValue(),0, false, false);
		record.data.idArtist = ArtistStore.getAt(x).data.idArtist;
		record.data.strArtist = Ext.getCmp('albumartistfield').getValue();
		
		//get the Genre id from combobox
		var x = GenreStore.findExact('strGenre', Ext.getCmp('albumgenrefield').getValue(),0, false, false);
		record.data.idGenre = GenreStore.getAt(x).data.idGenre;
		record.data.strGenre = Ext.getCmp('albumgenrefield').getValue();
		
		record.data.strAlbum = Ext.getCmp('albumtitlefield').getValue();
		record.data.iYear = Ext.getCmp('albumyearfield').getValue();		
		
		updateXBMCAlbum(record);
		//update Album store
		AlbumStore.remove(record);
		AlbumStore.add(record);
		AlbumGrid.getStore().reload()

	};
			
}

function getMusicCoverList(String, r) {
	
	var result = [];
	if (String == "" || String == undefined ) return result;
	
	if (String.match("<thumb><thumb>") == null) {
		String = '<test>'+String+'</test>'
	};
	String = String.replace(/\n/g,"");

	if (window.DOMParser)
	 {
	  parser=new DOMParser();
	  xmlDoc=parser.parseFromString(String,"text/xml");
	 }
	else // Internet Explorer
	 {
	  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	  xmlDoc.async="false";
	  xmlDoc.loadXML(String);
	 } 
	 
	 var MasterUrl = getTagAttribute(xmlDoc.documentElement, 'url');
	 if (MasterUrl == null){ MasterUrl = ""};
	 for (var i=0 ; i < xmlDoc.documentElement.childNodes.length; i++) {
		var downloadUrl = MasterUrl + xmlDoc.getElementsByTagName("thumb")[i].childNodes[0].nodeValue;
		var previewUrl = xmlDoc.getElementsByTagName("thumb")[i].getAttribute("preview");
		if (previewUrl == "" || previewUrl == null) { previewUrl = downloadUrl}
			else { previewUrl = MasterUrl + previewUrl};
		// need to change preview url for impawards links
		if (previewUrl.match("impaward") != null) {previewUrl = previewUrl.replace(/posters\//g,"thumbs/imp_")};
		
		result.push([previewUrl, downloadUrl, "Remote", ""]);
	}
	 return result;
}

function GetAlbumDetails(r) {

    var inputUrl = '/xbmcCmds/xbmcHttp?command=querymusicdatabase(SELECT idAlbumInfo, iYear, genre.strGenre, strExtraGenres, strMoods, strStyles, strThemes, strReview, strLabel, strType, strImage from albuminfo JOIN genre ON albuminfo.idGenre = genre.idGenre WHERE idAlbum = '+r.data.idAlbum+')';
    var resp = "";
	Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
		async: false,
        success: function (t){
			resp = t;
			},
        failure: function (t){},
		timeout: 2000
    });

	var temp = resp.responseText.replace(/<\/record>/g, "");
	temp = temp.replace(/<record>/g, "");
	temp = temp.replace(/<recordset>/g, "");
	temp = temp.replace(/<\/recordset>/g, "");
	temp = temp.replace(/<html>/g, "");
	temp = temp.replace(/<\/html>/g, "");
	temp = temp.replace(/<\/field>/g, "");
	temp = temp.split("<field>");

	r.data.idAlbumInfo = temp[1];
	r.data.iYearScraper = temp[2];
	r.data.strGenreScraper = temp[3];
	r.data.strExtraGenres = temp[4];	
	r.data.strMoods = temp[5];
	r.data.strStyles = temp[6];
	r.data.strThemes = temp[7];
	r.data.strReview = temp[8];
	r.data.strLabel = temp[9];
	r.data.strType = temp[10];
	r.data.MusicCoverUrl = getMusicCoverList(temp[11], r)
}