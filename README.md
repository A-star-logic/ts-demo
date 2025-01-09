# TS Demo

This monorepo in typescript show a way of using A* Logic APIs.

It is split in multiple projects:

**Frontend**: The frontend of the app (a simple chat)

**Backend**: An API that will handle all the logic for the application, and connect to various services, including A* Logic and OpenAI.
This backend is written in Typescript with Hono and hosted on Cloudflare.

**Scraper**: The web scraper, that will take as input an url, and fetch all the urls associated in this domain, and prepare them to be ingested in Memoire.

**Packages**: Backend packages that will be reused both by the backend and the scraper.

## Starting the project

```bash
yarn # install the packages
yarn workspace backend dev # start the backend
yarn workspace frontend dev # start the frontend
yarn workspace scraper https://myurl.com # start the scraper
```
