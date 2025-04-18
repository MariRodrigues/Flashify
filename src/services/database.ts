import * as SQLite from 'expo-sqlite';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface CategoryWithCount extends Category {
  flashcardCount: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  categoryId: string;
  createdAt: string;
}

let db: SQLite.SQLiteDatabase | null = null;

export const openDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('flashify.db');
  }
  return db;
};

export const initDatabase = async () => {
  const db = await openDb();

  // Primeiro cria as tabelas se não existirem
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deck_id TEXT
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      category_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS study_feedback (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL,
      flashcard_id TEXT NOT NULL,
      feedback TEXT NOT NULL,
      answered_at TEXT NOT NULL,
      next_review TEXT NOT NULL,
      FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // Depois verifica se precisa adicionar a coluna deck_id
  const tableInfo = await db.getAllAsync('PRAGMA table_info(categories)');
  const hasDeckIdColumn = tableInfo.some((column: any) => column.name === 'deck_id');

  if (!hasDeckIdColumn) {
    await db.runAsync('ALTER TABLE categories ADD COLUMN deck_id TEXT');
  }

  console.log('✅ Tabelas criadas com sucesso!');
};

export const createCategory = async (name: string, deckId: string | null = null): Promise<Category> => {
  const db = await openDb();
  const id = Math.random().toString(36).substring(2, 15);
  const now = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO categories (id, name, created_at, deck_id) VALUES (?, ?, ?, ?)',
    [id, name, now, deckId || null]
  );

  return {
    id,
    name,
    createdAt: now,
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

export const getCategories = async (): Promise<CategoryWithCount[]> => {
  const db = await openDb();
  const result = await db.getAllAsync<any>(`
    SELECT 
      c.id,
      c.name,
      c.created_at as createdAt,
      COUNT(f.id) as flashcardCount
    FROM categories c
    LEFT JOIN flashcards f ON f.category_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
  return result;
};

export const getFlashcardsByCategory = async (categoryId: string): Promise<Flashcard[]> => {
  const db = await openDb();
  const result = await db.getAllAsync<Flashcard>(`
    SELECT * FROM flashcards WHERE category_id = ?
  `, [categoryId]);
  return result;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const db = await openDb();
  await db.runAsync(
    'DELETE FROM categories WHERE id = ?',
    [categoryId]
  );
};

interface CountResult {
  count: number;
}

export async function isSectionDownloaded(deckId: string, sectionTitle: string): Promise<boolean> {
  const db = await openDb();
  const result = await db.getAllAsync<CountResult>(
    'SELECT COUNT(*) as count FROM categories WHERE deck_id = ? AND name LIKE ?',
    [deckId, `%${sectionTitle}%`]
  );
  return result[0].count > 0;
}

export async function saveDeckSection(deckId: string, deckTitle: string, section: { title: string, csvUrl: string }) {
  const db = await openDb();
  try {
    // Baixa o CSV
    const response = await fetch(section.csvUrl);
    const csvText = await response.text();
    
    // Parse do CSV
    const cards = parseCSV(csvText);
    
    // Salva a categoria
    const now = new Date().toISOString();
    const categoryId = Math.random().toString(36).substring(2, 15);
    
    await db.runAsync(
      'INSERT INTO categories (id, name, created_at, deck_id) VALUES (?, ?, ?, ?)',
      [categoryId, deckTitle + ' - ' + section.title, now, deckId]
    );
    
    // Salva os flashcards
    for (const card of cards) {
      await db.runAsync(
        'INSERT INTO flashcards (id, front, back, category_id, created_at) VALUES (?, ?, ?, ?, ?)',
        [Math.random().toString(36).substring(2, 15), card.front, card.back, categoryId, now]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar seção:', error);
    throw error;
  }
}

function parseCSV(csvText: string) {
  const lines = csvText.split('\n');
  const cards = [];
  
  for (let i = 1; i < lines.length; i++) { // Começa do 1 para pular o cabeçalho
    const line = lines[i].trim();
    if (line) {
      const [front, back] = line.split(',').map(text => text.trim().replace(/(^"|"$)/g, ''));
      if (front && back) {
        cards.push({ front, back });
      }
    }
  }
  
  return cards;
}
