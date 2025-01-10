// interfaces
import type { ChatReply } from './llm-models-interfaces';
import { enhancedFetch } from '../fetch';

if (process.env.OPENAI_CHAT_URL === undefined) {
  throw new Error('please set the env variable OPENAI_CHAT_URL');
}
if (process.env.OPENAI_KEY === undefined) {
  throw new Error('please set the env variable OPENAI_KEY');
}
const { OPENAI_CHAT_URL, OPENAI_KEY } = process.env;

export type ChatCompletionMessageInput = {
  content: [] | string;
  role: 'assistant' | 'developer' | 'system' | 'user';
}[];

interface ChatCompletionChoice {
  finish_reason:
    | 'content_filter'
    | 'function_call'
    | 'length'
    | 'stop'
    | 'tool_calls';
  index: number;
  logprobs: null | object;
  message: ChatCompletionMessage;
}

interface ChatCompletionMessage {
  content: null | string;
  refusal: null | string;
}

interface ChatCompletionReply {
  choices: ChatCompletionChoice[];
  created: number;
  id: string;
  model: string;
  object: 'chat.completion';
  service_tier: null | string;
  system_fingerprint: string;
  usage: {
    completion_tokens: number;
    completion_tokens_details?: {
      accepted_prediction_tokens: number;
      reasoning_tokens: number;
      rejected_prediction_tokens: number;
    };
    prompt_tokens: number;
    prompt_tokens_details?: {
      audio_tokens: number;
      cached_tokens: number;
    };
    total_tokens: number;
  };
}
/**
 * Request a chat completion from OpenAI
 * @param root named parameters
 * @param root.json Request a JSON response
 * @param root.messages the message object
 * @param root.model the model to use
 * @returns the completions
 */
export async function openAICompletions({
  json,
  messages,
  model,
}: {
  json: boolean | undefined;
  messages: ChatCompletionMessageInput;
  model: string;
}): Promise<ChatReply> {
  const response = await enhancedFetch<ChatCompletionReply>(OPENAI_CHAT_URL, {
    body: JSON.stringify({
      messages,
      model,
      // eslint-disable-next-line camelcase -- not our code
      response_format: json
        ? {
            type: 'json_object',
          }
        : undefined,
    }),
    headers: {
      'api-key': OPENAI_KEY,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const reply = response?.choices[0].message.content ?? undefined;
  return {
    reply,
  };
}
