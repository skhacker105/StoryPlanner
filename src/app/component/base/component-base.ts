import { Subject } from "rxjs";

export class ComponentBase {

    public isComponentActive = new Subject<boolean>();

    constructor() {}
 
     onDestroy() {
        this.isComponentActive.next(true);
        this.isComponentActive.complete();
    }
}