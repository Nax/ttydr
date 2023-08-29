import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { DIR_BUILD, DIR_ISO, DIR_OUT } from './util';

import { Patchfile } from './patchfile';
import { Patcher } from './patcher';
import { codegen } from './codegen';
import { Monitor } from './monitor';

async function make() {
  return new Promise((resolve, reject) => {
    const args = ['-j', '32'];
    if (true) {
      args.push('DEBUG=1');
    }
    const proc = spawn('make', args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        reject(new Error(`make exited with code ${code}`));
      }
    });
  });
};

export async function generate() {
  const monitor = new Monitor({});
  const patchfile = new Patchfile();

  /* Codegen */
  await codegen(monitor);

  /* Build */
  await make();

  /* Read the ISO */
  const iso = await fs.readFile(path.join(DIR_ISO, 'ttyd.iso'));

  /* Create the patchfile */
  const rawPatchData = await fs.readFile(path.join(DIR_BUILD, 'Debug', 'ttydr_patch.bin'));
  const patcher = new Patcher(iso, rawPatchData, patchfile);
  await patcher.run();

  /* Write the patchfile */
  for (const p of patchfile.patches) {
    p.data.copy(iso, p.addr);
  }

  /* Inject the actual payload */
  const payload = await fs.readFile(path.join(DIR_BUILD, 'Debug', 'ttydr_payload.bin'));
  payload.copy(iso, 0x10000000);

  /* Write the ISO */
  await fs.mkdir(DIR_OUT, { recursive: true });
  await fs.writeFile(path.join(DIR_OUT, 'ttydr.iso'), iso);
}
