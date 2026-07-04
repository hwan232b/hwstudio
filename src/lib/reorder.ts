export type OrderedItem = {
  id: string;
  displayOrder: number;
};

export function normalizeDisplayOrder<T extends OrderedItem>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((item, index) => ({ ...item, displayOrder: index + 1 }));
}

export function moveItemById<T extends OrderedItem>(items: T[], itemId: string, direction: "up" | "down"): T[] {
  const ordered = normalizeDisplayOrder(items);
  const currentIndex = ordered.findIndex((item) => item.id === itemId);

  if (currentIndex === -1) {
    return ordered;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= ordered.length) {
    return ordered;
  }

  const next = [...ordered];
  const [item] = next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, item);
  return next.map((nextItem, index) => ({ ...nextItem, displayOrder: index + 1 }));
}
