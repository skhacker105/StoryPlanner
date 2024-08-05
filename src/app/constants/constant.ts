import { OptionType } from "../types/member-option.type";

export const DBName = 'MovieDB';

export const Tables = {
    MemberStorage: 'Members',
    MovieStorage: 'Movie',
    VideoListStorage: 'VideoList'
}

export const DefaultOptionType: OptionType = 'image';

export const FileTypes = {
    image: 'image/*',
    video: 'video/*',
    audio: 'audio/*'
};