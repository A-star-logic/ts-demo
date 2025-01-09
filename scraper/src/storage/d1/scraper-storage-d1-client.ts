/*

Code courtesy of https://jsr.io/@nathanbeddoewebdev/d1-sdk@1.0.1
This code was copied (instead of installed as a package) because there is no code repository attached
It has some adaptation as well to fit our use case

*/
interface D1ClientOptions {
  accountId: string;
  apiEmail?: string;
  apiKey?: string;
  bearerToken?: string;
  databaseId?: string;
}

interface D1ClientType {
  query: (
    sql: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- solve this later
    params?: any[],
    databaseId?: string,
  ) => Promise<QueryResponse>;
}

interface QueryResponse {
  errors: {
    code: number;
    message: string;
  }[];
  messages: {
    code: number;
    message: string;
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- solve this later
  result: any[];
  success: boolean;
}

/**
 * D1Client is a client object that can be used to interact with the D1 HTTP API.
 * @param options Authentication options, as well as a a default database id to use for queries.
 * @returns A client object with methods to communicate with the D1 HTTP API.
 */
function D1Client(options: D1ClientOptions): D1ClientType {
  const { accountId, apiEmail, apiKey, bearerToken } = options;
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-Auth-Key'] = apiKey;
  }

  if (apiEmail) {
    headers['X-Auth-Email'] = apiEmail;
  }

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  /**
   *
   * @param sql The sql you want to execute. Use ? in place of parameters.
   * @param params The parameters to use in the query. Use in order of ? in the sql.
   * @param databaseId The database you wish to execute the query on. If not provided, the default database id will be used.
   * @returns The result from the cloudflare D1 HTTP API.
   */
  async function queryDatabase(
    sql: string,
    params?: string[],
    databaseId?: string,
  ): Promise<QueryResponse> {
    const id = databaseId ?? options.databaseId;
    if (!id) {
      throw new Error('No database id provided');
    }
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${id}/query`;

    const body = {
      params: params ?? [],
      sql: sql,
    };

    try {
      const start = Date.now();
      const response = await fetch(url, {
        body: JSON.stringify(body),
        headers: headers,
        method: 'POST',
      });

      const end = Date.now();
      console.log(`Query took ${end - start}ms`);

      const data = await response.json();
      return data as QueryResponse;
    } catch (error) {
      console.error('Error querying D1 database:', error);
      throw error;
    }
  }

  return {
    query: queryDatabase,
  };
}

if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
  throw new Error('Please set the CLOUDFLARE_ACCOUNT_ID env variable');
}
if (!process.env.CLOUDFLARE_DATABASE_ID) {
  throw new Error('Please set the CLOUDFLARE_DATABASE_ID env variable');
}
if (!process.env.CLOUDFLARE_API_KEY) {
  throw new Error('Please set the CLOUDFLARE_API_KEY env variable');
}

export const d1 = D1Client({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  bearerToken: process.env.CLOUDFLARE_API_KEY,
  databaseId: process.env.CLOUDFLARE_DATABASE_ID,
});
