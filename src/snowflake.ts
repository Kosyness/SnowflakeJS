import * as Long from 'long';

const bits = {
    TOTAL: 64,
    EPOCH: 42,
    WORKER: 5,
    PROCESS: 5,
    SEQUENCE: 12,
};

const maxValues = {
    WORKER: Math.pow(2, bits.WORKER) - 1,
    PROCESS: Math.pow(2, bits.PROCESS) - 1,
    SEQUENCE: Math.pow(2, bits.SEQUENCE) - 1,
};

const createSnowflake = (
    timestamp = Date.now(),
    workerId = 0,
    processId = 0,
    sequence = 0,
) => {
    timestamp = timestamp - Snowflake.EPOCH;

    // The Timestamp
    let id = Long.fromString('' + timestamp).shiftLeft(bits.TOTAL - bits.EPOCH);

    // The Worker ID
    id = id.or(
        Long.fromInt(workerId).shiftLeft(bits.TOTAL - bits.EPOCH - bits.WORKER),
    );

    // The Process ID
    id = id.or(
        Long.fromInt(processId).shiftLeft(
            bits.TOTAL - bits.EPOCH - bits.WORKER - bits.PROCESS,
        ),
    );

    // The Sequence
    id = id.or(
        Long.fromInt(sequence).shiftLeft(
            bits.TOTAL -
                bits.EPOCH -
                bits.WORKER -
                bits.PROCESS -
                bits.SEQUENCE,
        ),
    );

    return id.toUnsigned();
};

export class Snowflake {
    public static WORKER_ID = Number(process.env.WORKER_ID || 0);
    public static PROCESS_ID = Number(
        process.env.PROCESS_ID || process.pid || 0,
    );
    public static EPOCH = 1546300800000;

    private static lastTimestamp = -1;
    private static sequence = 0;
    public static async next() {
        let currentTime = this.timestamp();
        if (currentTime === this.lastTimestamp) {
            // tslint:disable-next-line: no-bitwise
            this.sequence = (this.sequence + 1) & maxValues.SEQUENCE;
            if (this.sequence === 0) {
                currentTime = await this.wait(currentTime);
            }
        } else {
            this.sequence = 0;
        }

        this.lastTimestamp = currentTime;

        return new Snowflake(
            createSnowflake(
                currentTime,
                this.WORKER_ID,
                this.PROCESS_ID,
                this.sequence,
            ),
        );
    }
    public static nextSync() {
        let currentTime = this.timestamp();
        if (currentTime === this.lastTimestamp) {
            // tslint:disable
            this.sequence = (this.sequence + 1) & maxValues.SEQUENCE;

            if (this.sequence === 0) {
                currentTime = this.waitSync(0);
            }
        } else {
            this.sequence = 0;
        }

        this.lastTimestamp = currentTime;

        return new Snowflake(
            createSnowflake(
                currentTime,
                this.WORKER_ID,
                this.PROCESS_ID,
                this.sequence,
            ),
        );
    }

    private static timestamp() {
        return (
            Long.fromNumber(Date.now() - this.EPOCH)
                // .shiftLeft(bits.TOTAL - bits.EPOCH)
                .toNumber()
        );
    }

    private static async wait(currentTime: number): Promise<number> {
        return new Promise((res) => {
            const interval = setInterval(() => {
                const time = this.timestamp();
                if (time > currentTime) {
                    clearInterval(interval);
                    res(time);
                }
            });
        });
    }

    private static waitSync(currentTime: number) {
        let now = Date.now();
        while (currentTime === now) {
            now = Date.now();
        }

        return now;
    }

    public static fromValues(
        timestamp: number,
        workerId = this.WORKER_ID,
        processId = this.PROCESS_ID,
        sequence = this.sequence,
    ) {
        return new this(
            createSnowflake(timestamp, workerId, processId, sequence),
        );
    }

    private long: Long;

    constructor(value: Long | string | number) {
        if (typeof value === 'string') {
            this.long = Long.fromString(value, true);
        } else if (typeof value === 'number') {
            this.long = Long.fromNumber(value, true);
        } else {
            this.long = value.toUnsigned();
        }
    }

    public get timestamp() {
        return this.long
            .shiftRight(22)
            .add(Long.fromString('' + Snowflake.EPOCH))
            .toNumber();
    }

    public get workerId() {
        const workerId = this.long
            .shiftLeft(42)
            .shiftRight(42)
            .shiftRight(5 + 12)
            .toNumber();
        return workerId < 0 ? workerId ** -1 : workerId;
    }

    public get processId() {
        const pid = this.long
            .shiftLeft(42 + 5)
            .shiftRight(42 + 5)
            .shiftRight(12)
            .toNumber();
        return pid < 0 ? pid ** -1 : pid;
    }

    public get sequence() {
        return this.long
            .shiftLeft(42 + 5 + 5)
            .shiftRight(42 + 5 + 5)
            .toNumber();
    }

    public setTimestamp(timestamp: number) {
        return createSnowflake(
            timestamp,
            this.workerId,
            this.processId,
            this.sequence,
        );
    }

    public setWorkerId(workerId: number) {
        return createSnowflake(
            this.timestamp,
            workerId,
            this.processId,
            this.sequence,
        );
    }

    public setProcessId(processId: number) {
        return createSnowflake(
            this.timestamp,
            this.workerId,
            processId,
            this.sequence,
        );
    }

    public setSequence(sequence: number) {
        return createSnowflake(
            this.timestamp,
            this.workerId,
            this.processId,
            sequence,
        );
    }

    // toJSON() {
    //     // return this.long.();
    // }

    toString() {
        return this.long.toString();
    }

    toBSON() {
        return { low: this.long.low, high: this.long.high };
    }
}
