import { registerEnumType } from '@nestjs/graphql';

export enum Locale {
  ru = 'ru',
  en = 'en',
}

registerEnumType(Locale, {
  name: 'Locale',
});
