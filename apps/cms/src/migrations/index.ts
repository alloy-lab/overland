import * as migration_20250909_161027_initial from './20250909_161027_initial';
import * as migration_20251001_000101 from './20251001_000101';

export const migrations = [
  {
    up: migration_20250909_161027_initial.up,
    down: migration_20250909_161027_initial.down,
    name: '20250909_161027_initial',
  },
  {
    up: migration_20251001_000101.up,
    down: migration_20251001_000101.down,
    name: '20251001_000101',
  },
];
