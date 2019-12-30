import * as mongoose from 'mongoose';

export const mongooseLink = (m: typeof mongoose) => {
    m.Schema.Types.Snowflake = Snowflake;
};

import * as Long from 'long';

import * as s from './snowflake';

class Snowflake extends mongoose.SchemaType {
    public long: s.Snowflake;

    cast(value: any) {
        if (value && value.low && value.high) {
            return new s.Snowflake(new Long(value.low, value.high, true));
        }

        const strValue =
            typeof value.toString === 'function' ? value.toString() : undefined;

        if (!strValue) {
            throw new Error(`Value cannot be ${typeof value}`);
        }

        if (isNaN(Number(value))) {
            throw new Error(`The Value '${value}' is not a numeric string`);
        }

        return new s.Snowflake(strValue);
    }
}
