import { IMemberOption } from "../interfaces/member";
import { IMemberBookDictionary, IMemberBookDictionaryItem, IMemberOptionDictionary } from "../interfaces/member-dictionary";
import { ILayer } from "../interfaces/movie-layer";
import { Member } from "./members";

export class MemberBookDictionary {
    dictionary: IMemberBookDictionary = {};

    constructor(members: Member[]) {
        members.forEach(member => this.addMember(member));
    }

    public getLayer(layer: ILayer): IMemberBookDictionaryItem {
        return this.dictionary[layer.memberId]
    }

    public getMember(layer: ILayer): Member {
        return this.getLayer(layer).member
    }

    public getOption(layer: ILayer): IMemberOption {
        return this.getLayer(layer).options[layer.memberOptionId];
    }

    private addMember(member: Member): void {
        if (!this.dictionary[member.id]) {
            this.dictionary[member.id] = { member: member, options: {} }
        }
        member.options.forEach(option => this.addMemberOptions(member, option));
    }

    private addMemberOptions(member: Member, option: IMemberOption): void {
        if (!this.dictionary[member.id].options[option.optionId]) {
            this.dictionary[member.id].options[option.optionId] = option;
        }
    }
}