
import { generate } from './ttydr';

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
