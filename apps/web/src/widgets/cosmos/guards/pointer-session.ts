/**
 * Функция проверяет: этот pointer-сеанс наш или чужой.
 * Нужна, чтобы move/up/cancel чужой планеты не лезли в чужой драг
 * и не срывали захват / скорость броска.
 *
 * @param draggingId — id планеты, которую сейчас тащим (или null)
 * @param planetId — id планеты, с которой пришло событие
 */
export function isActivePointerSession(draggingId: string | null, planetId: string) {
  return draggingId === planetId;
}

/**
 * Функция цепляет pointer к элементу до отпускания.
 * Нужна, чтобы драг не обрывался, если палец/курсор уехал за край кнопки.
 *
 * @param target — DOM-элемент планеты
 * @param pointerId — id pointer-события браузера
 */
export function capturePointer(target: HTMLElement, pointerId: number) {
  target.setPointerCapture(pointerId);
}

/**
 * Функция отпускает pointer, если мы его держали.
 * Нужна как парный cleanup к capture: иначе элемент может «залипнуть»
 * и дальше глотать события после up/cancel.
 *
 * @param target — DOM-элемент планеты
 * @param pointerId — id pointer-события браузера
 */
export function releasePointer(target: HTMLElement, pointerId: number) {
  if (target.hasPointerCapture(pointerId)) {
    target.releasePointerCapture(pointerId);
  }
}
