'use client';

import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@giulio-leone/lib-design-system';

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

export function ProjectGantt({
  project,
  className,
  wholeProjectLabel = 'Whole Project',
  locale = it,
}: {
  project: Project;
  className?: string;
  wholeProjectLabel?: string;
  locale?: any;
}) {
  const startDate = startOfWeek(new Date(project.startDate), { weekStartsOn: 1 });
  const endDate = endOfWeek(new Date(project.endDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const totalDays = days.length;
  const dayWidth = 40; // Fixed width for each day in pixels

  return (
    <div
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-2xl',
        'bg-white/80 dark:bg-neutral-900/80',
        'border border-neutral-200/50 dark:border-neutral-800/50',
        'shadow-sm dark:shadow-lg dark:shadow-black/20',
        'backdrop-blur-sm',
        className
      )}
    >
      <div className="border-b border-neutral-200/50 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800/50 dark:bg-neutral-800/30">
        <h3 className="font-bold text-neutral-900 dark:text-white">{project.title}</h3>
      </div>

      <div className="no-scrollbar relative flex-1 overflow-x-auto p-6">
        <div style={{ width: totalDays * dayWidth }}>
          {/* Header Days */}
          <div className="mb-6 flex border-b border-neutral-200/30 pb-3 dark:border-neutral-700/30">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                style={{ width: dayWidth }}
                className="flex shrink-0 flex-col items-center justify-center text-center"
              >
                <span className="text-[10px] font-black text-neutral-600 dark:text-neutral-300">
                  {format(day, 'd')}
                </span>
                <span className="text-[8px] font-bold text-neutral-400 uppercase dark:text-neutral-500">
                  {format(day, 'EEE', { locale })}
                </span>
              </div>
            ))}
          </div>

          {/* Grid Background */}
          <div className="relative">
            <div className="absolute inset-0 flex">
              {days.map((day) => (
                <div
                  key={`grid-${day.toISOString()}`}
                  style={{ width: dayWidth }}
                  className="h-full border-r border-neutral-100/50 dark:border-neutral-800/20"
                />
              ))}
            </div>

            {/* Bars */}
            <div className="relative space-y-4 py-2">
              {/* Show project bar if no tasks, or always show project duration as a background bar */}
              {project.tasks.length === 0 ? (
                <div className="group flex h-8 items-center">
                  <div
                    className="absolute flex h-7 items-center rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 px-4 backdrop-blur-sm"
                    style={{
                      left: 0,
                      width: '100%',
                    }}
                  >
                    <span className="truncate text-[10px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                      {wholeProjectLabel}
                    </span>
                  </div>
                </div>
              ) : (
                project.tasks.map((task) => {
                  const taskStart = new Date(task.startDate);
                  const taskEnd = new Date(task.endDate);

                  const startOffset = differenceInDays(taskStart, startDate);
                  const duration = differenceInDays(taskEnd, taskStart) + 1;

                  const left = startOffset * dayWidth;
                  const width = duration * dayWidth;

                  return (
                    <div key={task.id} className="group relative h-8">
                      <div
                        className="absolute top-0.5 bottom-0.5 flex items-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 shadow-lg shadow-blue-500/30 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-blue-500/40"
                        style={{
                          left,
                          width,
                        }}
                      >
                        {task.progress > 0 && (
                          <div
                            className="absolute inset-0 rounded-l-xl bg-white/20"
                            style={{ width: `${task.progress}%` }}
                          />
                        )}
                        <span className="relative z-10 truncate text-[10px] font-black whitespace-nowrap text-white uppercase drop-shadow-sm">
                          {task.title}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
