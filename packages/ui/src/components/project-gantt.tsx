'use client';

import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@onecoach/lib-design-system';

export interface ProjectTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies?: string[];
}

export interface Project {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  tasks: ProjectTask[];
}

export function ProjectGantt({ project, className }: { project: Project; className?: string }) {
  const startDate = startOfWeek(project.startDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(project.endDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const totalDays = days.length;

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          {project.title} - Gantt
        </h3>
      </div>

      <div className="relative min-w-[800px]">
        {/* Header Days */}
        <div className="grid auto-cols-fr grid-flow-col border-b border-neutral-200 pb-2 dark:border-neutral-800">
          {days.map((day: any) => (
            <div
              key={day.toString()}
              className="flex flex-col items-center justify-center text-xs text-neutral-500"
            >
              <span className="font-bold">{format(day, 'd', { locale: it })}</span>
              <span>{format(day, 'EE', { locale: it })}</span>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div className="mt-4 space-y-3">
          {project.tasks.map((task: any) => {
            const startOffset = differenceInDays(task.startDate, startDate);
            const duration = differenceInDays(task.endDate, task.startDate) + 1;

            const leftPercent = (startOffset / totalDays) * 100;
            const widthPercent = (duration / totalDays) * 100;

            return (
              <div key={task.id} className="relative h-8 w-full">
                <div
                  className="absolute top-0 h-8 rounded-md bg-sky-500/20 dark:bg-sky-500/30"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                >
                  <div
                    className="h-full rounded-md bg-sky-500"
                    style={{ width: `${task.progress}%` }}
                  />
                  <span
                    className="absolute top-1/2 left-2 -translate-y-1/2 truncate text-xs font-medium whitespace-nowrap text-sky-900 dark:text-sky-100"
                    style={{ maxWidth: '100%' }}
                  >
                    {task.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
