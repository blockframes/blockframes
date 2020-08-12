import { loadAdminServices, Auth, Firestore } from './admin';
import {
  cleanMovies,
  cleanOrganizations,
  cleanPermissions,
  cleanDocsIndex,
  cleanNotifications,
  cleanDeprecatedData,
  dayInMillis,
  numberOfDaysToKeepNotifications
} from './db-cleaning';


//TODO: For code -review.
const adminServices = loadAdminServices();

cleanDeprecatedData(adminServices);