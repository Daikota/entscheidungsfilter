import { Decision, DecisionResult } from '@/types/decision';

const getResultLabel = (rank: number): DecisionResult['label'] => {
  if (rank === 1) {
    return 'Beste Wahl';
  }

  if (rank === 2) {
    return 'Alternative';
  }

  return 'Niedriger bewertet';
};

export function calculateDecisionResults(decision: Decision): DecisionResult[] {
  const unsortedResults = decision.options.map((option) => {
    const totalScore = decision.criteria.reduce((sum, criterion) => {
      const rating = decision.ratings.find(
        (currentRating) =>
          currentRating.optionId === option.id && currentRating.criterionId === criterion.id
      );

      return sum + (rating?.score ?? 0) * criterion.weight;
    }, 0);

    return {
      optionId: option.id,
      optionName: option.name,
      totalScore,
    };
  });

  return [...unsortedResults]
    .sort((firstResult, secondResult) => secondResult.totalScore - firstResult.totalScore)
    .map((result, index) => {
      const rank = index + 1;

      return {
        ...result,
        rank,
        label: getResultLabel(rank),
      };
    });
}
