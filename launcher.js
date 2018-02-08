// electron specific

const {app, Menu, BrowserWindow} = require('electron');
const {autoUpdater} = require("electron-updater");
var server = require("./app.js");
let mainWindow
let upToDate = true;

let sendStatusToWindow = function(text) {
	mainWindow.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Verificando Version...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Actualizacion Disponible.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater.');
  //sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Velocidad de Descarga: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Descargados ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
  upToDate = false;
});

app.on('ready', function() {
  
  mainWindow = new BrowserWindow({  
		  minWidth: 1024, 
		  minHeight: 768, 
		  title : "Overtable",
		  titleBarStyle:"hidden", 
		  fullscreen: true,
		  frame: false
	  });
  //mainWindow.webContents.openDevTools();
  appVersion = app.getVersion();
  mainWindow.loadURL('file://' + __dirname + '/launcher.html?version='+appVersion+'');
  mainWindow.on('close', () => {
	  if(upToDate){
		  app.quit();
	    for (let window of BrowserWindow.getAllWindows()) {
	      if (window != mainWindow)
	        window.close();
	    }
	  } else {
		  autoUpdater.quitAndInstall();  
	  }
	  
	  
  });
 
   
 // Create the Application's main menu
    var template = [{
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];
	
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    
    setTimeout(function(){ 
		
		autoUpdater.checkForUpdatesAndNotify();
		
		
	}, 2000);
	
	setInterval(function(){ 
		
		autoUpdater.checkForUpdatesAndNotify();
		
		
	}, 60000);
    
});


