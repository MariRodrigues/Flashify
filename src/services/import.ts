import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { createCategory, createFlashcards } from './database';
import { Flashcard } from '../types';

interface ImportResult {
  success: boolean;
  flashcardsCount?: number;
  error?: string;
  flashcardsImported?: number;
}

type CSVRow = [string, string]; // [front, back]

export const importCSV = async (fileUri: string, categoryName: string): Promise<ImportResult> => {
  try {
    console.log('inicializando a importacao')
    // Read file content
    const fileContent = await FileSystem.readAsStringAsync(fileUri);

    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(fileContent, {
      header: false,
      skipEmptyLines: true
    });

    if (parseResult.errors.length > 0) {
      return {
        success: false,
        error: 'Erro ao processar o arquivo CSV: ' + parseResult.errors[0].message
      };
    }

    console.log('inicializando a importacao')
    // Validate CSV structure
    const invalidRows = parseResult.data.filter(row => !Array.isArray(row) || row.length !== 2);
    if (invalidRows.length > 0) {
      return {
        success: false,
        error: 'O arquivo CSV deve conter exatamente 2 colunas (frente e verso) em cada linha'
      };
    }

    // Create category
    console.log('hora de criar a categoria')
    const category = await createCategory(categoryName);
    console.log('Category created:', category);

    // Prepare flashcards
    const flashcards: Omit<Flashcard, 'id'>[] = parseResult.data.map(row => ({
      front: row[0],
      back: row[1],
      categoryId: category.id
    }));

    // Save flashcards
    await createFlashcards(flashcards);

    return {
      success: true,
      flashcardsCount: flashcards.length,
      flashcardsImported: flashcards.length
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao importar arquivo: ' + (error instanceof Error ? error.message : String(error))
    };
  }
};
