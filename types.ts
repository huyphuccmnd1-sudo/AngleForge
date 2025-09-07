export type BackgroundMode = 'white' | 'transparent' | 'showroom';

export interface GeneratedImage {
    name: string;
    src: string | null;
    angle: Angle;
}

export interface Angle {
    name: string;
    yaw_deg: number;
    pitch_deg: number;
    distance: 'close' | 'normal' | 'far';
}

export interface RenderViewConfig {
    imageBase64: string;
    imageMimeType: string;
    productProfile: string;
    angle: Angle;
    backgroundMode: BackgroundMode;
    extras: string;
}