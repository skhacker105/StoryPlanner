export type CssDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
export type CssTimingFunction = 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
export type CssFillMode = 'none' | 'forwards' | 'backwards' | 'both';

export const CssDirections: CssDirection[] = ['normal', 'reverse', 'alternate', 'alternate-reverse'];
export const CssTimingFunctions: CssTimingFunction[] = ['ease', 'ease-in', 'ease-in-out', 'ease-out', 'linear'];
export const CssFillModes: CssFillMode[] = ['backwards', 'both', 'forwards', 'none'];
