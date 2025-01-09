/** Reference an active crawler and it's last heartbeat */
export interface D1Crawler {
  /** The crawler ID, it is a uuid v4 */
  id: string;
  /** The last time the crawler was reporting as being active */
  lastHeartBeat: number;
}

/** Reference an url in D1 */
export interface D1Url {
  /** The crawler currently crawling this url */
  crawlerID: null | string;
  /**
   * The url.
   *
   * For job boards, it must be cleaned and refer to the initial url
   */
  id: string;
  /** The last time the url was crawled, its a unix epoch */
  lastCrawl: null | number;
  summary?: string;
  /**
   * The type of the url:
   *
   * - jobAdvert: The url is a job advert (i.e. a job description)
   * - jobBoard: The url is a job board (i.e. a list of job adverts)
   * - notInteresting: The url is not interesting and should not be crawled again
   * - unknown: The url type is unknown, and has yet to be determined
   */
  urlType: 'blocked' | 'jobAdvert' | 'jobBoard' | 'notInteresting' | 'unknown';
}
