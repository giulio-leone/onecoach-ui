import {
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
  type PressableProps,
  type ViewProps,
} from 'react-native';
import { Card } from '../card';

type XCardProps =
  | (PressableProps & { heading?: string; description?: string })
  | (ViewProps & { heading?: string; description?: string });

const resolveChildren = (value: PressableProps['children']): React.ReactNode => {
  if (typeof value === 'function') {
    return value({ pressed: false });
  }
  return value ?? null;
};

/**
 * XCard - cross-platform card. Web usa Card DS, native usa View/Pressable.
 */
export function XCard({ heading, description, ...props }: XCardProps) {
  if (Platform.OS === 'web') {
    const { onPress, ...rest } = props as PressableProps;
    const renderedChildren: React.ReactNode =
      'children' in rest ? resolveChildren(rest.children) : null;
    const content = (
      <div className="space-y-2">
        {heading && <h3 className="text-lg font-semibold">{heading}</h3>}
        {description && <p className="text-sm text-neutral-600">{description}</p>}
        {renderedChildren ?? null}
      </div>
    );
    if (onPress) {
      return (
        <Card
          className="cursor-pointer"
          onClick={onPress as unknown as React.MouseEventHandler<HTMLDivElement>}
        >
          {content}
        </Card>
      );
    }
    return <Card {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{content}</Card>;
  }

  const { onPress, children, ...rest } = props as PressableProps;
  const renderedChildren: React.ReactNode = resolveChildren(children);
  const content = (
    <View style={styles.inner}>
      {heading ? <Text style={styles.heading}>{heading}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {renderedChildren}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.base, pressed && styles.pressed]}
        onPress={onPress}
        {...rest}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={styles.base} {...(rest as ViewProps)}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  pressed: {
    opacity: 0.95,
  },
  inner: {
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
  },
});
