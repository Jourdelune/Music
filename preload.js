let jsmediatags = require("jsmediatags");
const mm = require('music-metadata');
const tmp = require('tmp'); // install this with npm first
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs');
const path = require('path')
const SimpleThumbnail = require("simple-thumbnail-ts")

const testFolder = './music/';

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
  fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
      (async () => {
        try {
          const metadata = await mm.parseFile(`${testFolder}${file}`);
          jsmediatags.read(`${testFolder}${file}`, {
            onSuccess: async function(tag) { 
              duration = convertTime(metadata.format.duration)
              try {
                const data = tag.tags.picture.data;
                const format = tag.tags.picture.format;
                let base64String = "";
                for (let i = 0; i < data.length; i++) {
                  base64String += String.fromCharCode(data[i]);
                }
                addHtml('liste-track', `
                <tr class="track-choice">
                  <td class="track-name" style="max-width: 200px;"><img src="data:${format};base64,${window.btoa(base64String)}" alt="" width="40px" height="40px" class="logo-align"/><i class="fas fa-play lg play-in-survol" onclick="PlayMusic(this, '${testFolder}${file}')"></i>${metadata.common.title}</td>
                  <td class="artist-name">${metadata.common.artist}</td>
                  <td class="album">${tag.tags.album==="undefined"? tag.tags.album:"None"}</td>
                  <td class="timer-table">${duration}</td>
                </tr>
                `)
              } catch (error) {
                const tmpobj = tmp.dirSync();
                ffmpeg(`${testFolder}${file}`).takeScreenshots({
                  timestamps: ['50%'],
                  filename: 'thumbnail.png',
                  folder: tmpobj.name,
                  size: '320x240'
                }).on('end', async function() {
                  const buf = await fs.readFileSync(path.join(tmpobj.name,'thumbnail.png'), {encoding: 'base64'})
                  const format = "image/png";
                  addHtml('liste-track', `
                  <tr class="track-choice">
                    <td class="track-name" style="max-width: 200px;"><img src="data:image/gif;base64,${buf}" alt="" width="40px" height="40px" class="logo-align"/><i class="fas fa-play lg play-in-survol" onclick="PlayMusic(this, '${testFolder}${file}')"></i>${metadata.common.title}</td>
                    <td class="artist-name">${metadata.common.artist}</td>
                    <td class="album">${tag.tags.album==="undefined"? tag.tags.album:"None"}</td>
                    <td class="timer-table">${duration}</td>
                  </tr>
                  `)
                  fs.rmdirSync(tmpobj.name, { recursive: true });
                })
              }
            }, 
          }); 
        } catch (error) {
          console.error(error.message);
        }
      })();
    });
  });
  
})