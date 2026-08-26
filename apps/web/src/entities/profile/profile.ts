export type ProfileFact = {
  label: string;
  value: string;
};

export type ProfileInfo = {
  name: string;
  role: string;
  tag: string;
  blurb: string;
  portrait: string;
  facts: ProfileFact[];
  goals: string[];
  about: string[];
};

export const PROFILE: ProfileInfo = {
  name: 'Рыбчин Роман',
  role: 'Frontend-разработчик · TypeScript / Vue / Node',
  tag: 'about',
  blurb:
    'JavaScript — ядро. Вокруг него то, с чем реально пахал: Vue и React, Node и Nest, Prisma, GraphQL, Docker, CI. Легаси вроде jQuery/PHP — по делу, когда надо довести, не как витрина навыков.',
  portrait: '/portrait.webp',
  facts: [
    { label: 'Возраст', value: '29' },
    { label: 'Город', value: 'Москва' },
    { label: 'Формат', value: 'Удалённо' },
    { label: 'Занятость', value: 'Полная' },
    { label: 'Опыт', value: '5 лет' },
    { label: 'Образование', value: 'БГУИР, электронный маркетинг' },
  ],
  goals: [
    'Продукт, который живёт и меняется — не конвейер однотипных страниц',
    'Задачи, где надо подумать: архитектура, перф, легаси без цирка',
    'Стек вокруг TypeScript: Vue/React, Node, нормальный CI',
  ],
  about: [
    'Основной стек — TypeScript, JavaScript, Vue 3, Vite, PostCSS, Node.js. Делал интерфейсы авторизации, модернизацию legacy, совместимость со старыми браузерами. Продукт с моим фронтом — в Реестре российского ПО и с сертификацией ФСТЭК.',
    'React осваиваю руками: перенос с Vue, хуки, стейт. Не прикидываюсь «сеньором React с пятью годами» — зато переход для меня рабочая задача, не курс на выходных.',
    'AI-агентов предпочитаю рутине: проектирую, ставлю рамки, отвечаю за результат. Ищу удалёнку на продукт, где есть что решить головой.',
  ],
};
