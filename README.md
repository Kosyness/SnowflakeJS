# SnowflakeJS

SnowflakeJS is used to Generate Unique IDs. [Twitter Snowflake](https://developer.twitter.com/en/docs/basics/twitter-ids)

# Installing

When using **npm**:

```bash
npm i --save snowflakejs
```

# Usage

First of all, as always, you have to import the module 

```ts
import { Snowflake } from '@saryno/snowflakejs';
```

Afterwards you can use the Snowflakes, to generate Unique IDs

## Generating Ids

### Synchronous Method

```ts
const snowflake = Snowflake.nextSync();
```

And that's it, you just generated a Unique ID.

### Asynchronous Method

```ts
const snowflake = await Snowflake.next();
```

## Using SnowflakeJS with MongoDB and Mongoose

This module includes a method, that allows you to natively use the Snowflakes with MongoDB and Mongoose.

### Linking

First of all, you will have to link Mongoose and SnowflakeJS. To do that, it is extremely easy, as all you have to do is run one function after mongoose connects to MongoDB.

Basically,

```ts
import * as mongoose from 'mongoose';

import { mongooseLink } from '@saryno/snowflakejs';

mongoose.connect(process.env.MONGO_URI, { }, (connection) => {
    mongooseLink(connection);
});
```

And then, using it in a Schema is also extremely easy.

```ts
import * as mongoose from 'mongoose';

const myReallyCoolSchema = new Schema({
    _id: { type: mongoose.Schema.Types.Snowflake }
});

const myReallyCoolModel = new mongoose.model('AReallyCoolName', myReallyCoolSchema);
```

Finally, you can use the Snowflakes as follows:

```ts
import { Snowflake } from '@saryno/snowflakejs';

const theDocumentToSave = new myReallyCoolDocument({
    _id: Snowflake.nextSync(),
});

theDocumentToSave.save();
```

You can use all the normal functions that Mongoose provides, such as `find`, `findOne`, etc.

```ts
const snowflakeOne = 'getASnowflakeInAString';
const snowflakeTwo = 'nowGetAnotherOne';

const snowflakes = [new Snowflake(snowflakeOne), new Snowflake(snowflakeTwo)]

const docs = await myReallyCoolModel.find({ _id: { $in: snowflakes }}).exec();
```
