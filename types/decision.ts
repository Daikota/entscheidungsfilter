export type DecisionOption = {
  id: string;
  name: string;
  note: string;
  createdAt: string;
};

export type CriterionWeight = 1 | 2 | 3;

export type DecisionCriterion = {
  id: string;
  name: string;
  weight: CriterionWeight;
  createdAt: string;
};

export type RatingScore = 1 | 2 | 3 | 4 | 5;

export type DecisionRating = {
  optionId: string;
  criterionId: string;
  score: RatingScore;
};

export type DecisionResult = {
  optionId: string;
  optionName: string;
  totalScore: number;
  rank: number;
  label: 'Beste Wahl' | 'Alternative' | 'Niedriger bewertet';
};

export type Decision = {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  criteria: DecisionCriterion[];
  ratings: DecisionRating[];
  createdAt: string;
  updatedAt: string;
};

export type CreateDecisionInput = {
  title: string;
  description: string;
};

export type CreateDecisionOptionInput = {
  decisionId: string;
  name: string;
  note: string;
};

export type CreateDecisionCriterionInput = {
  decisionId: string;
  name: string;
  weight: CriterionWeight;
};

export type SetDecisionRatingInput = {
  decisionId: string;
  optionId: string;
  criterionId: string;
  score: RatingScore;
};
