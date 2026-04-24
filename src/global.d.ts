import { Connection } from "mongoose"

declare global {
    var mongooseConn: {
        // either server is connected to database or the promise is pending to connect
        conn: Connection | null  // complete connection
        promise: Promise<Connection> | null // pending connection
    }
}

export {}

