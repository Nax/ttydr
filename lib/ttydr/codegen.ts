import path from 'path';
import { DATA_ITEMS } from './data';
import { Monitor } from './monitor';
import { CodeGen } from './util/codegen';

const codegenFile = async (data: {[k: string]: number}, prefix: string, filename: string, guard: string) => {
  if (!process.env.ROLLUP) {
    const cg = new CodeGen(path.resolve('build', 'include', 'ttydr', filename), guard);
    for (const [k, v] of Object.entries(data)) {
      cg.define(prefix + "_" + k, v);
    }
    await cg.emit();
  }
};

export const codegen = async (monitor: Monitor) => {
  monitor.log("Codegen");
  return Promise.all([
    codegenFile(DATA_ITEMS,           "ITEM",     "item_data.h",    "TTYDR_GENERATED_ITEM_DATA_H"),
  ]);
};
