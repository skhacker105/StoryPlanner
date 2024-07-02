import { Member } from "../models/members"
import { IMemberOption } from "./member"

export interface IMemberBookDictionary {
    [key: string]: { member: Member, options: IMemberOptionDictionary }
}

export interface IMemberOptionDictionary {
    [key: string]: IMemberOption
}