# TODO

## scraper

- de-couple the page analysis from the crawling

## Memoire

- Investigate why there are so many terms
- Logging + more granular benchmarking (goal: see where the slow parts are)
- Have and endpoint to return whole documents vs returning chunks
- Overall the chunks are good, just some of them are really crap
- Add summaries + BM25 on chunks

## App

1. Body verification (ideally with typebox)
2. Connect to OpenAI and Memoire

- create a meta query 'the user would like to abcd' use this meta query for creating more queries and the other evals