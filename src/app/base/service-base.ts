import { Subject } from "rxjs";

export class ServiceBase {

    public isServiceActive = new Subject<boolean>();

    constructor() { }

    onDestroy(): void {
        this.isServiceActive.next(true);
        this.isServiceActive.complete();
    }
}