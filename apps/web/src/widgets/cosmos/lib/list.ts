/** Append items and keep only the last `max` entries. */
export function appendCapped<T>(list: T[], items: T[], max: number): T[] {
  if (items.length === 0) {
    return list;
  }

  const next = list.length === 0 ? items.slice() : list.concat(items);

  return next.length > max ? next.slice(-max) : next;
}
