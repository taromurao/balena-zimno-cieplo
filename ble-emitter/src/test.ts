import { BehaviorSubject, map, Observable, of, startWith, withLatestFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { KalmanFilter, State } from 'kalman-filter';
import { sleep } from './utils';

const measurement: Observable<number> = of(
    // 6m distance
    -84, -96,

        // 4m distance
        -74, -81, -69, -91, -70, -66, -78, -74, -90, -69, -78,

        // 3m distance
        -56, -75, -73, -76, -81, -58, -75, -56, -73,

        // 1m distance
        -56, -75, -73, -76, -81, -58, -75, -56, -73,
);

const filter = new KalmanFilter({
    observation: 1,
    // init: {
    //     // Initial guess:
    //     // RSSI: -75,
    //     // speed: 10 RSSI/step
    //     mean: [[-75], [10]],
    // },
    dynamic: {
        name: 'constant-speed',
        // Assume we get 3 measurements between moves.
        timeStep: 0.3,
        // Assume small measurement errors.
        covariance: [0.01, 0.01],
    }
});

const estimate: BehaviorSubject<State> = new BehaviorSubject(null);

(async () => {
    measurement
        .pipe(
            withLatestFrom(estimate),
            map(([observation, previousCorrected]) =>
                filter.filter({ previousCorrected, observation })),
            tap(x => estimate.next(x)),
        ).subscribe(x => console.debug(x?.mean[0]));

    sleep(1000)
})();