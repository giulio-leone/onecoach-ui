'use client';

import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@onecoach/lib-design-system';
import { Card } from '../card';

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
  locale = it
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
    <Card
      variant="glass"
      className={cn(
        'w-full flex flex-col overflow-hidden p-0',
        className
      )}
    >
      <div className="border-b border-neutral-200 bg-white/50 px-6 py-4 dark:border-neutral-800 dark:bg-white/5">
        <h3 className="font-bold text-neutral-900 dark:text-white">
          {project.title}
        </h3>
      </div>

      <div className="relative flex-1 overflow-x-auto p-6 no-scrollbar">
        <div style={{ width: totalDays * dayWidth }}>
          {/* Header Days */}
          <div className="mb-6 flex border-b border-neutral-100 pb-3 dark:border-neutral-800">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                style={{ width: dayWidth }}
                className="flex shrink-0 flex-col items-center justify-center text-center"
              >
                <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400">
                  {format(day, 'd')}
                </span>
                <span className="text-[8px] font-bold uppercase text-neutral-400">
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
                  className="h-full border-r border-neutral-50 dark:border-neutral-800/30" 
                />
              ))}
            </div>

            {/* Bars */}
            <div className="relative space-y-4 py-2">
              {/* Show project bar if no tasks, or always show project duration as a background bar */}
              {project.tasks.length === 0 ? (
                <div className="group flex items-center h-8">
                  <div
                    className="absolute h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center px-3"
                    style={{
                      left: 0,
                      width: '100%',
                    }}
                  >
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate uppercase tracking-widest">
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
                    <div key={task.id} className="relative h-8 group">
                      <div
                        className="absolute top-1 bottom-1 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20 transition-all group-hover:scale-[1.02] flex items-center px-3 overflow-hidden"
                        style={{
                          left,
                          width,
                        }}
                      >
                        {task.progress > 0 && (
                          <div 
                            className="absolute inset-0 bg-white/20"
                            style={{ width: `${task.progress}%` }}
                          />
                        )}
                        <span
                          className="relative z-10 truncate text-[10px] font-black uppercase text-white whitespace-nowrap"
                        >
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
    </Card>
  );
}
