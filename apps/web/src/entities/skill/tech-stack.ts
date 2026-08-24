import angularIcon from '#app/icons/angular.svg';
import javascriptIcon from '#app/icons/javascript.svg';
import nodeIcon from '#app/icons/node.svg';
import reactIcon from '#app/icons/react.svg';
import svelteIcon from '#app/icons/svelte.svg';
import typescriptIcon from '#app/icons/typescript.svg';
import vueIcon from '#app/icons/vue.svg';

export type TechStackItem = {
  id: string;
  name: string;
  reading: string;
  summary: string;
  experience: string;
  icon: string;
  size: number;
  isCore?: boolean;
};

export const TECH_STACK: TechStackItem[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    reading: 'джаваскрипт',
    summary: 'Язык, на котором крутится весь фронт и Node.',
    experience: 'База всего. Без него остальной стек не живёт — знаю уверенно, пишу каждый день.',
    icon: javascriptIcon,
    size: 120,
    isCore: true,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    reading: 'тайпскрипт',
    summary: 'Типизированный JS — типы на этапе разработки, не в рантайме.',
    experience: 'Плюс: меньше багов на проде. Минус: иногда типовая дрочь. В проде — да, без него не хочу.',
    icon: typescriptIcon,
    size: 64,
  },
  {
    id: 'node',
    name: 'Node.js',
    reading: 'нода',
    summary: 'JS на сервере — рантайм, не фреймворк.',
    experience: 'Бэкенд, CLI, скрипты. Плюс: один язык везде. Минус: тяжёлые CPU-таски не его конёк.',
    icon: nodeIcon,
    size: 68,
  },
  {
    id: 'react',
    name: 'React',
    reading: 'реакт',
    summary: 'UI-библиотека для JS — компоненты и состояние.',
    experience: 'Основной UI-стек. Хуки, экосистема жирная. Минус: надо дисциплина, иначе каша в проекте.',
    icon: reactIcon,
    size: 72,
  },
  {
    id: 'vue',
    name: 'Vue',
    reading: 'вью',
    summary: 'Фреймворк для JS — реактивный UI из коробки.',
    experience: 'Приятный вход, SFC удобны. Меньше вакансий чем React, но сам фреймворк очень приятный.',
    icon: vueIcon,
    size: 72,
  },
  {
    id: 'angular',
    name: 'Angular',
    reading: 'ангуляр',
    summary: 'Полноценный фреймворк для JS — всё в одном ящике.',
    experience: 'Энтерпрайз, жёсткая структура. Плюс: предсказуемость. Минус: тяжеловат для маленьких задач.',
    icon: angularIcon,
    size: 60,
  },
  {
    id: 'svelte',
    name: 'Svelte',
    reading: 'свелт',
    summary: 'Компилируемый UI-фреймворк для JS.',
    experience: 'Мало рантайма, код чистый. Экосистема меньше, но для прототипов и UI — кайф.',
    icon: svelteIcon,
    size: 60,
  },
];

export const CORE_TECH = TECH_STACK.find((item) => item.isCore)!;
export const ORBIT_TECH = TECH_STACK.filter((item) => !item.isCore);
