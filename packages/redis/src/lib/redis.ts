import { redistest } from '@finjest/redis';

export function redis(): Promise<void> {
  return redistest;
}
