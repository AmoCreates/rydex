declare module 'next-auth' {
    interface User {
        role: 'user' | 'partner' | 'admin'
    }

    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: 'user' | 'partner' | 'admin'
        
    }
}

export {}