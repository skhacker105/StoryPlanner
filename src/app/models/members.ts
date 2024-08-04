import { IMember, IMemberOption } from "../interfaces/member";

export class Member implements IMember {

    id: string;
    name: string;
    image: any;
    options: IMemberOption[];

    constructor(member: IMember) {
        this.id = member.id;
        this.image = member.image;
        this.name = member.name;
        this.options = member.options;
    }

    updateDetails(memberData: IMember) {
        this.name = memberData.name;
        this.image = memberData.image;
        this.options = memberData.options;
    }

    addOption(option: IMemberOption): void {
        this.options.push(option);
    }

    removeOption(optionId: string): void {
        this.options = this.options.filter(option => option.optionId !== optionId);
    }

    updateOption(optionData: IMemberOption): void {
        const existingOption = this.options.find(option => option.optionId === optionData.optionId);
        if (!existingOption) {
          console.log('No option found to update for ', this.getJSON(), '\n option = ', optionData);
          return;
        }

        existingOption.name = optionData.name;
        existingOption.file = optionData.file;
    }

    getJSON() {
        return {
            id: this.id,
            name: this.name,
            image: this.image,
            options: this.options
        };
    }
}