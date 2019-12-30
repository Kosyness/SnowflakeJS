import { Snowflake } from './snowflake';

const random = (max: number, min: number = 0) =>
    Math.random() * (max - min) + min;

const randomInt = (max: number, min: number = 0) =>
    Math.floor(random(max, min));

const snowflakeEquality = (
    snowflake: Snowflake,
    timestamp: number,
    workerId?: number,
    processId?: number,
    sequence?: number,
) => {
    expect(snowflake.timestamp).toEqual(timestamp);

    if (workerId) {
        expect(snowflake.workerId).toEqual(workerId);
    }

    if (processId) {
        expect(snowflake.processId).toEqual(processId);
    }

    if (sequence) {
        expect(snowflake.sequence).toEqual(sequence);
    }
};

describe('Snowflake Testing', () => {
    const workerId = 12;
    const processId = 13;

    Snowflake.WORKER_ID = workerId;
    Snowflake.PROCESS_ID = processId;

    it('should be able to create a Snowflake using custom values', () => {
        const timestamp = Date.now();
        const sequence = randomInt(1, 20);

        const snowflake = Snowflake.fromValues(
            timestamp,
            workerId,
            processId,
            sequence,
        );

        snowflakeEquality(snowflake, timestamp, workerId, processId, sequence);
    });

    it('should be able to create a Snowflake synchronously', () => {
        const snowflake = Snowflake.nextSync();

        expect(snowflake).toBeTruthy();
        [
            snowflake.processId,
            snowflake.timestamp,
            snowflake.workerId,
            snowflake.sequence,
        ].forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    });

    it('should be able to create 10000 Snowflakes synchronously', () => {
        const snowflakes: Snowflake[] = [];
        for (let i = 0; i < 10000; i++) {
            snowflakes.push(Snowflake.nextSync());
        }

        expect(snowflakes.length).toEqual(10000);
        snowflakes.forEach((snowflake) => {
            expect(snowflake).toBeTruthy();
            [
                snowflake.processId,
                snowflake.timestamp,
                snowflake.workerId,
                snowflake.sequence,
            ].forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
        });
    });

    it('should be able to create a Snowflake asynchronously', async () => {
        const snowflake = await Snowflake.next();

        expect(snowflake).toBeTruthy();
        [
            snowflake.processId,
            snowflake.timestamp,
            snowflake.workerId,
            snowflake.sequence,
        ].forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    });

    it('should be able to create 100000 Snowflakes asynchronously', async () => {
        const snowflakesMap: Array<Promise<Snowflake>> = [];
        for (let i = 0; i < 10000; i++) {
            snowflakesMap.push(Snowflake.next());
        }

        const snowflakes = await Promise.all(snowflakesMap);

        expect(snowflakes.length).toEqual(10000);
        snowflakes.forEach((snowflake) => {
            expect(snowflake).toBeTruthy();
            [
                snowflake.processId,
                snowflake.timestamp,
                snowflake.workerId,
                snowflake.sequence,
            ].forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
        });
    });
});
