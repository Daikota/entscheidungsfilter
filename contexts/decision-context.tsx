import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

import {
  deleteCriterionFromDatabase,
  deleteOptionFromDatabase,
  insertCriterion,
  insertDecision,
  insertDecisionWithDetails,
  insertOption,
  loadDecisionsFromDatabase,
  upsertRating,
} from '@/database/decision-repository';
import {
  CreateDecisionCriterionInput,
  CreateDecisionInput,
  CreateDecisionOptionInput,
  CreateDecisionWithDetailsInput,
  Decision,
  DecisionCriterion,
  DecisionOption,
  SetDecisionRatingInput,
} from '@/types/decision';

type DecisionContextValue = {
  decisions: Decision[];
  databaseError: string;
  isDatabaseReady: boolean;
  addDecision: (input: CreateDecisionInput) => Promise<Decision>;
  addDecisionWithDetails: (input: CreateDecisionWithDetailsInput) => Promise<Decision>;
  addOption: (input: CreateDecisionOptionInput) => Promise<DecisionOption>;
  deleteOption: (decisionId: string, optionId: string) => Promise<void>;
  addCriterion: (input: CreateDecisionCriterionInput) => Promise<DecisionCriterion>;
  deleteCriterion: (decisionId: string, criterionId: string) => Promise<void>;
  setRating: (input: SetDecisionRatingInput) => Promise<void>;
};

const DecisionContext = createContext<DecisionContextValue | null>(null);

const createDecisionId = () => `decision-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const createChildId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function DecisionProvider({ children }: PropsWithChildren) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadPersistedDecisions() {
      try {
        const persistedDecisions = await loadDecisionsFromDatabase();

        if (isMounted) {
          setDecisions(persistedDecisions);
          setDatabaseError('');
        }
      } catch (error) {
        console.error('Failed to load decisions from SQLite', error);

        if (isMounted) {
          setDatabaseError('Daten konnten nicht geladen werden.');
        }
      } finally {
        if (isMounted) {
          setIsDatabaseReady(true);
        }
      }
    }

    loadPersistedDecisions();

    return () => {
      isMounted = false;
    };
  }, []);

  const addDecision = useCallback(async (input: CreateDecisionInput) => {
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

    await insertDecision(decision);
    setDecisions((currentDecisions) => [decision, ...currentDecisions]);
    return decision;
  }, []);

  const addDecisionWithDetails = useCallback(async (input: CreateDecisionWithDetailsInput) => {
    const now = new Date().toISOString();
    const decision: Decision = {
      id: createDecisionId(),
      title: input.title,
      description: input.description,
      options: input.options.map((option) => ({
        id: createChildId('option'),
        name: option.name,
        note: option.note,
        createdAt: now,
      })),
      criteria: input.criteria.map((criterion) => ({
        id: createChildId('criterion'),
        name: criterion.name,
        weight: criterion.weight,
        createdAt: now,
      })),
      ratings: [],
      createdAt: now,
      updatedAt: now,
    };

    await insertDecisionWithDetails(decision);
    setDecisions((currentDecisions) => [decision, ...currentDecisions]);
    return decision;
  }, []);

  const addOption = useCallback(async (input: CreateDecisionOptionInput) => {
    const now = new Date().toISOString();
    const option: DecisionOption = {
      id: createChildId('option'),
      name: input.name,
      note: input.note,
      createdAt: now,
    };

    await insertOption(input.decisionId, option, now);
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

  const deleteOption = useCallback(async (decisionId: string, optionId: string) => {
    const now = new Date().toISOString();

    await deleteOptionFromDatabase(decisionId, optionId, now);
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

  const addCriterion = useCallback(async (input: CreateDecisionCriterionInput) => {
    const now = new Date().toISOString();
    const criterion: DecisionCriterion = {
      id: createChildId('criterion'),
      name: input.name,
      weight: input.weight,
      createdAt: now,
    };

    await insertCriterion(input.decisionId, criterion, now);
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

  const deleteCriterion = useCallback(async (decisionId: string, criterionId: string) => {
    const now = new Date().toISOString();

    await deleteCriterionFromDatabase(decisionId, criterionId, now);
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

  const setRating = useCallback(async (input: SetDecisionRatingInput) => {
    const now = new Date().toISOString();
    const currentDecision = decisions.find((decision) => decision.id === input.decisionId);
    const existingRating = currentDecision?.ratings.find(
      (rating) => rating.optionId === input.optionId && rating.criterionId === input.criterionId
    );
    const nextRating = {
      id: existingRating?.id ?? createChildId('rating'),
      decisionId: input.decisionId,
      optionId: input.optionId,
      criterionId: input.criterionId,
      score: input.score,
      createdAt: existingRating?.createdAt ?? now,
      updatedAt: now,
    };

    await upsertRating(nextRating);
    setDecisions((currentDecisions) =>
      currentDecisions.map((decision) => {
        if (decision.id !== input.decisionId) {
          return decision;
        }

        const existingRatingIndex = decision.ratings.findIndex(
          (rating) =>
            rating.optionId === input.optionId && rating.criterionId === input.criterionId
        );
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
  }, [decisions]);

  return (
    <DecisionContext.Provider
      value={{
        decisions,
        databaseError,
        isDatabaseReady,
        addDecision,
        addDecisionWithDetails,
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
