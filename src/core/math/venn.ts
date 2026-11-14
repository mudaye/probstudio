/**
 * Venn Diagram Region Classification Helper
 * Classifies finite sample space outcomes into mutually disjoint Venn regions.
 */

export interface VennClassification {
  readonly onlyA: readonly string[];
  readonly onlyB: readonly string[];
  readonly bothAB: readonly string[];
  readonly neitherAB: readonly string[];
}

export function classifyVennOutcomes(
  allOutcomes: readonly string[],
  eventA: readonly string[],
  eventB: readonly string[]
): VennClassification {
  const setA = new Set(eventA);
  const setB = new Set(eventB);

  const onlyA: string[] = [];
  const onlyB: string[] = [];
  const bothAB: string[] = [];
  const neitherAB: string[] = [];

  for (const outcome of allOutcomes) {
    const inA = setA.has(outcome);
    const inB = setB.has(outcome);

    if (inA && inB) {
      bothAB.push(outcome);
    } else if (inA && !inB) {
      onlyA.push(outcome);
    } else if (!inA && inB) {
      onlyB.push(outcome);
    } else {
      neitherAB.push(outcome);
    }
  }

  return { onlyA, onlyB, bothAB, neitherAB };
}
