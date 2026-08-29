/**
 * Фабрика защёлки на один вызов.
 * Нужна там, где finish могут дернуть и animationend, и life-таймер:
 * без неё onDone / cancel сработают дважды и сломают список полётов.
 */
export function createOnceLatch() {
  let done = false;

  return {
    /**
     * Уже сработала защёлка или ещё нет.
     */
    get done() {
      return done;
    },
    /**
     * Прогоняет fn ровно один раз; повторные вызовы игнорируются.
     *
     * @param fn — cleanup / onDone, который нельзя вызвать дважды
     */
    run: (fn: () => void) => {
      if (done) {
        return;
      }

      done = true;
      fn();
    },
    /**
     * Сбрасывает защёлку под новый цикл (новый полёт / новый id).
     */
    reset: () => {
      done = false;
    },
  };
}
