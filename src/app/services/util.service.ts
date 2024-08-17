import { Injectable } from '@angular/core';
import { IJSONDiff, IKeyDifference } from '../interfaces/json-diff';
import { FileControl } from '../types/picture.type';
import { OptionType } from '../types/member-option.type';
import { Observable } from 'rxjs';
import { ILayer, ILayersById } from '../interfaces/movie-layer';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  generateNewId() {
    const length = 32;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }

  cloneDeep(value: any): any {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (ex) {
      return undefined;
    }
  }

  compareJSON(obj1: any, obj2: any): IJSONDiff {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    const differences: IKeyDifference[] = [];

    for (const key of allKeys) {
      if (obj1[key] !== obj2[key] && key != 'stackPosition') {
        differences.push({ key, oldValue: obj1[key], newValue: obj2[key] });
      }
    }

    const differencesInString = '{ ' + differences.map(d => `${d.key}: ${d.newValue} `) + ' }';

    return { keys: Array.from(allKeys), differences, differencesInString };
  }

  getMediaLength(file: FileControl, optionTye: OptionType): number | Promise<number> {
    if (optionTye !== 'audio' && optionTye !== 'video') return -1;

    const element = document.createElement(optionTye);
    return new Promise<number>((resolve, reject) => {
      element.onloadedmetadata = function () {
        window.URL.revokeObjectURL(element.src);
        resolve(element.duration);
      }

      element.onerror = (err) => {
        reject('Could not load media.');
        element.remove();
      }
      element.src = typeof file === 'string' ? file : '';
    });
  }

  getVideoThumbnail(videoFile: FileControl): Promise<string> {
    if (!videoFile || typeof videoFile !== 'string') {
      return new Promise(resolve => resolve(''));
    }


    const video = document.createElement('video');
    video.src = videoFile;
    video.load();
    video.muted = true;
    video.play();

    return new Promise((resolve, reject) => {
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw the current frame of the video on the canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Create a data URL of the image
          resolve(canvas.toDataURL('image/png'));

          // Optionally stop video playback
          video.pause();
          window.URL.revokeObjectURL(video.src);
          video.remove();
          canvas.remove();
        }
      }

      video.onerror = (err) => {
        reject('Could not load video.');
        video.remove();
      }
    });
  }

  getAudioFromVideo(videoFile: FileControl): Observable<AudioBuffer | undefined> {
    if (!videoFile || typeof videoFile !== 'string') {
      return new Observable(observer => observer.next(undefined));
    }
    const audioContext = new window.AudioContext();
    return new Observable<AudioBuffer | undefined>(observer => {
      if (ArrayBuffer.isView(videoFile) && typeof videoFile !== 'string') {
        audioContext.decodeAudioData(videoFile, (audioFile) => {
          observer.next(audioFile);
        }, err => {
          console.log('Failed to load video file');
          observer.error(err);
        })
      }
      return observer.next(undefined);
    });
  }

  convertLayersById(layers: ILayer[]): ILayersById {
    return layers.reduce((ob: ILayersById, layer: ILayer) => {
      ob[layer.layerId] = layer;
      return ob;
    }, {} as ILayersById);
  }

  categorizeLayers(incomingLayers: ILayer[], existingLayers: ILayer[]): { layersToAdd: ILayer[], layersToUpdate: ILayer[], layersToDelete: ILayer[] } {
    const incomingLayersById = this.convertLayersById(incomingLayers);
    const objExistingLayersById = this.convertLayersById(existingLayers);
    return {
      layersToAdd: this.filterLayersToAdd(incomingLayers, objExistingLayersById),
      layersToUpdate: this.filterLayersToUpdate(existingLayers, incomingLayersById),
      layersToDelete: this.filterLayersToDelete(existingLayers, incomingLayersById)
    }
  }

  filterLayersToAdd(incomingLayers: ILayer[], objExistingLayersById: ILayersById): ILayer[] {
    return cloneDeep(incomingLayers.filter(sl =>
      !sl.isProjected || !objExistingLayersById[sl.layerId]
        ? true : false
    ));
  }

  filterLayersToUpdate(existingLayers: ILayer[], incomingLayersById: ILayersById): ILayer[] {
    return existingLayers
      .filter(l => incomingLayersById[l.layerId]?.isProjected === true)
      .map(l => {
        l.isProjected = true;
        l.properties.stackPosition = incomingLayersById[l.layerId].properties.stackPosition;
        l.projectionStartTime = incomingLayersById[l.layerId].projectionStartTime;
        l.properties.isInView = incomingLayersById[l.layerId].properties.isInView;
        return l;
      });
  }

  filterLayersToDelete(existingLayers: ILayer[], incomingLayersById: ILayersById): ILayer[] {
    return existingLayers
      .filter(l => !incomingLayersById[l.layerId]);
  }
}
