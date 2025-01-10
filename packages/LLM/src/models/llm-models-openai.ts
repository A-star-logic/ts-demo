// libs
import { AzureOpenAI } from 'openai';

if (process.env.AZURE_OPENAI_URL === undefined) {
  throw new Error('please set the env variable AZURE_OPENAI_URL');
}
if (process.env.AZURE_OPENAI_KEY === undefined) {
  throw new Error('please set the env variable AZURE_OPENAI_KEY');
}

export const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  apiVersion: '2024-08-01-preview',
  endpoint: process.env.AZURE_OPENAI_URL,
});
