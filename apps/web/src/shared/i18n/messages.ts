import type { Locale } from '#web/shared/lib/locale-state';

import { messagesLocale as messagesEn } from '#web/shared/i18n/messages.locale.en';
import { messagesLocale as messagesRu } from '#web/shared/i18n/messages.locale.ru';

export const messages = {
  ru: messagesRu,
  en: messagesEn,
} as const satisfies Record<Locale, Record<string, string>>;

export type MessageKey = keyof typeof messages.ru;

type AssertMatchingKeys<Ru extends Record<string, string>, En extends Record<keyof Ru, string>> = En;
type _MessagesKeyParity = AssertMatchingKeys<typeof messagesRu, typeof messagesEn>;

export function formatMessage(template: string, vars: Record<string, string> = {}) {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  );
}
