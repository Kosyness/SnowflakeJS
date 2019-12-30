import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { mongooseLink } from './';
import { Snowflake } from './snowflake';

dotenv.config();

describe('Snowflakes in Mongoose', () => {
    beforeAll(
        async () =>
            await mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
            }),
    );

    mongooseLink(mongoose);

    // The TS Ignore is there, because TSLint would not load the custom typings for Mongoose And Snowflake
    // @ts-ignore
    const SnowflakeType = mongoose.Schema.Types.Snowflake;

    const schema = new mongoose.Schema(
        {
            _id: { type: SnowflakeType },
        },
        { versionKey: false },
    );

    const SnowflakeTestingModel = mongoose.model('SnowflakeTesting', schema);

    it('should read and write a document with the _id from a Snowflake', async () => {
        const snowflake = Snowflake.nextSync();
        const docToWrite = new SnowflakeTestingModel({ _id: snowflake });

        await docToWrite.save();

        const docToRead = await SnowflakeTestingModel.findOne({
            _id: snowflake,
        }).exec();

        expect(docToRead._id.toString()).toEqual(docToWrite._id.toString());
    }, 10000);

    xit('should be able to sort documents correctly', async () => {
        // const snowflakes = Array(100).map(() => Snowflake.nextSync());

        const docsToSave = 100;
        const snowflakeMap = [];
        for (let i = 0; i < docsToSave; i++) {
            snowflakeMap.push(Snowflake.next());
        }

        const snowflakes: Snowflake[] = await Promise.all(snowflakeMap);
        const documentsToSave = snowflakes.map(
            (snowflake) => new SnowflakeTestingModel({ _id: snowflake }),
        );
        console.log(documentsToSave);
        const first = documentsToSave[0]._id as Snowflake;
        const last = documentsToSave[docsToSave - 1]._id as Snowflake;

        await Promise.all(documentsToSave.map((v) => v.save()));

        const documentsToSort = await SnowflakeTestingModel.find({
            _id: { $in: snowflakes },
        })
            .sort({ _id: -1 })
            .exec();

        console.log(
            documentsToSort
                .map((v) => v._id as Snowflake)
                .map((v) => v.toString()),
        );
    });
});
