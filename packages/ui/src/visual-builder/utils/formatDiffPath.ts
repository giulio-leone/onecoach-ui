/**
 * formatDiffPath Utility
 *
 * Transforms raw JSON paths into human-readable change descriptions.
 * Designed for workout and nutrition domain contexts.
 */

export interface FormattedChange {
  /** Category for grouping/icons */
  category: 'exercise' | 'set' | 'week' | 'day' | 'program' | 'meal' | 'food' | 'other';
  /** Emoji icon for visual clarity */
  icon: string;
  /** Human-readable description */
  readable: string;
  /** Value change detail, e.g., "80kg → 85kg" */
  detail?: string;
  /** Original path for debugging */
  path: string;
}

// Category icons
const CATEGORY_ICONS: Record<FormattedChange['category'], string> = {
  exercise: '🏋️',
  set: '🔢',
  week: '📅',
  day: '📆',
  program: '📋',
  meal: '🍽️',
  food: '🥗',
  other: '•',
};

/**
 * Parse array index from path segment like "weeks[0]" -> { name: "weeks", index: 0 }
 */
function parseSegment(segment: string): { name: string; index?: number } {
  const match = segment.match(/^(\w+)\[(\d+)\]$/);
  if (match && match[1] !== undefined && match[2] !== undefined) {
    return { name: match[1], index: parseInt(match[2], 10) };
  }
  return { name: segment };
}

/**
 * Format a property name to be more readable
 */
function formatPropertyName(name: string): string {
  // Common mappings
  const mappings: Record<string, string> = {
    // Workout fields
    setGroups: 'Set Group',
    baseSet: 'Base Set',
    reps: 'Reps',
    weight: 'Weight',
    restSeconds: 'Rest',
    weightLbs: 'Weight (lbs)',
    targetMuscles: 'Target Muscles',
    dayName: 'Day Name',
    weekNumber: 'Week Number',
    durationWeeks: 'Duration',
    // Nutrition fields
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    quantity: 'Quantity',
    unit: 'Unit',
    servingSize: 'Serving Size',
    // Common
    name: 'Name',
    description: 'Description',
    notes: 'Notes',
    focus: 'Focus',
    difficulty: 'Difficulty',
    status: 'Status',
  };

  if (mappings[name]) {
    return mappings[name];
  }

  // Convert camelCase to Title Case
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (value.length > 30) return `"${value.slice(0, 27)}..."`;
    return `"${value}"`;
  }
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === 'object') return '{...}';
  return String(value);
}

/**
 * Transform a JSON path into a human-readable change description
 */
export function formatDiffPath(
  path: string,
  context?: { from?: unknown; to?: unknown }
): FormattedChange {
  const segments = path.split('.');
  const parts: string[] = [];
  let category: FormattedChange['category'] = 'other';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;

    const parsed = parseSegment(segment);
    const { name, index } = parsed;

    switch (name) {
      case 'weeks':
        if (index !== undefined) {
          parts.push(`Week ${index + 1}`);
          category = 'week';
        }
        break;

      case 'days':
        if (index !== undefined) {
          parts.push(`Day ${index + 1}`);
          category = 'day';
        }
        break;

      case 'exercises':
        if (index !== undefined) {
          parts.push(`Exercise ${index + 1}`);
          category = 'exercise';
        }
        break;

      case 'setGroups':
        if (index !== undefined) {
          parts.push(`Set Group ${index + 1}`);
          category = 'set';
        }
        break;

      case 'sets':
        if (index !== undefined) {
          parts.push(`Set ${index + 1}`);
          category = 'set';
        }
        break;

      case 'meals':
        if (index !== undefined) {
          parts.push(`Meal ${index + 1}`);
          category = 'meal';
        }
        break;

      case 'foods':
        if (index !== undefined) {
          parts.push(`Food ${index + 1}`);
          category = 'food';
        }
        break;

      case 'baseSet':
        // Skip, handled by child properties
        break;

      case 'name':
      case 'description':
      case 'notes':
      case 'difficulty':
      case 'status':
        // Top-level program properties
        if (parts.length === 0) {
          category = 'program';
        }
        parts.push(formatPropertyName(name));
        break;

      default:
        // Regular property
        if (index !== undefined) {
          parts.push(`${formatPropertyName(name)} ${index + 1}`);
        } else {
          parts.push(formatPropertyName(name));
        }
        break;
    }
  }

  // Build readable string
  let readable = parts.join(' → ');
  let detail: string | undefined;

  // Add value change if provided
  if (context?.from !== undefined || context?.to !== undefined) {
    const fromStr = formatValue(context.from);
    const toStr = formatValue(context.to);
    if (fromStr !== toStr) {
      detail = `${fromStr} → ${toStr}`;
    }
  }

  // Fallback for empty result
  if (!readable) {
    readable = path;
  }

  return {
    category,
    icon: CATEGORY_ICONS[category],
    readable,
    detail,
    path,
  };
}

/**
 * Group formatted changes by category
 */
export function groupChangesByCategory(
  changes: FormattedChange[]
): Map<FormattedChange['category'], FormattedChange[]> {
  const groups = new Map<FormattedChange['category'], FormattedChange[]>();

  for (const change of changes) {
    const existing = groups.get(change.category) || [];
    existing.push(change);
    groups.set(change.category, existing);
  }

  return groups;
}

/**
 * Get a human-readable category label
 */
export function getCategoryLabel(category: FormattedChange['category']): string {
  const labels: Record<FormattedChange['category'], string> = {
    exercise: 'Exercises',
    set: 'Sets',
    week: 'Weeks',
    day: 'Days',
    program: 'Program Settings',
    meal: 'Meals',
    food: 'Foods',
    other: 'Other Changes',
  };
  return labels[category];
}
