

Ext.onReady(function() {

	//Load existing genres

	storegenre.load();
	LoadAllshowsdetails();

	// customize menu
	menuBar.add({
			xtype: 'tbspacer'
		},{
			xtype: 'tbbutton',
			text: 'Tools',
			menu: [{
				text: 'Manage Genres',
				iconCls: 'silk-plugin',
				handler: function(){winGenre.show()}
			},{
				text: 'Manage Actors',
				iconCls: 'silk-plugin',
				handler: function(){window.location = '../actors/index.html'}
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
			xtype: 'tbfill'
		},{
			text: myVersion
    });
	//Start Application with Main Panel
	var App = new TVShow.Mainpanel({
		renderTo: Ext.getBody()
	});
	// We can retrieve a reference to the data store
	// via the StoreMgr by its storeId
	
	Ext.StoreMgr.get('gridtvshowstore').load();
	
}); 
