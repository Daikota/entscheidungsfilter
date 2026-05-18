import { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react';

import { CreateDecisionInput, Decision } from '@/types/decision';

type DecisionContextValue = {
  decisions: Decision[];
  addDecision: (input: CreateDecisionInput) => Decision;
};

const DecisionContext = createContext<DecisionContextValue | null>(null);

const createDecisionId = () => `decision-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function DecisionProvider({ children }: PropsWithChildren) {
  const [decisions, setDecisions] = useState<Decision[]>([]);

  const addDecision = useCallback((input: CreateDecisionInput) => {
    const now = new Date().toISOString();
    const decision: Decision = {
      id: createDecisionId(),
      title: input.title,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    };

    setDecisions((currentDecisions) => [decision, ...currentDecisions]);
    return decision;
  }, []);

  return (
    <DecisionContext.Provider value={{ decisions, addDecision }}>
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
