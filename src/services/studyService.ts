import { openDb, Flashcard } from './database';
import { addDays, parseISO, formatISO } from 'date-fns';

export type FeedbackType = 'acertou' | 'dificuldade' | 'errou';

export const saveFeedback = async (
  categoryId: string,
  flashcardId: string,
  feedback: FeedbackType
) => {
  const db = await openDb();
  const now = new Date();
  const answeredAt = formatISO(now);
  
  let nextReview = answeredAt;
  if (feedback === 'acertou') {
    nextReview = formatISO(addDays(now, 3));
  } else if (feedback === 'dificuldade') {
    nextReview = formatISO(addDays(now, 1));
  }

  await db.runAsync(
    `INSERT INTO study_feedback (id, category_id, flashcard_id, feedback, answered_at, next_review)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      Math.random().toString(36).slice(2),
      categoryId,
      flashcardId,
      feedback,
      answeredAt,
      nextReview
    ]
  );
};

export const getCategoryStats = async (categoryId: string) => {
  const db = await openDb();
  
  // Total de cards na categoria
  const totalCards = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM flashcards WHERE category_id = ?',
    [categoryId]
  );

  // Cards não estudados (sem feedback)
  const notStudied = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM flashcards f 
     WHERE f.category_id = ? 
     AND NOT EXISTS (
       SELECT 1 FROM study_feedback sf 
       WHERE sf.flashcard_id = f.id
     )`,
    [categoryId]
  );

  // Cards pendentes de revisão
  const pendingReview = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT f.id) as count 
     FROM flashcards f 
     INNER JOIN study_feedback sf ON f.id = sf.flashcard_id
     WHERE f.category_id = ?
     AND sf.next_review <= ?
     AND sf.feedback != 'errou'`,
    [categoryId, formatISO(new Date())]
  );

  return {
    totalCards: totalCards?.total || 0,
    notStudied: notStudied?.count || 0,
    pendingReview: pendingReview?.count || 0
  };
};

export const getNextCardsToStudy = async (categoryId: string) : Promise<Flashcard[]> => {
  const db = await openDb();
  const now = formatISO(new Date());

  // Primeiro pega os cards que nunca foram estudados
  const notStudiedCards = await db.getAllAsync<Flashcard>(
    `SELECT f.* FROM flashcards f
     WHERE f.category_id = ?
     AND NOT EXISTS (
       SELECT 1 FROM study_feedback sf 
       WHERE sf.flashcard_id = f.id
     )`,
    [categoryId]
  );

  // Depois pega os cards que precisam de revisão
  const cardsToReview = await db.getAllAsync<Flashcard>(
    `SELECT DISTINCT f.* 
     FROM flashcards f 
     INNER JOIN study_feedback sf ON f.id = sf.flashcard_id
     WHERE f.category_id = ?
     AND sf.next_review <= ?
     AND sf.feedback != 'errou'
     ORDER BY sf.next_review ASC`,
    [categoryId, now]
  );

  // Por fim, pega os cards que foram errados
  const wrongCards = await db.getAllAsync<Flashcard>(
    `SELECT DISTINCT f.* 
     FROM flashcards f 
     INNER JOIN study_feedback sf ON f.id = sf.flashcard_id
     WHERE f.category_id = ?
     AND sf.feedback = 'errou'
     ORDER BY sf.answered_at DESC`,
    [categoryId]
  );

  return [...notStudiedCards, ...cardsToReview, ...wrongCards];
};
