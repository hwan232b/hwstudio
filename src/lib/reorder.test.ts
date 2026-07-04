import { describe, expect, it } from "vitest";
import { moveItemById, normalizeDisplayOrder } from "./reorder";

type Item = { id: string; displayOrder: number; label: string };

describe("reorder helpers", () => {
  it("moves an item up and normalizes display order", () => {
    const items: Item[] = [
      { id: "a", displayOrder: 1, label: "A" },
      { id: "b", displayOrder: 2, label: "B" },
      { id: "c", displayOrder: 3, label: "C" }
    ];

    expect(moveItemById(items, "c", "up")).toEqual([
      { id: "a", displayOrder: 1, label: "A" },
      { id: "c", displayOrder: 2, label: "C" },
      { id: "b", displayOrder: 3, label: "B" }
    ]);
  });

  it("moves an item down and keeps boundary moves stable", () => {
    const items: Item[] = [
      { id: "a", displayOrder: 1, label: "A" },
      { id: "b", displayOrder: 2, label: "B" }
    ];

    expect(moveItemById(items, "a", "down")).toEqual([
      { id: "b", displayOrder: 1, label: "B" },
      { id: "a", displayOrder: 2, label: "A" }
    ]);
    expect(moveItemById(items, "a", "up")).toEqual(items);
  });

  it("returns normalized items when the id is unknown", () => {
    const items: Item[] = [
      { id: "b", displayOrder: 20, label: "B" },
      { id: "a", displayOrder: 10, label: "A" }
    ];

    expect(moveItemById(items, "missing", "up")).toEqual([
      { id: "a", displayOrder: 1, label: "A" },
      { id: "b", displayOrder: 2, label: "B" }
    ]);
  });

  it("does not mutate the original input array", () => {
    const items: Item[] = [
      { id: "a", displayOrder: 1, label: "A" },
      { id: "b", displayOrder: 2, label: "B" }
    ];

    moveItemById(items, "a", "down");

    expect(items).toEqual([
      { id: "a", displayOrder: 1, label: "A" },
      { id: "b", displayOrder: 2, label: "B" }
    ]);
  });

  it("normalizes arbitrary display order values", () => {
    const items: Item[] = [
      { id: "b", displayOrder: 20, label: "B" },
      { id: "a", displayOrder: 10, label: "A" }
    ];

    expect(normalizeDisplayOrder(items)).toEqual([
      { id: "a", displayOrder: 1, label: "A" },
      { id: "b", displayOrder: 2, label: "B" }
    ]);
  });
});
