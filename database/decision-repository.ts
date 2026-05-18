import {
  CriterionWeight,
  Decision,
  DecisionCriterion,
  DecisionOption,
  DecisionRating,
  RatingScore,
} from '@/types/decision';
import { isCriterionWeight, isRatingScore } from '@/utils/decision-validation';

import { getDatabase } from './database';

type DecisionRow = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type OptionRow = {
  id: string;
  decision_id: string;
  name: string;
  note: string;
  created_at: string;
  updated_at: string;
};

type CriterionRow = {
  id: string;
  decision_id: string;
  name: string;
  weight: number;
  created_at: string;
  updated_at: string;
};

type RatingRow = {
  id: string;
  decision_id: string;
  option_id: string;
  criterion_id: string;
  value: number;
  created_at: string;
  updated_at: string;
};

export async function loadDecisionsFromDatabase() {
  const db = await getDatabase();
  const decisionRows = await db.getAllAsync<DecisionRow>(
    'SELECT * FROM decisions ORDER BY created_at DESC'
  );
  const optionRows = await db.getAllAsync<OptionRow>('SELECT * FROM options ORDER BY created_at ASC');
  const criterionRows = await db.getAllAsync<CriterionRow>(
    'SELECT * FROM criteria ORDER BY created_at ASC'
  );
  const ratingRows = await db.getAllAsync<RatingRow>('SELECT * FROM ratings ORDER BY created_at ASC');

  return decisionRows.map<Decision>((decisionRow) => {
    const options = optionRows
      .filter((optionRow) => optionRow.decision_id === decisionRow.id)
      .map<DecisionOption>((optionRow) => ({
        id: optionRow.id,
        name: optionRow.name,
        note: optionRow.note,
        createdAt: optionRow.created_at,
      }));

    const criteria = criterionRows
      .filter((criterionRow) => criterionRow.decision_id === decisionRow.id)
      .map<DecisionCriterion>((criterionRow) => ({
        id: criterionRow.id,
        name: criterionRow.name,
        weight: isCriterionWeight(criterionRow.weight) ? criterionRow.weight : 1,
        createdAt: criterionRow.created_at,
      }));

    const ratings = ratingRows
      .filter((ratingRow) => ratingRow.decision_id === decisionRow.id)
      .map<DecisionRating>((ratingRow) => ({
        id: ratingRow.id,
        decisionId: ratingRow.decision_id,
        optionId: ratingRow.option_id,
        criterionId: ratingRow.criterion_id,
        score: isRatingScore(ratingRow.value) ? ratingRow.value : 1,
        createdAt: ratingRow.created_at,
        updatedAt: ratingRow.updated_at,
      }));

    return {
      id: decisionRow.id,
      title: decisionRow.title,
      description: decisionRow.description,
      options,
      criteria,
      ratings,
      createdAt: decisionRow.created_at,
      updatedAt: decisionRow.updated_at,
    };
  });
}

export async function insertDecision(decision: Decision) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO decisions (id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    decision.id,
    decision.title,
    decision.description,
    decision.createdAt,
    decision.updatedAt
  );
}

export async function insertDecisionWithDetails(decision: Decision) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'INSERT INTO decisions (id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      decision.id,
      decision.title,
      decision.description,
      decision.createdAt,
      decision.updatedAt
    );

    for (const option of decision.options) {
      await transaction.runAsync(
        'INSERT INTO options (id, decision_id, name, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        option.id,
        decision.id,
        option.name,
        option.note,
        option.createdAt,
        decision.updatedAt
      );
    }

    for (const criterion of decision.criteria) {
      await transaction.runAsync(
        'INSERT INTO criteria (id, decision_id, name, weight, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        criterion.id,
        decision.id,
        criterion.name,
        criterion.weight,
        criterion.createdAt,
        decision.updatedAt
      );
    }
  });
}

export async function insertOption(decisionId: string, option: DecisionOption, updatedAt: string) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'INSERT INTO options (id, decision_id, name, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      option.id,
      decisionId,
      option.name,
      option.note,
      option.createdAt,
      updatedAt
    );
    await transaction.runAsync('UPDATE decisions SET updated_at = ? WHERE id = ?', updatedAt, decisionId);
  });
}

export async function deleteOptionFromDatabase(decisionId: string, optionId: string, updatedAt: string) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync('DELETE FROM options WHERE id = ? AND decision_id = ?', optionId, decisionId);
    await transaction.runAsync('UPDATE decisions SET updated_at = ? WHERE id = ?', updatedAt, decisionId);
  });
}

export async function updateDecisionInDatabase(
  decisionId: string,
  title: string,
  description: string,
  updatedAt: string
) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE decisions SET title = ?, description = ?, updated_at = ? WHERE id = ?',
    title,
    description,
    updatedAt,
    decisionId
  );
}

export async function deleteDecisionFromDatabase(decisionId: string) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync('DELETE FROM ratings WHERE decision_id = ?', decisionId);
    await transaction.runAsync('DELETE FROM options WHERE decision_id = ?', decisionId);
    await transaction.runAsync('DELETE FROM criteria WHERE decision_id = ?', decisionId);
    await transaction.runAsync('DELETE FROM decisions WHERE id = ?', decisionId);
  });
}

export async function updateOptionInDatabase(
  decisionId: string,
  optionId: string,
  name: string,
  note: string,
  updatedAt: string
) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'UPDATE options SET name = ?, note = ?, updated_at = ? WHERE id = ? AND decision_id = ?',
      name,
      note,
      updatedAt,
      optionId,
      decisionId
    );
    await transaction.runAsync('UPDATE decisions SET updated_at = ? WHERE id = ?', updatedAt, decisionId);
  });
}

export async function insertCriterion(
  decisionId: string,
  criterion: DecisionCriterion,
  updatedAt: string
) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'INSERT INTO criteria (id, decision_id, name, weight, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      criterion.id,
      decisionId,
      criterion.name,
      criterion.weight,
      criterion.createdAt,
      updatedAt
    );
    await transaction.runAsync('UPDATE decisions SET updated_at = ? WHERE id = ?', updatedAt, decisionId);
  });
}

export async function deleteCriterionFromDatabase(
  decisionId: string,
  criterionId: string,
  updatedAt: string
) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'DELETE FROM criteria WHERE id = ? AND decision_id = ?',
      criterionId,
      decisionId
    );
    await transaction.runAsync('UPDATE decisions SET updated_at = ? WHERE id = ?', updatedAt, decisionId);
  });
}

export async function updateCriterionInDatabase(
  decisionId: string,
  criterionId: string,
  name: string,
  weight: CriterionWeight,
  updatedAt: string
) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'UPDATE criteria SET name = ?, weight = ?, updated_at = ? WHERE id = ? AND decision_id = ?',
      name,
      weight,
      updatedAt,
      criterionId,
      decisionId
    );
    await transaction.runAsync('UPDATE decisions SET updated_at = ? WHERE id = ?', updatedAt, decisionId);
  });
}

export async function upsertRating(rating: DecisionRating) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      `INSERT INTO ratings (id, decision_id, option_id, criterion_id, value, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (decision_id, option_id, criterion_id)
       DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      rating.id,
      rating.decisionId,
      rating.optionId,
      rating.criterionId,
      rating.score,
      rating.createdAt,
      rating.updatedAt
    );
    await transaction.runAsync(
      'UPDATE decisions SET updated_at = ? WHERE id = ?',
      rating.updatedAt,
      rating.decisionId
    );
  });
}
