
import type { Angle } from '../types';

const canonicalAngles: Angle[] = [
  { name: "front", yaw_deg: 0, pitch_deg: 0, distance: "normal" },
  { name: "three_quarter_left", yaw_deg: -45, pitch_deg: 0, distance: "normal" },
  { name: "left", yaw_deg: -90, pitch_deg: 0, distance: "normal" },
  { name: "back", yaw_deg: 180, pitch_deg: 0, distance: "normal" },
  { name: "three_quarter_right", yaw_deg: 45, pitch_deg: 0, distance: "normal" },
  { name: "right", yaw_deg: 90, pitch_deg: 0, distance: "normal" },
  { name: "top", yaw_deg: 0, pitch_deg: 90, distance: "normal" },
  { name: "top_30", yaw_deg: 0, pitch_deg: 30, distance: "normal" },
  { name: "front_low", yaw_deg: 0, pitch_deg: -20, distance: "normal" },
  { name: "front_high", yaw_deg: 0, pitch_deg: 20, distance: "normal" },
];

export const generateAngleList = (numViews: number): Angle[] => {
    switch (numViews) {
        case 4:
            return [
                canonicalAngles[0], // front
                canonicalAngles[1], // 3/4 left
                canonicalAngles[3], // back
                canonicalAngles[4], // 3/4 right
            ];
        case 5:
            return [
                canonicalAngles[0], // front
                canonicalAngles[1], // 3/4 left
                canonicalAngles[2], // left
                canonicalAngles[3], // back
                canonicalAngles[4], // 3/4 right
            ];
        case 6:
             return [
                canonicalAngles[0], // front
                canonicalAngles[1], // 3/4 left
                canonicalAngles[2], // left
                canonicalAngles[3], // back
                canonicalAngles[4], // 3/4 right
                canonicalAngles[5], // right
            ];
        case 7:
             return [
                canonicalAngles[0], // front
                canonicalAngles[1], // 3/4 left
                canonicalAngles[2], // left
                canonicalAngles[3], // back
                canonicalAngles[4], // 3/4 right
                canonicalAngles[5], // right
                canonicalAngles[7], // top_30
            ];
        case 8:
            return [
                canonicalAngles[0], // front
                canonicalAngles[1], // 3/4 left
                canonicalAngles[2], // left
                { name: "back_left", yaw_deg: -135, pitch_deg: 0, distance: "normal" },
                canonicalAngles[3], // back
                { name: "back_right", yaw_deg: 135, pitch_deg: 0, distance: "normal" },
                canonicalAngles[4], // 3/4 right
                canonicalAngles[5], // right
            ];
        case 9:
             return [
                canonicalAngles[0], // front
                canonicalAngles[1], // 3/4 left
                canonicalAngles[2], // left
                { name: "back_left", yaw_deg: -135, pitch_deg: 0, distance: "normal" },
                canonicalAngles[3], // back
                { name: "back_right", yaw_deg: 135, pitch_deg: 0, distance: "normal" },
                canonicalAngles[4], // 3/4 right
                canonicalAngles[5], // right
                canonicalAngles[7], // top_30
            ];
        case 10:
             return [
                canonicalAngles[0], // front
                canonicalAngles[8], // front_low
                canonicalAngles[1], // 3/4 left
                canonicalAngles[2], // left
                { name: "back_left", yaw_deg: -135, pitch_deg: 0, distance: "normal" },
                canonicalAngles[3], // back
                { name: "back_right", yaw_deg: 135, pitch_deg: 0, distance: "normal" },
                canonicalAngles[4], // 3/4 right
                canonicalAngles[5], // right
                canonicalAngles[7], // top_30
            ];
        default:
            return canonicalAngles.slice(0, 6); // Default to 6
    }
};
