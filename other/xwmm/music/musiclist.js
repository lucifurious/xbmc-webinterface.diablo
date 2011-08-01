

// -----------------------------------------
// movie.js
// last modified : 21-02-2010
// 
//------------------------------------------ 

// ------------ Artist information -------------

var CheckArtist = new Ext.grid.CheckboxSelectionModel({
	dataIndex:'idArtist',
	alwaysSelectOnCheck: 'true',
	header: false,
	listeners: {
		selectionchange: function(sm) {
			movieGenreChange(sm);
			var bt = Ext.getCmp('savebutton');
			bt.enable();
		}
	}
});

var ArtistcolModel = new Ext.grid.ColumnModel([
		CheckArtist,
		{header: "#", dataIndex: 'idArtist', hidden: true},
		{header: "Artist", dataIndex: 'strArtist'}
    ]);

var ArtistRecord = Ext.data.Record.create([
   {name: 'idArtist', mapping: 'field:nth(1)'},
   {name: 'strArtist', mapping: 'field:nth(2)'},	
]);

var ArtistStore = new Ext.data.GroupingStore({
	sortInfo: {field: 'strArtist', direction: "ASC"},
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
       }, ArtistRecord),
	listeners: {
        beforeload: function(){ setXBMCResponseFormat() }
    },
	url: '/xbmcCmds/xbmcHttp?command=querymusicdatabase(select idArtist, strArtist FROM artist)' 
});

ArtistGrid = new Ext.grid.GridPanel({
	cm: ArtistcolModel,
	id: 'artistGrid',
	title: 'Extra Artists',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
	region: 'center',
	width: 260,
	split: true,
	store: ArtistStore
}); 


// ------------ Album information -------------

var AlbumCover = new Ext.Container ({
	id: 'albumCover',
	cls: 'center-align',
	border: 0,
	width: 160,
	height:160,
	autoEl: {tag: 'img', src: "../images/nobanner.png", qtip:'Double-click to change'},
	refreshMe : function(){
		this.el.dom.src =  this.el.dom.src + '?dc=' + new Date().getTime();
	}
});

var AlbumStars = new Ext.Container ({
	id: 'albumrating',
	border: 0,
	width: 58,
	height:16,
	autoEl: {tag: 'img', src: "../images/stars/0.png"},
	updateSrc :function(r){
		if (r.data.details)	{
			this.el.dom.src = r.data.AlbumRating
		}
		else {
			var value = Math.round(r.data.iRating);
			if (value < 0 ) value = 0;
			//value = value *2;
			//if (value > 5 ) value = 5;
			r.data.AlbumRating =  '../images/stars/'+value+'.png';
			this.el.dom.src = r.data.AlbumRating
		}
	}
});

var albumDetailPanel = new Ext.FormPanel({
	region: 'north',
	width: 740,
	id: 'albumDetailPanel',
	trackResetOnLoad: true,
	title: "<div align='center'>Select Album</div>",
	defaults:{hideLabels:true, border:false},
	layout:'table',
	layoutConfig: {columns:3},
	defaults: {frame:true, width:270, height: 190},
	items:[{
		width:190,
		items: [AlbumStars, AlbumCover]
	},{
		layout: 'form',
		title: 'Album Info (from tags)',
		id: 'albumTags',
		labelWidth: 60,
		defaults: {	xtype:'textfield',
			width: 170,
			listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
		},
		items: [{
				fieldLabel: 'Title',
				name: 'strAlbum',
				id: 'albumtitlefield',
				allowBlank: false
			},{
				xtype: 'combo',
				fieldLabel: 'Genre',
				store: GenreStore,
				displayField: 'strGenre',
				id: 'albumgenrefield',
				mode: 'local',
				typeAhead: true,
				name: 'strGenre'
			},{
				xtype: 'combo',
				fieldLabel: 'artist',
				store: ArtistStore,
				id: 'albumartistfield',
				displayField: 'strArtist',
				mode: 'local',
				typeAhead: true,
				name: 'strArtist'
			},{
				fieldLabel: 'Year',
				id: 'albumyearfield',
				name: 'iYear'
			},{
				fieldLabel: 'Rating',
				id: 'albumratingfield',
				name: 'iRating'
			}]
	},{
        title:'Additional Info (from scraper)',
		layout: 'form',
		id: 'albumscraperdetails',
		labelWidth: 60,
		defaults: {	xtype:'textfield',
			width: 170,
			enableKeyEvents: true,			
			//listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
			listeners : {
					'keyup': function (txt, newValue, oldValue) {
						Ext.getCmp('savebutton').enable();
					},
					buffer: 100
				}

		},
		height: 380,
		width: 280,
		rowspan: 2,
		items:[{
			fieldLabel: 'Genre',
			name: 'strGenreScraper',
			readOnly : true
		},{
			fieldLabel: 'Year',
			name: 'iYearScraper',
			//id: 'scraperyear',
			readOnly : true
		},{
			fieldLabel: 'Type',
			id : 'scrapertype',
			name: 'strType'
		},{
			fieldLabel: 'Label',
			id : 'scraperlabel',
			name: 'strLabel'
		},{
			xtype:'textarea',
			height: 47,
			fieldLabel: 'Extra Genre',
			id : 'scraperextgenre',
			name: 'strExtraGenres'
		},{
			xtype:'textarea',
			height: 47,
			fieldLabel: 'Styles',
			id : 'scraperstyles',
			name: 'strStyles'			
		},{
			xtype:'textarea',
			height: 47,
			fieldLabel: 'Moods',
			id : 'scrapermoods',
			name: 'strMoods'
		},{
			xtype:'textarea',
			height: 47,
			fieldLabel: 'Themes',
			id : 'scraperthemes',
			name: 'strThemes'			
		}]
                },{
                    title:'Review',
					buttons: [{
						disabled: true,
						text:'Save',
						id: 'savebutton',
						handler: function(){	
							updateMusicAlbum();
							//storeMovie.reload();
							this.disable();
						}
					},{
						text:'Cancel',
						handler: function(){
							updateGenreGrid(currentRecord.data.genres)
						}
					}],    
					width: 460,
                    colspan:2,
					items: [{
						xtype:'textarea',
						name:'strReview',
						id: 'albumreviewfield',
						listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}},
						height: 105,
						width: 430
					}]
                }]
            });
	
var AlbumcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idAlbum', hidden: true},
		{header: "Album", dataIndex: 'strAlbum', width: 150},
		{header: "Artist", dataIndex: 'strArtist', hidden: true},
		{header: "Genre", dataIndex: 'strGenre', hidden: true},
		{header: "Year", dataIndex: 'iYear', hidden: true}
    ]);

var AlbumRecord = Ext.data.Record.create([
   {name: 'idAlbum', mapping: 'field:nth(1)'},
   {name: 'strAlbum', mapping: 'field:nth(2)'},	
   {name: 'idArtist', mapping: 'field:nth(3)'},	
   {name: 'idGenre', mapping: 'field:nth(4)'},	
   {name: 'strArtist', mapping: 'field:nth(5)'},
   {name: 'strGenre', mapping: 'field:nth(6)'},	
   {name: 'iYear', mapping: 'field:nth(7)'},
   {name: 'strThumb', mapping: 'field:nth(8)'},
   {name: 'iRating', mapping: 'field:nth(9)'},
   {name: 'strReview', mapping: 'field:nth(10)'}
]);

// ------------ Track information -------------

function convertTime(val) {

	var minutes = Math.floor(val / 60);
	var seconds = val - minutes*60;
	if (seconds < 10) seconds = '0'+seconds;
	if (minutes < 10) minutes = '0'+minutes;
	return minutes+':'+seconds;
}

function starRating(val) {
	return "<img src=../images/small-stars/"+val+".gif>"
}

var SongcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idSong', hidden: true},
		{header: "#", dataIndex: 'iTrack', width: 30},
		{header: "Track", dataIndex: 'strTitle', width: 300},
		{header: "Duration", dataIndex: 'iDuration', width: 70, renderer: convertTime},
		{header: "Rating", dataIndex: 'rating', width: 100, renderer: starRating}
    ]);

var SongRecord = Ext.data.Record.create([
   {name: 'idSong', mapping: 'field:nth(1)'},		
   {name: 'strTitle', mapping: 'field:nth(2)'},	
   {name: 'iTrack', type: 'int', mapping: 'field:nth(3)'},		
   {name: 'iDuration', mapping: 'field:nth(4)'},	
   {name: 'iYear', mapping: 'field:nth(5)'},		
   {name: 'strFileName', mapping: 'field:nth(6)'},
   {name: 'rating', mapping: 'field:nth(7)'},
   {name: 'idAlbum', mapping: 'field:nth(8)'},
   {name: 'strAlbum', mapping: 'field:nth(9)'},
   {name: 'strPath', mapping: 'field:nth(10)'},
   {name: 'idArtist', mapping: 'field:nth(11)'},
   {name: 'strArtist', mapping: 'field:nth(12)'},
   {name: 'idGenre', mapping: 'field:nth(13)'},
   {name: 'strGenre', mapping: 'field:nth(14)'},
]);

var SongStore = new Ext.data.GroupingStore({
	sortInfo: {field: 'iTrack', direction: "ASC"},
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
       }, SongRecord),
	listeners: {
        beforeload: function(){ setXBMCResponseFormat() }
    },
	url: '/xbmcCmds/xbmcHttp?command=querymusicdatabase(select idSong, strGenre FROM songview WHERE idSong = -1)' 
});

SongGrid = new Ext.grid.GridPanel({
	cm: SongcolModel,
	title: "<div align='center'>Album Tracks</div>",
	region: 'center',
	id: 'Moviegrid',
	loadMask: true,
	frame: 'true',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
	width: 740,
	height: 230,
	split: true,
	store: SongStore
	
}); 


Ext.onReady(function() {

	//Load existing genres
	GenreStore.load();
	SongStore.load();
	ArtistStore.load();
	AlbumStore.load();
	
	menuBar.add({
			xtype: 'tbbutton',
			text: 'Tools',
			menu: [{
				text: 'Manage Genres',
				iconCls: 'silk-plugin',
				handler: function(){winGenre.show()}
			}]
		},{
			text: 'Quicksearch:',
			tooltip: 'Quickly search through the grid.'
		},{
			xtype: 'text',
			tag: 'input',
			id: 'quicksearch',
			size: 30,
			value: '',
			style: 'background: #F0F0F9;'
	});
	
	menuBar.add({
        text: 'X',
        tooltip: 'Clear quicksearch',
        handler: function() {
            if (searchBox.getValue().length!=0) {
                searchBox.setValue('');
                storeMovie.clearFilter();
            }
        }
    });
	
	menuBar.add({			
			xtype: 'tbfill'
		},{
			text: myVersion
    });
	
	//Start Application with Main Panel
	var App = new Audio.Mainpanel({
		renderTo: Ext.getBody()
	});
	
	// We can retrieve a reference to the data store
	// via the StoreMgr by its storeId
	Ext.QuickTips.init();
	
	// begin search config
    var searchStore = new Ext.data.SimpleStore({
        fields: ['query'],
	data: []
    });
    var searchBox = new Ext.form.ComboBox({
        store: searchStore,
        displayField: 'query',
        typeAhead: false,
        mode: 'local',
        triggerAction: 'all',
		applyTo: 'quicksearch',
        hideTrigger: true
    });

    var searchRec = Ext.data.Record.create([
        {name: 'query', type: 'string'}
    ]);


    var onFilteringBeforeQuery = function(e) {
	//grid.getSelectionModel().clearSelections();
        if (this.getValue().length==0) {
                    storeMovie.clearFilter();
                } else {
                    var value = this.getValue().replace(/^\s+|\s+$/g, "");
                    if (value=="")
                        return;
                    storeMovie.filterBy(function(r) {
                        valueArr = value.split(/\ +/);
                        for (var i=0; i<valueArr.length; i++) {
                            re = new RegExp(Ext.escapeRe(valueArr[i]), "i");
                            if (re.test(r.data['Movietitle'])==false
                                //&& re.test(r.data['light'])==false) {
								) {
                                return false;
                            };
                        }
                        return true;
                    });
                }
    };
    var onQuickSearchBeforeQuery = function(e) {
        if (this.getValue().length==0) {
        } else {
            var value = this.getValue().replace(/^\s+|\s+$/g, "");
            if (value=="")
                return;
            searchStore.clearFilter();
            var vr_insert = true;
            searchStore.each(function(r) {
                if (r.data['query'].indexOf(value)==0) {
                    // backspace
                    vr_insert = false;
                    return false;
                } else if (value.indexOf(r.data['query'])==0) {
                    // forward typing
                    searchStore.remove(r);
                }
            });
            if (vr_insert==true) {
                searchStore.each(function(r) {
                    if (r.data['query']==value) {
                        vr_insert = false;
                    }
                });
            }
            if (vr_insert==true) {
                var vr = new searchRec({query: value});
                searchStore.insert(0, vr);
            }
            var ss_max = 4; // max 5 query history, starts counting from 0; 0==1,1==2,2==3,etc
            if (searchStore.getCount()>ss_max) {
                var ssc = searchStore.getCount();
                var overflow = searchStore.getRange(ssc-(ssc-ss_max), ssc);
                for (var i=0; i<overflow.length; i++) {
                    searchStore.remove(overflow[i]);
                }
            }
	}
    };
    searchBox.on("beforequery", onQuickSearchBeforeQuery);
    searchBox.on("beforequery", onFilteringBeforeQuery);
    searchBox.on("select", onFilteringBeforeQuery); 
	// end search
	

	
}); 