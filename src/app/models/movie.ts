import { moveItemInArray } from "@angular/cdk/drag-drop";
import { ILayer } from "../interfaces/movie-layer";
import { IMovie, IMovieMemberBook, IMovieTime } from "../interfaces/timeline-movie";
import { IVersion } from "../interfaces/version";
import { cloneDeep } from 'lodash';
import { ILayerProperties } from "../interfaces/movie-properties";
import { ILayerAnimation } from "../interfaces/movie-animations";

export class Movie implements IMovie {
    id: string;
    memberBook: IMovieMemberBook;
    movieName: string;
    version: IVersion;
    timeline: { [key: number]: IMovieTime; };

    constructor(movie: IMovie) {
        this.id = movie.id;
        this.movieName = movie.movieName;
        this.version = movie.version;
        this.timeline = movie.timeline;
        this.memberBook = movie.memberBook;
    }

    // PRIVATE Members
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


            if (existProjectedLayerInTimeline && oldInRange && newInRange) {
                // update old from new
                this.updateLayer(newTime, updatedNewLayer, true);

            } else if (existProjectedLayerInTimeline && oldInRange && !newInRange) {
                // delete projected data
                this.removeLayer(newTime, updatedNewLayer.layerId)

            } else if (!existProjectedLayerInTimeline || (!oldInRange && newInRange)) {
                // add new projected data
                this.addMemberOptionToTime(newTime, updatedNewLayer.memberId, updatedNewLayer.memberOptionId, updatedNewLayer, true, time);
            }
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

    // PUBLIC Members
    public addMemberOptionToTime(time: number, memberId: string, memberOptionId: string, newLayer: ILayer, isProjected: boolean = false, projectedTime = 0): void {
        this.checkAndCreateTimeline(time);

        newLayer.properties.stackPosition = this.timeline[time].layers.length + 1;
        if (!isProjected) this.timeline[time].layers.push(newLayer);
        else {
            const newLayerCopy = cloneDeep(newLayer);
            newLayerCopy.isProjected = true;
            newLayerCopy.projectionStartTime = projectedTime;
            this.timeline[time].layers.push(newLayerCopy);
        }

        if (!isProjected) {
            this.addMemberProjetedOption(time, memberId, memberOptionId, newLayer);
        }
    }

    public removeLayer(time: number, layerId: string): void {

        const timeLine = this.timeline[time];
        if (!timeLine) {
            console.log('No Timeline found to update');
            return;
        }

        const layerIndex = timeLine.layers.findIndex(l => l.layerId === layerId);
        if (layerIndex < 0) {
            console.log('No Layer found to update');
            return;
        }

        // delete layer
        const deletedLayer = timeLine.layers.splice(layerIndex, 1);
        if (!deletedLayer[0].isProjected) this.deleteProjectedLayer(time, deletedLayer[0]);

        // update stack positions of layers above deleted layer
        timeLine.layers.forEach(layer => {
            if (layer.properties.stackPosition > deletedLayer[0].properties.stackPosition)
                layer.properties.stackPosition -= 1;
        });
    }

    public updateProperties(time: number, layerId: string, newProperties: ILayerProperties): void {
        const timeLine = this.timeline[time];
        if (!timeLine) {
            console.log('No Timeline found to update');
            return;
        }

        const layerIndex = timeLine.layers.findIndex(l => l.layerId === layerId);
        if (layerIndex < 0) {
            console.log('No Layer found to update');
            return;
        }

        timeLine.layers[layerIndex].properties = Object.assign({}, timeLine.layers[layerIndex].properties, newProperties);
        this.updateLayer(time, timeLine.layers[layerIndex]);
    }

    public updateAnimation(time: number, layerId: string, newAnimation: ILayerAnimation | undefined): void {
        const timeLine = this.timeline[time];
        if (!timeLine) {
            console.log('No Timeline found to update');
            return;
        }

        const layerIndex = timeLine.layers.findIndex(l => l.layerId === layerId);
        if (layerIndex < 0) {
            console.log('No Layer found to update');
            return;
        }

        timeLine.layers[layerIndex].animation = cloneDeep(newAnimation);
    }

    public updateLayer(time: number, newLayer: ILayer, holdStackPositionUpdate: boolean = false): void {

        const timeLine = this.timeline[time];
        if (!timeLine) {
            console.log('No Timeline found to update');
            return;
        }

        const layerIndex = timeLine.layers.findIndex(l => l.layerId === newLayer.layerId);
        if (layerIndex < 0) {
            console.log('No Layer found to update');
            return;
        }

        const prevStackPosition = timeLine.layers[layerIndex].properties.stackPosition;
        if (!newLayer.isProjected) this.updateProjectedLayers(time, timeLine.layers[layerIndex], newLayer);
        timeLine.layers[layerIndex] = Object.assign(
            {},
            timeLine.layers[layerIndex],
            newLayer,
            {
                stackPosition: holdStackPositionUpdate ? prevStackPosition : newLayer.properties.stackPosition
            })
    }

    public moveLayers(time: number, previousIndex: number, newIndex: number) {

        const timeLine = this.timeline[time];
        if (!timeLine) {
            console.log('No Timeline found to update');
            return;
        }

        moveItemInArray(timeLine.layers, previousIndex, newIndex);
        timeLine.layers.forEach((l, i) => {
            l.properties.stackPosition = i + 1;
        });
    }

}