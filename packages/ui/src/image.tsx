import NextImage from 'next/image';
import type { ComponentProps } from 'react';

type ImageProps = ComponentProps<typeof NextImage>;

export function Image(props: ImageProps) {
  return <NextImage {...props} />;
}

export default Image;
