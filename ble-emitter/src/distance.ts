export interface Distance {
    type: DistanceType;
    previous: number | null;
    current: number | null;
}

type DistanceType = 'BLE';
