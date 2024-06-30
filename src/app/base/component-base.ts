import { Subject } from "rxjs";
import { SortType } from "../types/sort.type";

export class ComponentBase {

    public isComponentActive = new Subject<boolean>();
    public sortBy: SortType = 'byName';

    constructor() {}

    toggleSortBy() {
        if (this.sortBy === 'byName') this.sortBy = 'byTime';
        else this.sortBy = 'byName';
    }
 
     onDestroy() {
        this.isComponentActive.next(true);
        this.isComponentActive.complete();
    }
}