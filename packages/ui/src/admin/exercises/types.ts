import { ExerciseApprovalStatus } from '@giulio-leone/types/database';

export interface AdminMuscle {
  id: string;
  name: string;
  slug?: string;
  role?: 'PRIMARY' | 'SECONDARY';
}

export interface AdminTranslation {
  locale: string;
  name: string;
  description?: string;
}

export interface AdminExercise {
  id: string;
  name: string;
  slug?: string;
  approvalStatus: ExerciseApprovalStatus | string;
  muscles?: AdminMuscle[];
  bodyParts?: { id: string; name?: string; slug?: string }[];
  equipments?: { id: string; name?: string }[];
  equipment?: { id: string; name?: string; slug?: string }[];
  translations?: AdminTranslation[];
  gifUrl?: string | null;
  thumbnailUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  keywords?: string[] | string;
  overview?: string | null;
  translation?: { name?: string; slug?: string } | null;
  instructions?: string[] | null;
  exerciseTips?: string[] | null;
  variations?: { id: string; name?: string }[] | null;
  related?: { id: string; name?: string }[] | null;
  metadata?: {
    isUserGenerated?: boolean;
    autoApprove?: boolean;
  };
  exerciseTypeId?: string;
  version?: string | null;
  createdAt?: string | Date;
}
