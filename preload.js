let jsmediatags = require("jsmediatags");
const mm = require('music-metadata');
fs = require('fs');
const testFolder = './music/';
const util = require('util');

const addHtml = (selector, content) => {
  const element = document.getElementById(selector)
  if (element) element.innerHTML += content
}

function convertTime(time) {
  let minutes = Math.floor(time / 60);
  let seconds = time - minutes * 60;
  return `${minutes}:${seconds.toString().slice(0, 2)}`
}

window.addEventListener('DOMContentLoaded', () => {
  let nodeConsole = require('console');
  let myConsole = new nodeConsole.Console(process.stdout, process.stderr);
  fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
      (async () => {
        try {
          const metadata = await mm.parseFile(`${testFolder}${file}`);
          jsmediatags.read(`${testFolder}${file}`, {
            onSuccess: function(tag) { 
              const data = tag.tags.picture.data;
              const format = tag.tags.picture.format;
              let base64String = "";
              for (let i = 0; i < data.length; i++) {
                base64String += String.fromCharCode(data[i]);
              }
              
              duration = convertTime(metadata.format.duration) 
              console.log(duration)
              addHtml('liste-track', `
              <tr class="track-choice">
                <td class="track-name" style="max-width: 200px;"><img src="data:${format};base64,${window.btoa(base64String)}" alt="" width="40px" height="40px" class="logo-align"/><i class="fas fa-play lg play-in-survol" onclick="PlayMusic(this, '${testFolder}${file}')"></i>${metadata.common.title}</td>
                <td class="artist-name">${metadata.common.artist}</td>
                <td class="album">${tag.tags.album==="undefined"? tag.tags.album:"None"}</td>
                <td class="timer-table">${duration}</td>
              </tr>
              `)
            }, 
          }); 
        } catch (error) {
          console.error(error.message);
        }
      })();
    });
  });
  
})