import NextImage from 'next/image';
import { cn } from '@onecoach/lib-design-system';
import type { GeneratedImage } from './ai-types';

export type ImageProps = GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({ base64, uint8Array: _uint8Array, mediaType, ...props }: ImageProps) => (
  <NextImage
    {...props}
    alt={props.alt || 'Generated image'}
    className={cn('h-auto max-w-full overflow-hidden rounded-md', props.className)}
    height={512}
    src={`data:${mediaType};base64,${base64}`}
    unoptimized
    width={512}
  />
);
