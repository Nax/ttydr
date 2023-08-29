import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { DIR_BUILD, DIR_ISO, DIR_OUT } from './util';

import { Patchfile } from './patchfile';
import { Patcher } from './patcher';

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

async function generate() {
  const patchfile = new Patchfile();

  /* Build */
  await make();

  /* Read the ISO */
  const iso = await fs.readFile(path.join(DIR_ISO, 'ttyd.iso'));

  /* Create the patchfile */
  const rawPatchData = await fs.readFile(path.join(DIR_BUILD, 'Debug', 'ttydr_patch.bin'));
  const patcher = new Patcher(iso, rawPatchData, patchfile);
  await patcher.run();

  /* Expand BSS to add our payload */
  const dolBssSize = Buffer.alloc(4);
  dolBssSize.writeUInt32BE(0x7506C, 0);
  patchfile.addPatch(0x20300 + 0xdc, dolBssSize);

  /* Write the patchfile */
  for (const p of patchfile.patches) {
    p.data.copy(iso, p.addr);
  }

  /* Write the ISO */
  await fs.mkdir(DIR_OUT, { recursive: true });
  await fs.writeFile(path.join(DIR_OUT, 'ttydr.iso'), iso);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
