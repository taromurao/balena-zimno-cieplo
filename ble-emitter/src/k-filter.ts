import { KalmanFilter, State } from 'kalman-filter';

export const kFilter = new KalmanFilter({
    observation: 1,
    dynamic: {
        name: 'constant-speed',
        // Assume we get 3 measurements between moves.
        timeStep: 0.7,
        // Assume small measurement errors.
        covariance: [0.02, 0.02],
    }
});