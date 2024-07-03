import { Subject } from "rxjs";
import { SortType } from "../types/sort.type";
import { Member } from "../models/members";
import { ILayer } from "../interfaces/movie-layer";

export class ComponentBase {

    public isComponentActive = new Subject<boolean>();
    public sortBy: SortType = 'byName';

    constructor() { }

    toggleSortBy(): void {
        if (this.sortBy === 'byName') this.sortBy = 'byTime';
        else this.sortBy = 'byName';
    }

    onDestroy(): void {
        this.isComponentActive.next(true);
        this.isComponentActive.complete();
    }
}