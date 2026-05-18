import { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react';

import {
  CreateDecisionCriterionInput,
  CreateDecisionInput,
  CreateDecisionOptionInput,
  Decision,
  DecisionCriterion,
  DecisionOption,
  SetDecisionRatingInput,
} from '@/types/decision';

type DecisionContextValue = {
  decisions: Decision[];
  addDecision: (input: CreateDecisionInput) => Decision;
  addOption: (input: CreateDecisionOptionInput) => DecisionOption;
  deleteOption: (decisionId: string, optionId: string) => void;
  addCriterion: (input: CreateDecisionCriterionInput) => DecisionCriterion;
  deleteCriterion: (decisionId: string, criterionId: string) => void;
  setRating: (input: SetDecisionRatingInput) => void;
};

const DecisionContext = createContext<DecisionContextValue | null>(null);

const createDecisionId = () => `decision-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const createChildId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function DecisionProvider({ children }: PropsWithChildren) {
  const [decisions, setDecisions] = useState<Decision[]>([]);

  const addDecision = useCallback((input: CreateDecisionInput) => {
    const now = new Date().toISOString();
    const decision: Decision = {
      id: createDecisionId(),
      title: input.title,
      description: input.description,
      options: [],
      criteria: [],
      ratings: [],
      createdAt: now,
      updatedAt: now,
    };

    setDecisions((currentDecisions) => [decision, ...currentDecisions]);
    return decision;
  }, []);

  const addOption = useCallback((input: CreateDecisionOptionInput) => {
    const now = new Date().toISOString();
    const option: DecisionOption = {
      id: createChildId('option'),
      name: input.name,
      note: input.note,
      createdAt: now,
    };

    setDecisions((currentDecisions) =>
      currentDecisions.map((decision) =>
        decision.id === input.decisionId
          ? {
              ...decision,
              options: [...decision.options, option],
              updatedAt: now,
            }
          : decision
      )
    );

    return option;
  }, []);

  const deleteOption = useCallback((decisionId: string, optionId: string) => {
    const now = new Date().toISOString();

    setDecisions((currentDecisions) =>
      currentDecisions.map((decision) =>
        decision.id === decisionId
          ? {
              ...decision,
              options: decision.options.filter((option) => option.id !== optionId),
              ratings: decision.ratings.filter((rating) => rating.optionId !== optionId),
              updatedAt: now,
            }
          : decision
      )
    );
  }, []);

  const addCriterion = useCallback((input: CreateDecisionCriterionInput) => {
    const now = new Date().toISOString();
    const criterion: DecisionCriterion = {
      id: createChildId('criterion'),
      name: input.name,
      weight: input.weight,
      createdAt: now,
    };

    setDecisions((currentDecisions) =>
      currentDecisions.map((decision) =>
        decision.id === input.decisionId
          ? {
              ...decision,
              criteria: [...decision.criteria, criterion],
              updatedAt: now,
            }
          : decision
      )
    );

    return criterion;
  }, []);

  const deleteCriterion = useCallback((decisionId: string, criterionId: string) => {
    const now = new Date().toISOString();

    setDecisions((currentDecisions) =>
      currentDecisions.map((decision) =>
        decision.id === decisionId
          ? {
              ...decision,
              criteria: decision.criteria.filter((criterion) => criterion.id !== criterionId),
              ratings: decision.ratings.filter((rating) => rating.criterionId !== criterionId),
              updatedAt: now,
            }
          : decision
      )
    );
  }, []);

  const setRating = useCallback((input: SetDecisionRatingInput) => {
    const now = new Date().toISOString();

    setDecisions((currentDecisions) =>
      currentDecisions.map((decision) => {
        if (decision.id !== input.decisionId) {
          return decision;
        }

        const existingRatingIndex = decision.ratings.findIndex(
          (rating) =>
            rating.optionId === input.optionId && rating.criterionId === input.criterionId
        );
        const nextRating = {
          optionId: input.optionId,
          criterionId: input.criterionId,
          score: input.score,
        };
        const nextRatings =
          existingRatingIndex === -1
            ? [...decision.ratings, nextRating]
            : decision.ratings.map((rating, index) =>
                index === existingRatingIndex ? nextRating : rating
              );

        return {
          ...decision,
          ratings: nextRatings,
          updatedAt: now,
        };
      })
    );
  }, []);

  return (
    <DecisionContext.Provider
      value={{
        decisions,
        addDecision,
        addOption,
        deleteOption,
        addCriterion,
        deleteCriterion,
        setRating,
      }}>
      {children}
    </DecisionContext.Provider>
  );
}

export function useDecisions() {
  const context = useContext(DecisionContext);

  if (context === null) {
    throw new Error('useDecisions must be used within a DecisionProvider');
  }

  return context;
}
