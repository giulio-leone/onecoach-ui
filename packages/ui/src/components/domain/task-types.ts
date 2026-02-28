export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subTasks?: Task[];
  dependsOn?: { id: string; title: string; status: string }[];
  dependedOnBy?: { id: string; title: string; status: string }[];
  parentId?: string | null;
  startDate?: string | Date;
  createdAt?: string | Date;
  dueDate?: string | Date;
  milestoneId?: string | null;
  depth?: number;
  progress?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string | Date;
  order: number;
  tasks?: Task[];
  progress?: number;
}
