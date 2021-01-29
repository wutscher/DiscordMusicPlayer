import { ApplicationRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  path = 'C:\\Users\\rwutscher\\Music\\Unknown artist\\Unknown album (20-12-2020 11-39-06)';

  files: string[] = [];
  currentlyPlaying = '';
  isPlaying = false;
  autoplay = false;

  constructor(private appRef: ApplicationRef){
    let userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      const electron = (window as any).require('electron');

      electron.ipcRenderer.on('updateCurrentlyPlaying', (event:any, currentlyPlaying:any) => {
        this.currentlyPlaying = currentlyPlaying
        console.log(currentlyPlaying)
        this.appRef.tick();
      });

      electron.ipcRenderer.on('updateIsPlaying', (event:any, isPlaying:any) => {
        this.isPlaying = isPlaying
        this.appRef.tick();
      });

      electron.ipcRenderer.on('donePlaying', (event:any, data:any) => {
        if(this.autoplay){
          this.skipNext();
        }
        this.appRef.tick();
      });

    }
  }

  ngOnInit(): void {
    this.getFiles();
  }

  public togglePlayback(){
    let userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      const electron = (window as any).require('electron');
      electron.ipcRenderer.send('togglePlayback', this.isPlaying);
    }

  }

  skipNext(){
    let userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      const electron = (window as any).require('electron');

      if(this.files.indexOf(this.currentlyPlaying) < this.files.length-1 && this.files.indexOf(this.currentlyPlaying) > -1){
        electron.ipcRenderer.send('playSong', {path: this.path, file: this.files[this.files.indexOf(this.currentlyPlaying)+1]});
      }
    }
  }

  skipPrev(){
    let userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      const electron = (window as any).require('electron');

      if(this.files.indexOf(this.currentlyPlaying) > 0){
        electron.ipcRenderer.send('playSong', {path: this.path, file: this.files[this.files.indexOf(this.currentlyPlaying)-1]});
      }
    }
  }

  public getFiles(){
    let userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      const fs = (window as any).fs
      
      fs.readdir(this.path, (err: any, files: any[]) => {
        console.log('getting files')
        this.files = files;
      })
    }else{
      this.files = [
        "Deep deep feeling",
        "Deep down",
        "Find my way",
        "Lavatory lil",
        "Long Tailed Winter Bird"
      ]
    }
  }

  public playSong(song: string){
    let userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      const electron = (window as any).require('electron');
      electron.ipcRenderer.send('playSong', {path: this.path, file: song});
    }
  }
}