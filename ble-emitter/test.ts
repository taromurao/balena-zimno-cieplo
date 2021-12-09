import { interval } from 'rxjs';
import { windowCount, scan, tap } from 'rxjs/operators';

//emit every 1s
const source = interval(1000);
const sink = source
.pipe(
    scan((acc: Array<number>, val: number) => {
        acc.push(val);
        return acc.slice(-3);
    }, [])
);

const subscribeTwo = sink
  .subscribe(val => console.log(val));