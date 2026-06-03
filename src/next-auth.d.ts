declare module 'next-auth' {
    interface User {
        role: 'customer' | 'partner' | 'admin'
    }

    interface Session {
        user: {
            id: string
            role: 'customer' | 'partner' | 'admin'
        } & DefaultSession["user"]
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: 'customer' | 'partner' | 'admin'
        
    }
}

export {}