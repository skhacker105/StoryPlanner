export interface IJSONDiff {
    keys: string[];
    differencesInString: string | undefined;
    differences: IKeyDifference[];
}

export interface IKeyDifference {
    key: string | number,
    oldValue: any,
    newValue: any
}