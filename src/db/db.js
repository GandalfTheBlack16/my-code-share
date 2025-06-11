import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGO_DB ?? "code-share";
const collection = process.env.MONGO_COLLECTION ?? "code";

const client = new MongoClient(uri);
const database = client.db(dbName);
const code = database.collection(collection);

export async function connect() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export async function save({ owner, data }) {
    await code.updateOne(
      { owner: owner },
      { $set: { code: data } },
      { upsert: true }
    );
}

export async function getData({ owner }) {
    try {
        const result = await code.findOne({ owner });
        return result ? result.code : null;
    } catch (error) {
        console.error('Error retrieving data:', error);
        throw error;
    }
}
