import { Suite } from 'benchmark';
import { Snowflake } from './snowflake';

const suite = new Suite('Snowflake', { async: true });

suite
    .add('Snowflake#next', async () => {
        return await Snowflake.next();
    })
    .add('Snowflake#nextSync', () => {
        return Snowflake.nextSync();
    })
    .on('cycle', (event) => {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({ async: true, minSamples: 10000 });
