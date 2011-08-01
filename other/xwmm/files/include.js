

function XBMCFixPath(myNode) {
	
	if (myNode.attributes.leaf) {	
		if (myNode.attributes.xbmcIdFile != -1) {
			if (myNode.attributes.xbmcIdPath == -1) {
				//console.log('path should be :', myNode.attributes.data);
			}
		}
	}
	else {
		myNode.expand(true);
		for (var i=0; i< myNode.childNodes.length; i++)
			XBMCFixPath(myNode.childNodes[i]);
	}
}

function xbmcJsonRPC(params) {
	var inputUrl = '/jsonrpc'
	var myjson = '';
	Ext.Ajax.request({
		url: inputUrl,
		params : params,
	method: "POST",
		async: false,
		success: function (t){
			myjson = Ext.util.JSON.decode(t.responseText);
			},
		failure: function(t){},
			timeout: 2000
	});	
	return myjson.result;
}

function TrimXbmcXml(t){
	var temp = t.responseText.replace(/<html>/g, "");
	temp = temp.replace(/<\/html>/g, "");
	temp = temp.replace(/\n/g, '');
	//temp = temp.replace(/\\/g,"\\\\");
	return temp
}

function getShares(type){
	var tempList = [];
    var inputUrl = '/xbmcCmds/xbmcHttp?command=GetShares(' + type + ')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
		async: false,
        success: function (t){
			tempList = TrimXbmcXml(t).split("<li>");
			},
        failure: function (t){},
		timeout: 2000
    });
	return tempList
}

function isDirectory (item) {	
	var myPosition = item.length -1;
	var lastChar = item.substring(myPosition, myPosition + 1);
	if ((lastChar == "/")||(lastChar == "\\"))
		return true
	else
		return false
}

function myExpend(node, event) {

	if (node.isRoot) {return};
	
	if (node.attributes.scansub == false) {
		if (node.attributes.leaf == false) {
			node.attributes.scansub = true;
			var mypath = normalizeString(node.attributes.data);
			var myParams = '{\"jsonrpc\": \"2.0\", \"method\": \"Files.GetDirectory\", \"params\": {\"type\": \"video\", \"directory\": \"'+mypath+'\"}, \"id\": 1}';
			var tempStr = xbmcJsonRPC(myParams);
			if (tempStr.directories != undefined) {
				for (var i = 0; i < tempStr.directories.length; i++) {
							addNodeDirectory(node, tempStr.directories[i]);
				}
			}
			if (tempStr.files != undefined) {
				for (var i = 0; i < tempStr.files.length; i++) {
							addNodeFile(node, tempStr.files[i]);		
				}
			}
		}
	}
	else {return}
}

function addNodeDirectory(node, string) {

	var mytext = string.label;
	
	var myNode = new nodeRecord(mytext, string, node.attributes.data);
	myNode.checkDirPath();

	var newNode = new Ext.tree.TreeNode({text: mytext, data: string.file, watched: myNode.xbmcWatched, leaf: false, children:[], expandable:true, scansub: false, isInDb: "0", xbmcIdPath: myNode.xbmcIdPath, xbmcContent: myNode.xbmcContent, xbmcScraper: myNode.xbmcScraper});
	node.appendChild(newNode);
}

function addNodeFile (node, string) {

	var mytext = string.label;
		
	var myNode = new nodeRecord(mytext, string, node.attributes.data);
	myNode.checkIsInDB(node.attributes.data);
	myNode.checkFilePath();

	var newNode = new Ext.tree.TreeNode({text: mytext, data: string.file, watched: myNode.xbmcWatched, leaf: true, isInDb: myNode.xbmcIdFile, xbmcIdPath: myNode.xbmcIdPath, xbmcContent: myNode.xbmcContent, xbmcScraper: myNode.xbmcScraper });
	node.appendChild(newNode);
}

function clickListener(node,event){

	var myXbmc = new scraperRecord();
	if (node.attributes.xbmcContent == "") {
		myXbmc.setValue(inheritContent(node.parentNode))
	}
	else {
		myXbmc.setValue(node.attributes)
	}
	
	scraperDetailPanel.setTitle("<div align='center'> Scraper Details for: /"+node.attributes.text+"</div>");
	combo.setValue(myXbmc.xbmcContent);
	ScraperGrid.store.filter('content',myXbmc.xbmcContent);
	if (myXbmc.xbmcContent != "None") {
		var myRow = ScraperGrid.store.findExact('scraper',myXbmc.xbmcScraper,0);
		ScraperGrid.getSelectionModel().selectRow(myRow, true);
		var myRecord = ScraperGrid.getSelectionModel().getSelected();
		scraperImage.updateSrc(myRecord);
	}
	else {
		scraperImage.clearSrc();
	}
};

function checkWatched(val) {

 if (val != "")
	return '<img src=../images/icons/checked.png>';
}

var filesRecord = Ext.data.Record.create([
   {name: 'idFile', mapping: 'field:nth(1)'},		
   {name: 'idPath', mapping: 'field:nth(2)'},
   {name: 'strFilename', mapping: 'field:nth(3)'},
   {name: 'watched', mapping: 'field:nth(4)'}
]);

var pathRecord = Ext.data.Record.create([
   {name: 'idPath', mapping: 'field:nth(1)'},		
   {name: 'strPath', mapping: 'field:nth(2)'},
   {name: 'strContent', mapping: 'field:nth(3)'},
   {name: 'strScraper', mapping: 'field:nth(4)'},
   {name: 'scanRecursive', mapping: 'field:nth(5)'},
   {name: 'useFolderNames', mapping: 'field:nth(6)'},
   {name: 'noUpdate', mapping: 'field:nth(7)'}
]);

var storeFiles = new Ext.data.Store({
	id: 'storefiles',
	reader: new Ext.data.JsonXBMCReader({
			root:'data'	       
       }, filesRecord),
	listeners: {
			beforeload: function(){ setXBMCResponseFormat() }
		},
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idFile, idPath, strFilename, playCount FROM files)'
});

var storePath = new Ext.data.Store({
	id: 'storepath',
	reader: new Ext.data.JsonXBMCReader({
			root:'data'	       
       }, pathRecord),
	listeners: {
			beforeload: function(){ setXBMCResponseFormat() }
		},
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idPath, strPath, strContent, strScraper FROM path)'
});

function createJsonRootDirectory(tablestring) {

	var myNode = new nodeRecord(tablestring[0], tablestring[0], tablestring[1]);
	
	myNode.data = normalizeString(myNode.parentPath); //it is a root directory
	myNode.dataOriginal = myNode.parentPath; //it is a root directory
	myNode.checkDirPath();
	
	var temp = 	'{text: "'+myNode.text+
				'", data:"'+myNode.data+ 
				'", scansub: false'+
				', watched: "0", leaf: false'+
				', isInDb: "0", xbmcIdPath: "'+myNode.xbmcIdPath+
				'", xbmcContent: "'+myNode.xbmcContent+
				'", xbmcScraper: "'+myNode.xbmcScraper+
				'"';
	return temp;
}

function getDir(path) {
	var currentList = [];
	//path = normalizeString(path);
    var inputUrl = '/xbmcCmds/xbmcHttp?command=GetDirectory(' + path + ')';
		Ext.Ajax.request({
			url: inputUrl,
			method: 'GET',
			async: false,
			success: function (t){
				currentList = TrimXbmcXml(t).split("<li>")
			},
			failure: function (t){}
		});
	return currentList
}




