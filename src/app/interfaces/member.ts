export interface IMember {
    memberId: string;
    name: string;
    image: any;
    options: IMemberOption[];
}

export interface IMemberOption {
    optionId: string;
    name: string;
    image: string;
}