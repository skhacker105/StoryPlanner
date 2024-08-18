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

  // MISC
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



  // Files
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
  
  async extractAudioPart(base64Data: string, startTime: number, endTime: number): Promise<string> {
    const binaryData = this.base64ToArrayBuffer(base64Data);
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(binaryData);
    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const numberOfSamples = endSample - startSample;

    // Create a new AudioBuffer with the extracted samples
    const newAudioBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      numberOfSamples,
      sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const oldBuffer = audioBuffer.getChannelData(channel);
      const newBuffer = newAudioBuffer.getChannelData(channel);
      newBuffer.set(oldBuffer.slice(startSample, endSample));
    }

    // Encode the new AudioBuffer to Base64
    const extractedAudioData = await this.encodeAudioBuffer(newAudioBuffer);
    return `data:audio/mpeg;base64,${extractedAudioData}`;
  }

  // Convert Base64 string to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Encode AudioBuffer to Base64
  private async encodeAudioBuffer(audioBuffer: AudioBuffer): Promise<string> {
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    const bufferSource = offlineContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(offlineContext.destination);
    bufferSource.start(0);

    const renderedBuffer = await offlineContext.startRendering();
    const wavData = this.audioBufferToWav(renderedBuffer);
    return this.arrayBufferToBase64(wavData);
  }

  // Convert ArrayBuffer to Base64 string
  private arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
    const bytes = new Uint8Array(arrayBuffer);
    const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return window.btoa(binary);
  }

  // Convert AudioBuffer to WAV format (simplified, consider using a library for real use)
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numOfChan = buffer.numberOfChannels,
          length = buffer.length * numOfChan * 2 + 44,
          bufferView = new DataView(new ArrayBuffer(length)),
          channels = [],
          sampleRate = buffer.sampleRate,
          offset = 0,
          bitsPerSample = 16;

    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const floatTo16BitPCM = (view: DataView, offset: number, input: Float32Array) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    };

    writeString(bufferView, 0, 'RIFF');
    bufferView.setUint32(4, 36 + length - 8, true);
    writeString(bufferView, 8, 'WAVE');
    writeString(bufferView, 12, 'fmt ');
    bufferView.setUint32(16, 16, true);
    bufferView.setUint16(20, 1, true);
    bufferView.setUint16(22, numOfChan, true);
    bufferView.setUint32(24, sampleRate, true);
    bufferView.setUint32(28, sampleRate * numOfChan * bitsPerSample / 8, true);
    bufferView.setUint16(32, numOfChan * bitsPerSample / 8, true);
    bufferView.setUint16(34, bitsPerSample, true);
    writeString(bufferView, 36, 'data');
    bufferView.setUint32(40, length - 44, true);

    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let index = 44;
    for (let i = 0; i < channels[0].length; i++) {
      for (let j = 0; j < numOfChan; j++) {
        floatTo16BitPCM(bufferView, index, channels[j].slice(i, i + 1));
        index += 2;
      }
    }

    return bufferView.buffer;
  }



  // Categorization
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
