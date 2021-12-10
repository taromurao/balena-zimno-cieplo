// RxJS v6+
import { interval } from 'rxjs';
import { bufferTime, pairwise } from 'rxjs/operators';
import { sleep } from './utils';

//Create an observable that emits a value every 500ms
const source = interval(1500);
//After 2 seconds have passed, emit buffered values as an array
const example = source.pipe(
    bufferTime(1000),
    pairwise(),
);
//Print values to console
//ex. output [0,1,2]...[3,4,5,6]
const subscribe = example.subscribe(val =>
    console.log('Buffered with Time:', val)
);

// (async () => {
//     await sleep(5000);
// })();