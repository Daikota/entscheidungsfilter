import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

import {
  deleteAllAppDataFromDatabase,
  deleteCriterionFromDatabase,
  deleteDecisionFromDatabase,
  deleteOptionFromDatabase,
  insertCriterion,
  insertDecision,
  insertDecisionWithDetails,
  insertOption,
  loadDecisionsFromDatabase,
  updateCriterionInDatabase,
  updateDecisionInDatabase,
  updateOptionInDatabase,
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
  UpdateDecisionCriterionInput,
  UpdateDecisionInput,
  UpdateDecisionOptionInput,
} from '@/types/decision';
import {
  hasDuplicateName,
  hasDuplicateNameInList,
  isCriterionWeight,
  isRatingScore,
} from '@/utils/decision-validation';

type DecisionContextValue = {
  decisions: Decision[];
  databaseError: string;
  isDatabaseReady: boolean;
  addDecision: (input: CreateDecisionInput) => Promise<Decision>;
  addDecisionWithDetails: (input: CreateDecisionWithDetailsInput) => Promise<Decision>;
  updateDecision: (input: UpdateDecisionInput) => Promise<void>;
  deleteDecision: (decisionId: string) => Promise<void>;
  deleteAllData: () => Promise<void>;
  addOption: (input: CreateDecisionOptionInput) => Promise<DecisionOption>;
  updateOption: (input: UpdateDecisionOptionInput) => Promise<void>;
  deleteOption: (decisionId: string, optionId: string) => Promise<void>;
  addCriterion: (input: CreateDecisionCriterionInput) => Promise<DecisionCriterion>;
  updateCriterion: (input: UpdateDecisionCriterionInput) => Promise<void>;
  deleteCriterion: (decisionId: string, criterionId: string) => Promise<void>;
  setRating: (input: SetDecisionRatingInput) => Promise<void>;
};

const DecisionContext = createContext<DecisionContextValue | null>(null);

const createDecisionId = () => `decision-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const createChildId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const assertNonEmptyName = (value: string, message: string) => {
  if (value.trim().length === 0) {
    throw new Error(message);
  }
};

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
    assertNonEmptyName(input.title, 'Decision title is required');

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
    assertNonEmptyName(input.title, 'Decision title is required');

    const optionNames = input.options.map((option) => option.name);
    const criterionNames = input.criteria.map((criterion) => criterion.name);

    for (const option of input.options) {
      assertNonEmptyName(option.name, 'Option name is required');
    }

    if (hasDuplicateNameInList(optionNames)) {
      throw new Error('Duplicate option name');
    }

    for (const criterion of input.criteria) {
      assertNonEmptyName(criterion.name, 'Criterion name is required');

      if (!isCriterionWeight(criterion.weight)) {
        throw new Error('Invalid criterion weight');
      }
    }

    if (hasDuplicateNameInList(criterionNames)) {
      throw new Error('Duplicate criterion name');
    }

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
    assertNonEmptyName(input.name, 'Option name is required');

    const now = new Date().toISOString();
    const currentDecision = decisions.find((decision) => decision.id === input.decisionId);

    if (
      currentDecision !== undefined &&
      hasDuplicateName(input.name, currentDecision.options.map((option) => option.name))
    ) {
      throw new Error('Duplicate option name');
    }

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
  }, [decisions]);

  const updateDecision = useCallback(async (input: UpdateDecisionInput) => {
    assertNonEmptyName(input.title, 'Decision title is required');

    const now = new Date().toISOString();

    await updateDecisionInDatabase(input.decisionId, input.title, input.description, now);
    setDecisions((currentDecisions) =>
      currentDecisions.map((decision) =>
        decision.id === input.decisionId
          ? {
              ...decision,
              title: input.title,
              description: input.description,
              updatedAt: now,
            }
          : decision
      )
    );
  }, []);

  const deleteDecision = useCallback(async (decisionId: string) => {
    await deleteDecisionFromDatabase(decisionId);
    setDecisions((currentDecisions) =>
      currentDecisions.filter((decision) => decision.id !== decisionId)
    );
  }, []);

  const deleteAllData = useCallback(async () => {
    await deleteAllAppDataFromDatabase();
    setDecisions([]);
  }, []);

  const updateOption = useCallback(async (input: UpdateDecisionOptionInput) => {
    assertNonEmptyName(input.name, 'Option name is required');

    const now = new Date().toISOString();
    const currentDecision = decisions.find((decision) => decision.id === input.decisionId);
    const currentOption = currentDecision?.options.find((option) => option.id === input.optionId);

    if (
      currentDecision !== undefined &&
      hasDuplicateName(
        input.name,
        currentDecision.options.map((option) => option.name),
        currentOption?.name
      )
    ) {
      throw new Error('Duplicate option name');
    }

    await updateOptionInDatabase(input.decisionId, input.optionId, input.name, input.note, now);
    setDecisions((currentDecisions) =>
      currentDecisions.map((decision) =>
        decision.id === input.decisionId
          ? {
              ...decision,
              options: decision.options.map((option) =>
                option.id === input.optionId
                  ? {
                      ...option,
                      name: input.name,
                      note: input.note,
                    }
                  : option
              ),
              updatedAt: now,
            }
          : decision
      )
    );
  }, [decisions]);

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
    assertNonEmptyName(input.name, 'Criterion name is required');

    if (!isCriterionWeight(input.weight)) {
      throw new Error('Invalid criterion weight');
    }

    const now = new Date().toISOString();
    const currentDecision = decisions.find((decision) => decision.id === input.decisionId);

    if (
      currentDecision !== undefined &&
      hasDuplicateName(input.name, currentDecision.criteria.map((criterion) => criterion.name))
    ) {
      throw new Error('Duplicate criterion name');
    }

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
  }, [decisions]);

  const updateCriterion = useCallback(async (input: UpdateDecisionCriterionInput) => {
    assertNonEmptyName(input.name, 'Criterion name is required');

    if (!isCriterionWeight(input.weight)) {
      throw new Error('Invalid criterion weight');
    }

    const now = new Date().toISOString();
    const currentDecision = decisions.find((decision) => decision.id === input.decisionId);
    const currentCriterion = currentDecision?.criteria.find(
      (criterion) => criterion.id === input.criterionId
    );

    if (
      currentDecision !== undefined &&
      hasDuplicateName(
        input.name,
        currentDecision.criteria.map((criterion) => criterion.name),
        currentCriterion?.name
      )
    ) {
      throw new Error('Duplicate criterion name');
    }

    await updateCriterionInDatabase(
      input.decisionId,
      input.criterionId,
      input.name,
      input.weight,
      now
    );
    setDecisions((currentDecisions) =>
      currentDecisions.map((decision) =>
        decision.id === input.decisionId
          ? {
              ...decision,
              criteria: decision.criteria.map((criterion) =>
                criterion.id === input.criterionId
                  ? {
                      ...criterion,
                      name: input.name,
                      weight: input.weight,
                    }
                  : criterion
              ),
              updatedAt: now,
            }
          : decision
      )
    );
  }, [decisions]);

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
    if (!isRatingScore(input.score)) {
      throw new Error('Invalid rating score');
    }

    const now = new Date().toISOString();
    const currentDecision = decisions.find((decision) => decision.id === input.decisionId);

    if (currentDecision === undefined) {
      throw new Error('Decision not found');
    }

    const hasOption = currentDecision.options.some((option) => option.id === input.optionId);
    const hasCriterion = currentDecision.criteria.some(
      (criterion) => criterion.id === input.criterionId
    );

    if (!hasOption || !hasCriterion) {
      throw new Error('Rating target not found');
    }

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
        updateDecision,
        deleteDecision,
        deleteAllData,
        addOption,
        updateOption,
        deleteOption,
        addCriterion,
        updateCriterion,
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
