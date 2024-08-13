import { OptionType } from "../types/member-option.type";

export interface IMember {
    id: string;
    name: string;
    image: any;
    options: IMemberOption[];
}

export interface IMemberOption extends IMemberOptionItem {
    optionId: string;
    name: string;
}

export interface IMemberOptionItem {
    file: string;
    type: OptionType;
    length: number;
    thumbnail?: string;
}