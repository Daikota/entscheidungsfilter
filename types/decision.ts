export type Decision = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateDecisionInput = {
  title: string;
  description: string;
};
