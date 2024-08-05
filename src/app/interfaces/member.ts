import { OptionType } from "../types/member-option.type";

export interface IMember {
    id: string;
    name: string;
    image: any;
    options: IMemberOption[];
}

export interface IMemberOption {
    optionId: string;
    name: string;
    file: string;
    type: OptionType;
}