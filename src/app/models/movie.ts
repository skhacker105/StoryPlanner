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

    addMemberOptionToTime(time: number, memberId: string, memberOptionId: string, newLayer: ILayer, isProjected: boolean = false, projectionStartTime = 0): void {
        this.checkAndCreateTimeline(time);

        // update existing layers stack position to +1
        this.timeline[time].layers.forEach(layer => layer.properties.stackPosition = layer.properties.stackPosition + 1);
        newLayer.properties.stackPosition = 1;
        if (!isProjected) this.timeline[time].layers.push(newLayer);
        else {
            const newLayerCopy = cloneDeep(newLayer);
            newLayerCopy.isProjected = true;
            newLayerCopy.projectionStartTime = projectionStartTime;
            this.timeline[time].layers.push(newLayerCopy);
        }

        if (!isProjected) {
            this.addMemberProjetedOption(time, memberId, memberOptionId, newLayer);
        }

        if (newLayer.repeating && newLayer.repeating.repeatingStartTime === time) {
            this.addNewRepeating(time, newLayer, newLayer.repeating);
        }
    }

    removeLayer(time: number, layerId: string): void {
        const { movieTime, layerIndex } = this.getTimelineLayerRef(time, layerId);
        if (layerIndex === undefined || layerIndex === null || !movieTime) return;

        // delete layer
        const deletedLayer = movieTime.layers.splice(layerIndex, 1);
        if (deletedLayer && deletedLayer.length > 0) {
            if (!deletedLayer[0].isProjected)
                this.deleteProjectedLayer(time, deletedLayer[0]);
            if (deletedLayer[0].repeating && deletedLayer[0].repeating.repeatingStartTime === time)
                this.deleteOldRepeating(movieTime, deletedLayer[0], deletedLayer[0].repeating);
        }

        // update stack positions of layers above deleted layer
        movieTime.layers.forEach(layer => {
            if (layer.properties.stackPosition > deletedLayer[0].properties.stackPosition)
                layer.properties.stackPosition -= 1;
        });
    }

    updateProperties(time: number, layerId: string, newProperties: ILayerProperties): void {
        const { movieTime, layerIndex, layer } = this.getTimelineLayerRef(time, layerId);
        if (layerIndex === undefined || layerIndex === null || !layer || !movieTime) return;

        const updatedProperties = Object.assign({}, layer.properties, newProperties);
        const newLayer = { ...layer, properties: updatedProperties };
        if (!newLayer.isProjected) this.updateProjectedLayers(time, layer, newLayer);
        movieTime.layers[layerIndex] = newLayer;
    }

    updateAnimation(time: number, layerId: string, newAnimation: ILayerAnimation | undefined): void {
        const { movieTime, layerIndex, layer } = this.getTimelineLayerRef(time, layerId);
        if (layerIndex === undefined || layerIndex === null || !layer || !movieTime) return;

        layer.animation = cloneDeep(newAnimation);
    }

    updateLayer(time: number, newLayer: ILayer, holdProjectionUpdate: boolean = false): void {
        const { movieTime, layerIndex, layer } = this.getTimelineLayerRef(time, newLayer.layerId);
        if (layerIndex === undefined || layerIndex === null || !layer || !movieTime) return;

        const prevStackPosition = layer.properties.stackPosition;
        // const prevIsInView = timeLine.layers[layerIndex].properties.isInView;
        movieTime.layers[layerIndex] = { ...layer, ...newLayer };
        movieTime.layers[layerIndex].properties.stackPosition = holdProjectionUpdate ? prevStackPosition : newLayer.properties.stackPosition;
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

        this.updateRepeatedLayers(movieTime, layer, newRepeating);
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
        this.addMemberOptionToTime(newTime, layer.memberId, layer.memberOptionId, layer);

    }

    // PRIVATE Members
    private updateRepeatedLayers(movieTime: IMovieTime, layer: ILayer, newRepeating: ILayerRepeat | undefined): void {
        const oldRepeating = layer.repeating

        // If new repeating is undefined and old is not undefined then delete all
        if (oldRepeating && !newRepeating) this.deleteOldRepeating(movieTime, layer, oldRepeating);

        // If old repeat is undefined and new repeat is defined then add all new repeated layers
        else if (!oldRepeating && newRepeating) this.addNewRepeating(movieTime.time, layer, newRepeating);

        // If both are set then update
        else if (oldRepeating && newRepeating) {

            // If interval is changed then delete all and recreate new layers
            if (oldRepeating.interval !== newRepeating.interval) {

                this.deleteOldRepeating(movieTime, layer, oldRepeating);
                this.addNewRepeating(movieTime.time, layer, newRepeating);
            } else {

                this.updateExistingRepeating(movieTime, layer, oldRepeating, newRepeating)
            }
        }
    }

    private deleteOldRepeating(movieTime: IMovieTime, layer: ILayer, oldRepeating: ILayerRepeat): void {
        const arrRepeatedTime = (new Array(oldRepeating.count)).fill(0).map((val, index) => movieTime.time + (oldRepeating.interval * (index + 1)));
        arrRepeatedTime.forEach(time => {
            const movieTime = this.timeline[time];
            const layerToDelete = movieTime.layers.find(l => l.repeating && l.repeating.layerId === layer.layerId);
            if (layerToDelete) {
                this.removeLayer(time, layerToDelete.layerId);
            }
        });
    }

    private addNewRepeating(startTime: number, layer: ILayer, newRepeating: ILayerRepeat): void {
        const arrRepeatedTime = (new Array(newRepeating.count)).fill(0).map((val, index) => startTime + (newRepeating.interval * (index + 1)));
        arrRepeatedTime.forEach(time => {
            const newLayer: ILayer = CreateRepeatedLayer(this.utilService.generateNewId(), layer, newRepeating, time, startTime);
            this.addMemberOptionToTime(time, layer.memberId, layer.memberOptionId, newLayer);
        });
    }

    private updateExistingRepeating(movieTime: IMovieTime, layer: ILayer, oldRepeating: ILayerRepeat, newRepeating: ILayerRepeat): void {
        const maxCount = Math.max(oldRepeating.count, newRepeating.count);

        for (let i = 1; i <= maxCount; i++) {
            const newTime = movieTime.time + (oldRepeating.interval * i);
            const oldInRange = oldRepeating.count >= i;
            const newInRange = newRepeating.count >= i;
            const existRepeatedLayerInTimeLine = this.timeline[newTime]?.layers?.find(l => l.repeating && l.repeating.layerId === layer.layerId);

            // if layer do not exists in newTime and is in new range then add it
            if (!existRepeatedLayerInTimeLine && newInRange) {
                const newLayer: ILayer = CreateRepeatedLayer(this.utilService.generateNewId(), layer, newRepeating, newTime, movieTime.time);
                this.addMemberOptionToTime(newTime, newLayer.memberId, newLayer.memberOptionId, newLayer);
            }

            // if layer is present in newTime and not present in range of endTime of newLayer then delete
            else if (existRepeatedLayerInTimeLine && !newInRange)
                this.removeLayer(newTime, existRepeatedLayerInTimeLine.layerId);


            // if layer is present in newTime and both old and new end times are in range then update
            else if (existRepeatedLayerInTimeLine && oldInRange && newInRange)
                this.updateLayer(newTime, existRepeatedLayerInTimeLine, true);
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

    private addMemberProjetedOption(time: number, memberId: string, memberOptionId: string, newLayer: ILayer): void {
        let newTime = time + 1;
        while (newTime <= newLayer.properties.endTime) {
            this.addMemberOptionToTime(newTime, memberId, memberOptionId, newLayer, true, time);
            newTime++;
        }
    }

    private updateProjectedLayers(time: number, oldLayer: ILayer, newLayer: ILayer): void {
        const maxTime = Math.max(oldLayer.properties.endTime, newLayer.properties.endTime);
        const updatedNewLayer = cloneDeep(newLayer);
        updatedNewLayer.isProjected = true;
        let newTime = time + 1;
        while (newTime <= maxTime) {
            const oldInRange = oldLayer.properties.endTime >= newTime;
            const newInRange = updatedNewLayer.properties.endTime >= newTime;
            const existProjectedLayerInTimeline = !!this.timeline[newTime]?.layers?.some(l => l.layerId === updatedNewLayer.layerId);

            // if layer do not exists in newTime and is in new range then add it
            if (!existProjectedLayerInTimeline && newInRange)
                this.addMemberOptionToTime(newTime, updatedNewLayer.memberId, updatedNewLayer.memberOptionId, updatedNewLayer, true, time);

            // if layer is present in newTime and both old and new end times are in range then update
            else if (existProjectedLayerInTimeline && oldInRange && newInRange)
                this.updateLayer(newTime, updatedNewLayer, true);

            // if layer is present in newTime and not present in range of endTime of newLayer then delete
            else if (existProjectedLayerInTimeline && !newInRange)
                this.removeLayer(newTime, updatedNewLayer.layerId);

            newTime++;
        }
    }

    private deleteProjectedLayer(time: number, deletedLayer: ILayer): void {
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