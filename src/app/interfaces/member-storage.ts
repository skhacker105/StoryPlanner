import { Member } from "../models/members";

export interface IMemberStorage {
  members: Member[];
  version: string;
  name: string;
}