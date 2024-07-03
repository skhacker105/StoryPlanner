import { Subject } from "rxjs";
import { SortType } from "../types/sort.type";
import { Member } from "../models/members";
import { ILayer } from "../interfaces/movie-layer";

export class ComponentBase {

    public isComponentActive = new Subject<boolean>();
    public sortBy: SortType = 'byName';
    public selectedMember?: Member;
    public selectedLayer?: ILayer;

    constructor() { }

    toggleSortBy(): void {
        if (this.sortBy === 'byName') this.sortBy = 'byTime';
        else this.sortBy = 'byName';
    }

    resetSelectedRecord(): void {
        this.selectedMember = undefined;
    }

    resetSelectedLayer(): void {
        this.selectedLayer = undefined;
    }

    selectRecord(record: Member): void {
        this.selectedMember = record;
    }

    selectLayer(layer: ILayer): void {
        this.selectedLayer = undefined;
        setTimeout(() => {
            this.selectedLayer = layer;
        }, 1);
    }

    onDestroy(): void {
        this.isComponentActive.next(true);
        this.isComponentActive.complete();
    }
}