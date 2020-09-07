import 'tsconfig-paths/register';
import { loadAdminServices, restoreStorageFromCi } from '@blockframes/firebase-utils';

const adminServices = loadAdminServices();
restoreStorageFromCi(adminServices.getCI());
