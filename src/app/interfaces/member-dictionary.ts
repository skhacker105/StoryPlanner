import { Member } from "../models/members"
import { IMemberOption } from "./member"

export interface IMemberBookDictionary {
    [key: string]: IMemberBookDictionaryItem
}
export interface IMemberBookDictionaryItem {
    member: Member;
    options: IMemberOptionDictionary;
}

export interface IMemberOptionDictionary {
    [key: string]: IMemberOption
}