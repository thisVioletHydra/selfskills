type AmbientGateInput = {
  frozen: boolean;
  inView: boolean;
  pageVisible: boolean;
};

/**
 * Функция решает, можно ли сейчас гонять ambient (haze / comets и т.п.).
 * Спавн имеет смысл только когда сцена живая, блок в кадре и вкладка на экране —
 * иначе жрём таймеры и батарею впустую.
 *
 * @param frozen — сцена заморожена (пауза / reduced motion)
 * @param inView — секция космоса видна во вьюпорте
 * @param pageVisible — вкладка документа видима
 */
export function canRunAmbient({ frozen, inView, pageVisible }: AmbientGateInput) {
  return !frozen && inView && pageVisible;
}
