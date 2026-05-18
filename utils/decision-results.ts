import { Decision, DecisionResult, RatingProgress } from '@/types/decision';

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
    const optionProgress = getOptionRatingProgress(decision, option.id);

    return {
      optionId: option.id,
      optionName: option.name,
      totalScore,
      completedRatings: optionProgress.completed,
      missingRatings: optionProgress.missing,
      isComplete: optionProgress.isComplete,
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

export function hasRatingForPair(decision: Decision, optionId: string, criterionId: string) {
  return decision.ratings.some(
    (rating) => rating.optionId === optionId && rating.criterionId === criterionId
  );
}

export function getDecisionRatingProgress(decision: Decision): RatingProgress {
  const total = decision.options.length * decision.criteria.length;

  if (total === 0) {
    return {
      completed: 0,
      total,
      missing: 0,
      percentage: 0,
      isComplete: false,
    };
  }

  const completed = decision.options.reduce(
    (sum, option) => sum + getOptionRatingProgress(decision, option.id).completed,
    0
  );
  const missing = total - completed;

  return {
    completed,
    total,
    missing,
    percentage: Math.round((completed / total) * 100),
    isComplete: missing === 0,
  };
}

export function getOptionRatingProgress(decision: Decision, optionId: string): RatingProgress {
  const total = decision.criteria.length;

  if (total === 0) {
    return {
      completed: 0,
      total,
      missing: 0,
      percentage: 0,
      isComplete: false,
    };
  }

  const completed = decision.criteria.filter((criterion) =>
    hasRatingForPair(decision, optionId, criterion.id)
  ).length;
  const missing = total - completed;

  return {
    completed,
    total,
    missing,
    percentage: Math.round((completed / total) * 100),
    isComplete: missing === 0,
  };
}
