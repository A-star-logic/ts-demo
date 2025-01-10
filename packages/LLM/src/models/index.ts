// interfaces
import type { ChatReply } from './llm-models-interfaces';

// AI Models
import {
  type ChatCompletionMessageInput,
  openAICompletions,
} from './llm-models-openai';

/**
 * Request a chat completion from an LLM model
 * @param root named parameters
 * @param root.json Request a JSON response
 * @param root.messages the message object
 * @param root.model the model to use
 * @returns the completion request
 */
export async function completions({
  json,
  messages,
  model,
}: {
  json?: boolean;
  messages: ChatCompletionMessageInput;
  model: 'gpt-4o' | 'gpt-4o-mini';
}): Promise<ChatReply> {
  switch (model) {
    case 'gpt-4o':
    case 'gpt-4o-mini': {
      return openAICompletions({ json, messages, model });
    }
  }
}
