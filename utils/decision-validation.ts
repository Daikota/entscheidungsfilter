import { CriterionWeight, RatingScore } from '@/types/decision';

export const normalizeComparableName = (value: string) => value.trim().toLocaleLowerCase();

export const hasDuplicateName = (
  nextName: string,
  existingNames: string[],
  ignoredName?: string
) => {
  const normalizedNextName = normalizeComparableName(nextName);
  const normalizedIgnoredName =
    ignoredName === undefined ? undefined : normalizeComparableName(ignoredName);

  return existingNames.some((existingName) => {
    const normalizedExistingName = normalizeComparableName(existingName);

    return (
      normalizedExistingName === normalizedNextName &&
      normalizedExistingName !== normalizedIgnoredName
    );
  });
};

export const hasDuplicateNameInList = (names: string[]) =>
  names.some((name, index) =>
    names.some(
      (comparisonName, comparisonIndex) =>
        comparisonIndex !== index &&
        normalizeComparableName(comparisonName) === normalizeComparableName(name)
    )
  );

export const isCriterionWeight = (value: number): value is CriterionWeight =>
  value === 1 || value === 2 || value === 3;

export const isRatingScore = (value: number): value is RatingScore =>
  value === 1 || value === 2 || value === 3 || value === 4 || value === 5;

export const canStartRating = (optionCount: number, criterionCount: number) =>
  optionCount >= 2 && criterionCount >= 1;
