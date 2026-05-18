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

export type Decision = {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  criteria: DecisionCriterion[];
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
