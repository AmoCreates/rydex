import mongoose from "mongoose";

const mongodbUrl = process.env.MONGODB_URI;
if (!mongodbUrl) {
	throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

let cached = global.mongooseConn;

if (!cached) {
	cached = global.mongooseConn = { conn: null, promise: null };
}

const dbConnect = async () => {
	if (cached.conn) {
		return cached.conn;
	}

	// neither connection in cached nor in pending promise
	if (!cached.promise) {
		cached.promise = mongoose.connect(mongodbUrl).then((c) => c.connection);
	}

	// not in cached but promise is pending to connect
	try {
		cached.conn = await cached.promise;
		return cached.conn;
	} catch (error) {
		cached.promise = null;
		throw error;
	}

};

export default dbConnect;