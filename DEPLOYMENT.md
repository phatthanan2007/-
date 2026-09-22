# Vercel deployment

This repository deploys as one Vercel project. The Vite client is built to `client/dist`; the catch-all Express API Function is `api/[...path].js` and serves `/api/*`.

## One-time cloud setup

1. Create a MongoDB Atlas database user with access to the target database. In Atlas Network Access, allow the Vercel Function's outbound traffic using your organization's approved network rule.
2. In Vercel, create a **public** Blob store and connect it to this project. Vercel provides `BLOB_READ_WRITE_TOKEN` for the selected environments.
3. Import the Git repository into Vercel with the repository root as the Root Directory. Do not set it to `client` or `server`.
4. Add these Environment Variables for Preview and Production:

   - `MONGO_URI` — Atlas `mongodb+srv://` connection string
   - `JWT_SECRET` — long, random application secret
   - `BLOB_READ_WRITE_TOKEN` — supplied by the connected Blob store

5. Deploy. Vercel runs `npm install` and `npm run build`; it publishes `client/dist` and deploys the `/api/*` Function.

## Local environment

Copy `server/.env.example` to `server/.env` and provide local development values. Do not commit it. To test the Vercel layout locally, use `npx vercel dev` after linking the project and pulling its environment variables.

## Migrating existing local uploads

Old product image URLs beginning with `/uploads/` are filesystem URLs and cannot work after deployment. The migration script uploads each corresponding file from `server/public/uploads/` to Blob and replaces its URL in Atlas.

First review the proposed changes without writing:

```sh
npm --workspace server run migrate:uploads
```

After checking the output and setting both `MONGO_URI` and `BLOB_READ_WRITE_TOKEN`, perform the migration:

```sh
npm --workspace server run migrate:uploads -- --apply
```

The script does not delete the local uploads. It only changes product records after each replacement Blob URL is returned.
