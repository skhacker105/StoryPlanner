import { Subject } from "rxjs";
import { SortType } from "../types/sort.type";
import { Member } from "../models/members";

export class ComponentBase {

    public isComponentActive = new Subject<boolean>();
    public sortBy: SortType = 'byName';
    public selectedMember?: Member;

    constructor() { }

    toggleSortBy(): void {
        if (this.sortBy === 'byName') this.sortBy = 'byTime';
        else this.sortBy = 'byName';
    }

    resetSelectedRecord(): void {
        this.selectedMember = undefined;
    }

    selectRecord(record: Member): void {
        this.selectedMember = record;
    }

    onDestroy(): void {
        this.isComponentActive.next(true);
        this.isComponentActive.complete();
    }
}