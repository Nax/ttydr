import { promises as fs } from 'fs';

export const fileExists = async (path: string) => {
  if (!process.env.ROLLUP) {
    try {
      await fs.access(path, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  } else {
    return false;
  }
}
