import { ExerciseApprovalStatus } from "@giulio-leone/types/database";

export interface AdminMuscle {
  id: string;
  name: string;
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
  bodyParts?: { id: string; name?: string }[];
  equipments?: { id: string; name?: string }[];
  translations?: AdminTranslation[];
  gifUrl?: string | null;
  thumbnailUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  keywords?: string[] | string;
  metadata?: {
    isUserGenerated?: boolean;
    autoApprove?: boolean;
  };
  exerciseTypeId?: string;
  createdAt?: string | Date;
}
