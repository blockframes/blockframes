import 'tsconfig-paths/register';
import { copyDbFromCi } from '@blockframes/firebase-utils';

copyDbFromCi().then(() => process.exit(0));
