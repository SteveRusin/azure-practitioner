import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ProductsService } from './products.service';
import { ProductItemComponent } from './product-item/product-item.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { DeepChat } from 'deep-chat';

import 'deep-chat';
import { environment } from 'src/environments/environment';

type DeepChatHandlerBody = {
  format: string;
  messages: {
    role: string;
    text: string;
  }[];
  model: 'moondream';
  stream: boolean;
};

type AiPayload = {
  format: string;
  messages: {
    role: string;
    content: string;
  }[];
  model: 'moondream';
  stream: boolean;
};

type AiResponse = {
  done: boolean;
  message: {
    role: string;
    content: string;
  };
};

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [ProductItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsComponent {
  products = toSignal(inject(ProductsService).getProducts(), {
    initialValue: [],
  });

  constructor() {}

  initialMessages = [
    {
      role: 'assistant',
      text: 'Hi. I am ai shopping assistant. How can I help you?',
    },
  ];

  setAiContext(messages: AiPayload['messages']) {
    return [
      {
        role: 'user',
        content: `Please act as a shopping assistant for a client of a ecommerce shopping store.
           Answer precise and concise. Dont produce long messssages. This message will be hidden for the user.`,
      },
      ...messages,
    ];
  }

  requestBodyLimits: DeepChat['requestBodyLimits'] = {
    maxMessages: 10,
  };

  connect: DeepChat['connect'] = {
    url: environment.chatBotUrl,
    method: 'POST',
    stream: true,
    handler: async (body: DeepChatHandlerBody, signals) => {
      const MAX_MESSAGES = 3;
      const userMessages = body.messages.filter((m) => m.role === 'user');
      const abortController = new AbortController();
      signals.stopClicked.listener = () => {
        abortController.abort();
      };
      try {
        if (userMessages.length > MAX_MESSAGES) {
          throw new Error(
            `Sorry. But for cost limitation you can ask only ${MAX_MESSAGES} questions max.`,
          );
        }

        const normalisedBody: AiPayload = {
          ...body,
          messages: this.setAiContext(
            body.messages.map((message) => ({
              role: message.role,
              content: message.text,
            })),
          ),
        };
        const reader = await this.sendToAi(normalisedBody, {
          signal: abortController.signal,
        });
        let message = '';
        // eslint-disable-next-line no-constant-condition
        while (true) {
          signals.onOpen();
          const { done, value } = await reader.read();
          if (done) {
            return;
          }

          const textDecoder = new TextDecoder();

          const aiResponseMessage: AiResponse = JSON.parse(
            textDecoder.decode(value),
          );

          if (aiResponseMessage.done) {
            return;
          }

          message += aiResponseMessage.message.content;

          signals.onResponse({
            text: message,
            overwrite: true,
          });
        }
      } catch (error) {
        console.error(error);
        signals.onResponse({
          role: 'assistant',
          html: `
            <div class="message-bubble error-message-text">
              <p>${(error as Error).message || 'Something went wrong'}</p>
            </div>
            `,
        });
      } finally {
        signals.onClose();
      }
    },
    additionalBodyProps: {
      model: 'llama3.2',
      stream: true,
    },
  };

  async sendToAi(
    messages: AiPayload,
    params: {
      signal: AbortSignal;
    },
  ) {
    const response = await fetch(environment.chatBotUrl, {
      method: 'POST',
      body: JSON.stringify(messages),
      signal: params.signal,
    });

    return response.body!.getReader();
  }
}
