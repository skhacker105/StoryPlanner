import { moveItemInArray } from "@angular/cdk/drag-drop";
import { ILayer } from "../interfaces/movie-layer";
import { IMovie, IMovieMemberBook, IMovieTime } from "../interfaces/timeline-movie";
import { IVersion } from "../interfaces/version";
import { cloneDeep } from 'lodash';
import { ILayerProperties } from "../interfaces/movie-properties";
import { ILayerAnimation } from "../interfaces/movie-animations";
import { UtilService } from "../services/util.service";
import { CreateRepeatedLayer } from "./layer";
import { ILayerRepeat } from "../interfaces/movie-layer-repeat";
import { IlayerMedia } from "../interfaces/movie-media";

export class Movie implements IMovie {
    id: string;
    memberBook: IMovieMemberBook;
    movieName: string;
    version: IVersion;
    timeline: { [key: number]: IMovieTime; };

    constructor(movie: IMovie, private utilService: UtilService) {
        this.id = movie.id;
        this.movieName = movie.movieName;
        this.version = movie.version;
        this.timeline = movie.timeline;
        this.memberBook = movie.memberBook;
    }

    addNewLayer(time: number, newLayer: ILayer): void {
        this.checkAndCreateTimeline(time);

        this.timeline[time].layers.push(newLayer);
        this.resetStackPositionNumbers(time);

        if (!newLayer.isProjected)
            this.addAllProjectedLayers(time, newLayer);

        if (newLayer.repeating && newLayer.repeating.repeatingStartTime === time)
            this.addAllRepeatingLayers(time, newLayer, newLayer.repeating);
    }

    removeLayer(time: number, layerId: string): void {
        const { movieTime, layerIndex } = this.getTimelineLayerRef(time, layerId);
        if (layerIndex === undefined || layerIndex === null || !movieTime) return;

        // delete layer
        const deletedLayer = movieTime.layers.splice(layerIndex, 1);
        if (deletedLayer && deletedLayer.length > 0) {
            if (!deletedLayer[0].isProjected)
                this.deleteAllProjectedLayer(time, deletedLayer[0]);
            if (deletedLayer[0].repeating && deletedLayer[0].repeating.repeatingStartTime === time)
                this.deleteAllRepeatingLayers(movieTime, deletedLayer[0], deletedLayer[0].repeating);
        }

        // update stack positions of layers above deleted layer
        this.resetStackPositionNumbers(time);
    }

    updateProperties(time: number, layerId: string, newProperties: ILayerProperties): void {
        const { movieTime, layerIndex, layer } = this.getTimelineLayerRef(time, layerId);
        if (layerIndex === undefined || layerIndex === null || !layer || !movieTime) return;

        const updatedProperties = Object.assign({}, layer.properties, newProperties);
        const newLayer = { ...layer, properties: updatedProperties };
        if (!newLayer.isProjected) this.updateAllProjectedLayers(time, layer, newLayer);
        movieTime.layers[layerIndex] = newLayer;
    }

    updateAnimation(time: number, layerId: string, newAnimation: ILayerAnimation | undefined): void {
        const { movieTime, layerIndex, layer } = this.getTimelineLayerRef(time, layerId);
        if (layerIndex === undefined || layerIndex === null || !layer || !movieTime) return;

        layer.animation = cloneDeep(newAnimation);
    }

    updateLayer(time: number, updatedLayer: ILayer, holdProjectionUpdate: boolean = false): void {
        const { movieTime, layerIndex, layer } = this.getTimelineLayerRef(time, updatedLayer.layerId);
        if (layerIndex === undefined || layerIndex === null || !layer || !movieTime) return;

        const prevStackPosition = layer.properties.stackPosition;
        // const prevIsInView = timeLine.layers[layerIndex].properties.isInView;
        movieTime.layers[layerIndex] = { ...layer, ...updatedLayer };
        movieTime.layers[layerIndex].properties.stackPosition = holdProjectionUpdate ? prevStackPosition : updatedLayer.properties.stackPosition;
    }

    moveLayers(time: number, previousIndex: number, newIndex: number): void {
        const { movieTime } = this.getTimelineLayerRef(time);
        if (!movieTime) return;

        moveItemInArray(movieTime.layers, previousIndex, newIndex);
        movieTime.layers.forEach((l, i) => {
            l.properties.stackPosition = i + 1;
        });
    }

    updateRepeat(time: number, layerId: string, newRepeating: ILayerRepeat | undefined): void {
        const { movieTime, layerIndex, layer } = this.getTimelineLayerRef(time, layerId);
        if (layerIndex === undefined || layerIndex === null || !layer || !movieTime) return;

        this.updateLayerRepeatProperty(movieTime, layer, newRepeating);
        movieTime.layers[layerIndex].repeating = newRepeating;
    }

    moveLayerToTime(time: number, layerId: string, newTime: number): void {
        const { layer } = this.getTimelineLayerRef(time, layerId);
        if (!layer) return;

        // Delete all old Layers from timeline with projected and repeated contents
        this.removeLayer(time, layerId);

        // Update properties of layer based on newTime its going to be added like - End Time, Repeat Start Time
        layer.properties.endTime = newTime + (layer.properties.endTime - time);
        if (layer.repeating) layer.repeating.repeatingStartTime = newTime;

        // Create new layer at newTime
        this.addNewLayer(newTime, layer);

    }

    updateMedia(time: number, layerId: string, media: IlayerMedia | undefined, timeMultiplier: number): void {
        const { movieTime, layerIndex, layer } = this.getTimelineLayerRef(time, layerId);
        if (layerIndex === undefined || layerIndex === null || !layer || !movieTime) return;

        if (!media) {
            layer.media = undefined;
        } else {
            const copyLayer = cloneDeep(layer);
            copyLayer.properties.endTime = time + +((media.endTime - media.startTime) / timeMultiplier).toFixed(2);
            copyLayer.media = media;
            this.updateAllProjectedLayers(time, layer, copyLayer);
            this.timeline[time].layers[layerIndex] = copyLayer;
        }
    }

    // PRIVATE Members
    private resetStackPositionNumbers(time: number): void {
        this.timeline[time].layers.forEach((layer, index) => layer.properties.stackPosition = index + 1);
    }

    private updateLayerRepeatProperty(movieTime: IMovieTime, layer: ILayer, newRepeating: ILayerRepeat | undefined): void {
        const oldRepeating = layer.repeating;

        // If new repeating is undefined and old is not undefined then delete all
        if (oldRepeating && !newRepeating) this.deleteAllRepeatingLayers(movieTime, layer, oldRepeating);

        // If old repeat is undefined and new repeat is defined then add all new repeated layers
        else if (!oldRepeating && newRepeating) this.addAllRepeatingLayers(movieTime.time, layer, newRepeating);

        // If both are set then update
        else if (oldRepeating && newRepeating) {

            // If interval is changed then delete all and recreate new layers
            if (oldRepeating.interval !== newRepeating.interval) {
                this.deleteAllRepeatingLayers(movieTime, layer, oldRepeating);
                this.addAllRepeatingLayers(movieTime.time, layer, newRepeating);

            } else {
                this.updateAllRepeatingLayers(movieTime, layer, oldRepeating, newRepeating);

            }
        }
    }

    private deleteAllRepeatingLayers(movieTime: IMovieTime, layer: ILayer, oldRepeating: ILayerRepeat): void {
        const arrRepeatedTime = (new Array(oldRepeating.count)).fill(0).map((val, index) => movieTime.time + (oldRepeating.interval * (index + 1)));
        arrRepeatedTime.forEach(time => {
            const movieTime = this.timeline[time];
            const layerToDelete = movieTime.layers.find(l => l.repeating && l.repeating.layerId === layer.layerId);
            if (layerToDelete) {
                this.removeLayer(time, layerToDelete.layerId);
            }
        });
    }

    private addAllRepeatingLayers(startTime: number, layer: ILayer, newRepeating: ILayerRepeat): void {
        const arrRepeatedTime = (new Array(newRepeating.count)).fill(0).map((val, index) => startTime + (newRepeating.interval * (index + 1)));
        arrRepeatedTime.forEach(time => {
            const newLayer: ILayer = CreateRepeatedLayer(this.utilService.generateNewId(), layer, newRepeating, time, startTime);
            this.addNewLayer(time, newLayer);
        });
    }

    private updateAllRepeatingLayers(movieTime: IMovieTime, layer: ILayer, oldRepeating: ILayerRepeat, newRepeating: ILayerRepeat): void {
        const maxCount = Math.max(oldRepeating.count, newRepeating.count);

        for (let i = 1; i <= maxCount; i++) {
            const newTime = movieTime.time + (oldRepeating.interval * i);

            // Checking existence
            const oldInRange = oldRepeating.count >= i;
            const newInRange = newRepeating.count >= i;
            const existRepeatedLayerInTimeLine = this.timeline[newTime]?.layers?.find(l => l.repeating && l.repeating.layerId === layer.layerId);

            // if layer do not exists in newTime and is in new range then add it
            if (!existRepeatedLayerInTimeLine && newInRange) {
                const newLayer: ILayer = CreateRepeatedLayer(this.utilService.generateNewId(), layer, newRepeating, newTime, movieTime.time);
                this.addNewLayer(newTime, newLayer);
            }

            // if layer is present in newTime and not present in range of endTime of newLayer then delete
            else if (existRepeatedLayerInTimeLine && !newInRange)
                this.removeLayer(newTime, existRepeatedLayerInTimeLine.layerId);


            // if layer is present in newTime and both old and new end times are in range then update
            else if (existRepeatedLayerInTimeLine && oldInRange && newInRange) {
                const updatedLayer = cloneDeep(layer);
                updatedLayer.repeating = newRepeating;
                this.updateLayer(newTime, updatedLayer, true);
            }
        }
    }

    private checkAndCreateTimeline(time: number): void {
        if (!this.timeline[time]) {
            this.timeline[time] = {
                time,
                layers: []
            }
        }
    }

    private addAllProjectedLayers(time: number, newLayer: ILayer): void {
        let newTime = time + 1;
        while (newTime <= newLayer.properties.endTime) {
            const copyLayer = cloneDeep(newLayer);
            copyLayer.isProjected = true;
            copyLayer.projectionStartTime = time;
            this.addNewLayer(newTime, copyLayer);
            newTime++;
        }
    }

    private updateAllProjectedLayers(time: number, oldLayer: ILayer, newLayer: ILayer): void {
        const maxTime = Math.max(oldLayer.properties.endTime, newLayer.properties.endTime);
        let newTime = time + 1;
        while (newTime <= maxTime) {

            // Cloning layer
            const updatedNewLayer = cloneDeep(newLayer);
            updatedNewLayer.isProjected = true;
            updatedNewLayer.projectionStartTime = time;

            // Check existence
            const oldInRange = oldLayer.properties.endTime >= newTime;
            const newInRange = updatedNewLayer.properties.endTime >= newTime;
            const existProjectedLayerInTimeline = !!this.timeline[newTime]?.layers?.some(l => l.layerId === updatedNewLayer.layerId);

            // if layer do not exists in newTime and is in new range then add it
            if (!existProjectedLayerInTimeline && newInRange)
                this.addNewLayer(newTime, updatedNewLayer);

            // if layer is present in newTime and both old and new end times are in range then update
            else if (existProjectedLayerInTimeline && oldInRange && newInRange)
                this.updateLayer(newTime, updatedNewLayer, true);

            // if layer is present in newTime and not present in range of endTime of newLayer then delete
            else if (existProjectedLayerInTimeline && !newInRange)
                this.removeLayer(newTime, updatedNewLayer.layerId);

            newTime++;
        }
    }

    private deleteAllProjectedLayer(time: number, deletedLayer: ILayer): void {
        let newTime = time + 1;
        while (newTime <= deletedLayer.properties.endTime) {
            this.removeLayer(newTime, deletedLayer.layerId);
            newTime++;
        }
    }

    private getTimelineLayerRef(time: number, layerId: string | undefined = undefined): { movieTime: IMovieTime | undefined, layerIndex: number | undefined, layer: ILayer | undefined } {
        const movieTime = this.timeline[time];
        if (!movieTime) {
            console.log('No Timeline found to update');
            return { movieTime: undefined, layerIndex: undefined, layer: undefined };
        }

        if (!layerId) {
            return { movieTime, layerIndex: undefined, layer: undefined };
        }

        const layerIndex = movieTime.layers.findIndex(l => l.layerId === layerId);
        if (layerIndex < 0) {
            console.log('No Layer found to update');
            return { movieTime, layerIndex: undefined, layer: undefined };
        }
        return { movieTime, layerIndex, layer: movieTime.layers[layerIndex] }
    }

}