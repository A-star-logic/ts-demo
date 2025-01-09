// d1
import type { D1Url } from './scraper-storage-d1-schemas.js';
import { d1 } from './scraper-storage-d1-client.js';

/**
 * Add the generated summary of an url in D1
 * @param root named parameters
 * @param root.id the url
 * @param root.summary the summary to add
 */
export async function addSummaryToUrl({
  id,
  summary,
}: {
  id: string;
  summary: string;
}): Promise<void> {
  const query = `
    UPDATE urls
    SET summary = ?
    WHERE id = ?;
  `;
  const params = [summary, id];
  const response = await d1.query(query, params);
  console.log(response);
  if (!response.success) {
    console.error(response.errors);
    throw new Error('Failed to update url in D1');
  }
}

/**
 * Remove urls in bulk from D1 using their ID
 * @param root named params
 * @param root.urlIDs the url IDs to remove
 */
export async function bulkDeleteUrls({
  urlIDs,
}: {
  urlIDs: string[];
}): Promise<void> {
  let query = 'DELETE FROM urls WHERE id IN (';
  // eslint-disable-next-line @typescript-eslint/prefer-for-of -- this loop is easier to understand here
  for (let index = 0; index < urlIDs.length; index++) {
    query += ' ?,';
  }
  // replace the last ',' by ');'
  query = query.slice(0, -1) + ');';

  const response = await d1.query(query, urlIDs);
  if (!response.success) {
    console.error(response.errors);
    throw new Error('Failed to create crawler in D1');
  }
}

/**
 * Insert urls in bulk; will skip duplicates
 * @param root named parameters
 * @param root.urls The urls to insert
 */
export async function bulkInsertUrls({
  urls,
}: {
  urls: D1Url[];
}): Promise<void> {
  // this is a trashy hack, but tldr; It adds a new line of params for each url
  let query = 'INSERT INTO urls (crawlerID, id, lastCrawl, urlType) VALUES';
  const params = urls.flatMap((urlObject) => {
    query += ' (?, ?, ?, ?),';
    return [
      urlObject.crawlerID,
      urlObject.id,
      urlObject.lastCrawl,
      urlObject.urlType,
    ];
  });
  // remove the last ',' and skip duplicates
  query = query.slice(0, -1) + ' ON CONFLICT (id) DO NOTHING;';

  const response = await d1.query(query, params);
  if (!response.success) {
    console.error(response.errors);
    throw new Error('Failed to bulk upsert urls in D1');
  }
}

/**
 * Remove the crawler from D1
 * @param root named parameters
 * @param root.crawlerID The crawler ID to delete
 */
export async function deleteCrawler({
  crawlerID,
}: {
  crawlerID: string;
}): Promise<void> {
  const response = await d1.query(
    `
    DELETE FROM crawlers
    WHERE id = ?;
    `,
    [crawlerID],
  );
  if (!response.success) {
    console.error(response.errors);
    throw new Error('Failed to create crawler in D1');
  }
}

/**
 * Fetch a url and associated metadata from D1
 * @param root named parameters
 * @param root.ids The url IDs
 * @returns the url row
 */
export async function getUrlsById({
  ids,
}: {
  ids: string[];
}): Promise<D1Url[]> {
  let query = 'SELECT * FROM urls WHERE id IN (';
  // eslint-disable-next-line @typescript-eslint/prefer-for-of -- this loop is easier to understand here
  for (let index = 0; index < ids.length; index++) {
    query += '?,';
  }
  // replace the last ',' by ');'
  query = query.slice(0, -1) + ');';

  const response = await d1.query(query, ids);
  if (!response.success) {
    console.error(response.errors);
    throw new Error('Failed to fetch a row from D1');
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- easier for prototyping, could be nicer to have the full TS definition at some point
  return response.result[0].results as D1Url[];
}

/**
 * Update an url in D1
 * @param root named parameters
 * @param root.urlMeta The url metadata to update
 */
export async function updateUrl({
  urlMeta,
}: {
  urlMeta: D1Url;
}): Promise<void> {
  const query = `
    UPDATE urls
    SET crawlerID = ?, lastCrawl = ?, urlType = ?
    WHERE id = ?;
  `;
  const params = [
    urlMeta.crawlerID,
    urlMeta.lastCrawl,
    urlMeta.urlType,
    urlMeta.id,
  ];
  const response = await d1.query(query, params);
  if (!response.success) {
    console.error(response.errors);
    throw new Error('Failed to update url in D1');
  }
}

/**
 * Create a crawler in the D1 database and give the first heartbeat
 * @param root named parameters
 * @param root.crawlerID The crawler ID to insert
 */
export async function upsertCrawler({
  crawlerID,
}: {
  crawlerID: string;
}): Promise<void> {
  const response = await d1.query(
    `
    INSERT or REPLACE INTO crawlers (id, lastHeartBeat)
    VALUES (?, ?);
    `,
    [crawlerID, Date.now()],
  );
  if (!response.success) {
    console.error(response.errors);
    throw new Error('Failed to create crawler in D1');
  }
}
