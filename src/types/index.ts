export interface Flashcard {
  id: string;
  front: string;
  back: string;
  categoryId: string;
  lastReviewed?: Date;
  performance?: number; // Percentage of correct answers
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  categoryId: string;
  startTime: Date;
  endTime?: Date;
  correctCount: number;
  incorrectCount: number;
  flashcardsReviewed: string[]; // Array of flashcard IDs
}
