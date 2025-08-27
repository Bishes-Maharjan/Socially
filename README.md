# APP LIVE AT <a href='https://socially-7vh2.vercel.app/'> Click Here</a>

## Getting Started
This is a fullstack Next.js App which uses clerk for authentication and builtin routing for authorization.
### Tech Stack Used:
- Nextjs
- Clerk
- PostgreSQL
- Prisma
- Shadcn UI


If you want to run this locally:
```bash
UPLOADTHING_TOKEN= 'ur uploadthing token'
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= 'Clerk key'
CLERK_SECRET_KEY= 'clerk secret key'
DATABASE_URL= 'ur local psql or can use a neons psql like i did'

```
First download all the modules ,try to push ur db with prisma with: 

```bash
npm install
prisma generate
prisma db push

npm run dev
```



