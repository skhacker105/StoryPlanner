import { IMember, IMemberOption } from "../interfaces/member";

export class Member implements IMember {

    memberId: string;
    name: string;
    image: any;
    options: IMemberOption[];

    constructor(member: IMember) {
        this.memberId = member.memberId;
        this.image = member.image;
        this.name = member.name;
        this.options = member.options;
    }

    updateDetails(memberData: IMember) {
        console.log('memberData = ', JSON.parse(JSON.stringify(memberData)))
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
        existingOption.image = optionData.image;
    }

    getJSON() {
        return {
            memberId: this.memberId,
            name: this.name,
            image: this.image,
            options: this.options
        };
    }
}