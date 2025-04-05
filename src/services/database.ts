import * as SQLite from 'expo-sqlite';
import { Category, Flashcard } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export const openDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('flashify.db');
  }
  return db;
};

export const initDatabase = async (): Promise<void> => {
  const db = await openDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      category_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

  console.log('Tabelas criadas com sucesso!');
};

export const createCategory = async (name: string): Promise<Category> => {
  const db = await openDb();
  const id = Math.random().toString(36).substring(2, 15);
  const now = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO categories (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
    [id, name, now, now]
  );

  return {
    id,
    name,
  };
};

export const createFlashcards = async (flashcards: Omit<Flashcard, 'id'>[]): Promise<void> => {
  const db = await openDb();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (const flashcard of flashcards) {
      const id = Math.random().toString(36).substring(2, 15);
      await db.runAsync(
        'INSERT INTO flashcards (id, front, back, category_id, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, flashcard.front, flashcard.back, flashcard.categoryId, now]
      );
    }
  });
};

export type CategoryWithCount = Category & {
  flashcardCount: number;
};

export const getCategories = async (): Promise<CategoryWithCount[]> => {
  const db = await openDb();
  const result = await db.getAllAsync<any>(`
    SELECT 
      c.*,
      COUNT(f.id) as flashcard_count
    FROM categories c
    LEFT JOIN flashcards f ON f.category_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);

  return result.map(row => ({
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    flashcardCount: row.flashcard_count
  }));
};

export const getFlashcardsByCategory = async (categoryId: string): Promise<Flashcard[]> => {
  const db = await openDb();
  const result = await db.getAllAsync<any>(
    'SELECT * FROM flashcards WHERE category_id = ? ORDER BY created_at',
    [categoryId]
  );

  return result.map(row => ({
    id: row.id,
    front: row.front,
    back: row.back,
    categoryId: row.category_id,
    createdAt: new Date(row.created_at)
  }));
};
