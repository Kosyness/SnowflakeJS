declare module 'mongoose' {
    namespace Schema {
        namespace Types {
            class Snowflake extends SchemaType {}
        }
    }
}
