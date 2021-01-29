// NodeJS Imports
const path = require("path");
const url = require("url");

// Electron Setup
const electron = require("electron");
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

// Discord Setup
const Discord = require("discord.js");
const bot = new Discord.Client();

let mainWindow;
function createWindow() {
  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: 450,
    height: 850,
    webPreferences: {
      nodeIntegration: false,
      preload: __dirname + "/preload.js",
    },
  });

  let appLocation =
    "file://" +
    path.join(
      __dirname,
      "..",
      "..",
      "dist",
      "DiscordMusicPlayer",
      "index.html"
    );

  //mainWindow.webContents.openDevTools();

  mainWindow.loadURL(appLocation);

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}
app.on("ready", createWindow);
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

//https://discord.com/api/oauth2/authorize?client_id=802644602027900959&permissions=3164160&scope=bot

let currentConnection = null;
let currentDispatcher = null;
let currentVoiceChannel = null;

let isReady = true;

ipcMain.on("playSong", (event, song) => {
  songPath = path.join(song.path, song.file)

  if(!currentConnection) return;

  event.sender.send('updateIsPlaying', true)
  event.sender.send('updateCurrentlyPlaying', song.file)

  if(currentDispatcher){
    currentDispatcher.destroy()
    currentDispatcher = null;
  }

  console.log("playing")
  if(isReady){
    isReady = false;
    currentDispatcher = currentConnection.play(songPath);
    setTimeout(()=>{
      isReady = true
    }, 50)
  }
  currentDispatcher.on("finish", (end) => {
    currentConnection = null;
    currentDispatcher = null;
    event.sender.send('updateIsPlaying', false)
    event.sender.send('donePlaying', null)
  });
});

ipcMain.on("togglePlayback", (event, isPlaying) => {
  
  if(!currentConnection || !currentDispatcher) return;

  if(isReady){
    isReady = false
    if(isPlaying){
      currentDispatcher.pause()
      event.sender.send('updateIsPlaying', false)
    }else{
      currentDispatcher.resume();
      event.sender.send('updateIsPlaying', true)
    }
    setTimeout(()=>{
      isReady = true
    }, 50)
  }
  
  
});

bot.on("message", (message) => {
  if (message.author.bot) return;
  if (message.content.toLocaleLowerCase().startsWith("!join")) {
    const voiceChannel = message.member.voice.channel;
    if (voiceChannel) {
      voiceChannel
        .join()
        .then((connection) => {

          if(currentConnection){
            currentConnection.leave()
            currentConnection = null;
          }

          currentConnection = connection;
          currentVoiceChannel = voiceChannel;
        }).catch((err) => console.log(err));
    }
  } else if (message.content.toLocaleLowerCase().startsWith("!leave")) {
    const voiceChannel = message.member.voice.channel;
    if (voiceChannel) {
      voiceChannel.leave();
      currentVoiceChannel = null;
      currentConnection = null;
    }
  }
});


bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.login("ODAyNjQ0NjAyMDI3OTAwOTU5.YAyPCQ.mmiYIL4LwL1VuyD3KhaeBYkFHLk");


process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});