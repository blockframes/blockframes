import {
  Firestore,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Transaction,
  DocumentReference
} from '../admin';

import { PLACEHOLDER_LOGO } from '@blockframes/organization';
import { PLACEHOLDER_AVATAR } from '@blockframes/auth';
import { database } from 'firebase';


/**
 * Comparing and merging the default data and the data in DB
 *
 * Select all the keys from defaultValues in item,
 * if a value is undefined, uses the default Value.
 *
 * selectAndMergeValues({a: undefined, b: 2, c: true}, {a: 42, c: false}) => {a: 42, c: true}
 */
const selectAndMergeValues = (item, defaultValues) => {
  const result = { ...defaultValues };

  Object.keys(defaultValues).forEach(key => {
    if (item[key] !== undefined) {
      result[key] = item[key];
    }
  });

  return result;
};

/**
 * Function to upgrade delivery data
 */
function upgradeDelivery(delivery: QueryDocumentSnapshot, tx: Transaction) {
  const data = delivery.data();
  const defaultValues = {
    type: data.type,
    movieId: data.movieId,
    isPaid: data.isPaid,
    mustBeSigned: data.mustBeSigned,
    mustChargeMaterials: data.mustChargeMaterials,
    status: data.status || 'pending',
    dueDate: data.dueDate,
    acceptationPeriod: data.acceptationPeriod,
    reWorkindPeriod: data.reWorkindPeriod,
    mgAmount: data.mgAmount,
    mgCurrency: data.mgCurrency,
    // mgDeadline: [],
    steps: [],
    validated: [],
    mgCurrentDeadline: data.mgCurrentDeadline,
    isSigned: data.isSigned
  }

  const newDeliveryData = selectAndMergeValues(data, defaultValues);
  tx.update(delivery.ref, newDeliveryData);
}

/**
 * Function to upgrade invitation data
 */
function upgradeInvitation(invitation: QueryDocumentSnapshot, tx: Transaction) {
  const data = invitation.data();
  const defaultValues = {
    app: data.app,
    type: data.type,
    userId: data.userId,
    organizationId: data.organizationId,
    docID: data.docId,
    state: data.state,
    date: data.date
    // docType
  }

  const newInvitationData = selectAndMergeValues(data, defaultValues);
  tx.update(invitation.ref, newInvitationData);
}

/**
 * Function to upgrade movie data
 */
function upgradeMovie(movie: QueryDocumentSnapshot, tx: Transaction) {
  const data = movie.data();
  const defaultValues = {
    type: data.type,
    main: {
      internalRef: data.internalRef,
      isan: data.isan,
      title: [],
      directors: [],
      poster: data.poster,
      productionYear: data.productionYear,
      genres: [],
      originCountries: [],
      languages: [],
      status: data.status,
      productionCompagnies: [],
      length: data.length,
      shortSynopsis: data.shortSynopsis
    },
    story: {
      synopsis: data.synopsis,
      logline: data.logline
    },
    promotionalElements: {
      images: [],
      promotionalElements: []
    },
    promotionalDescription: {
      keyAssets: [],
      keywords: []
    },
    salesCast: {
      credits: []
    },
    salesInfo: {
      scoring: data.scoring,
      color: data.color,
      europeanQualification: data.europeanQualification,
      pegi: data.pegi,
      certifications: [],
      internationalPremiere: [],
      originCountryReleaseDate: data.originCountryReleaseDate,
      broadcasterCoproducers: []
    },
    versionInfo: {
      dubbings: [],
      subtitles: []
    },
    festivalPrizes: {
      prizes: []
    },
    salesAgentDeal: {
      rights: [],
      territories: [],
      medias: []
    }
  }

  const newMovieData = selectAndMergeValues(data, defaultValues);
  tx.update(movie.ref, newMovieData);
}

/**
 * Function to upgrade notification data
 */
function upgradeNotification(notification: QueryDocumentSnapshot, tx: Transaction) {
  const data = notification.data();
  const defaultValues = {
    app: data.app,
    date: data.date,
    docInformation: data.docInformation,
    isRead: data.isRead,
    message: data.message,
    path: data.path,
    userId: data.userId,
    organizationId: data.organizationId
  };

  const newNotificationData = selectAndMergeValues(data, defaultValues);
  tx.update(notification.ref, newNotificationData);
}

/**
 * Function to upgrade organization data
 */
function upgradeOrganization(organization: QueryDocumentSnapshot, tx: Transaction) {
  const data = organization.data();
  const defaultValues = {
    name: data.name,
    address: data.address,
    status: data.status,
    logo: data.logo || PLACEHOLDER_LOGO,
    officeAddress: data.officeAddress,
    phoneNumber: data.phoneNumber,
    created: data.created,
    updated: data.updated
    // userIds, movieIds, templateIds
  };

  const newOrganizationData = selectAndMergeValues(data, defaultValues);
  tx.update(organization.ref, newOrganizationData);
}

/**
 * Function to upgrade permission data
 */
function upgradePermission(permission: QueryDocumentSnapshot, tx: Transaction) {
  const data = permission.data();
  const defaultValues = {
    superAdmins: data.superAdmins,
    canCreate: data.canCreate,
    canRead: data.canRead,
    canUpdate: data.canUpdate,
    canDelete: data.canDelete,
    admins: data.admins,
    applications: data.applications,
    roles: data.roles,
  //  userAppsPermissions, userDocsPermissions, orgDocsPermissions
  };

  const newPermissionData = selectAndMergeValues(data, defaultValues);
  tx.update(permission.ref, newPermissionData);
}

/**
 * Function to upgrade Template data
 */
function upgradeTemplate(template: QueryDocumentSnapshot, tx: Transaction) {
  const data = template.data();
  const defaultValues = {
    type: data.type,
    name: data.name,
    created: data.created,
    orgId: data.orgId
  };

  const newTemplateData = selectAndMergeValues(data, defaultValues);
  tx.update(template.ref, newTemplateData);
}

/**
 * Function to upgrade user data
 */
function upgradeUser(user: QueryDocumentSnapshot, tx: Transaction) {
  const data = user.data();
  const defaultValues = {
    email: data.email,
    name: data.name,
    surname: data.surname,
    phoneNumber: data.phoneNumber,
    position: data.position,
    orgId: data.orgId,
    avatar: data.avatar || PLACEHOLDER_AVATAR
    // financing
  };

  const newUserData = selectAndMergeValues(data, defaultValues);
  tx.update(user.ref, newUserData);
}

/**
 * Function to upgrade the database
 */
async function upgradeDB(db: Firestore) {

  // Query all collections
  const deliveryQuery = db.collection('deliveries');
  const invitationQuery = db.collection('invitations');
  const movieQuery = db.collection('movies');
  const notificationQuery = db.collection('notifications');
  const organizationQuery = db.collection('orgs');
  const permissionQuery = db.collection('persmissions');
  const templateQuery = db.collection('templates');
  const userQuery = db.collection('users');

  await db.runTransaction(async tx => {
    const deliveries = await tx.get(deliveryQuery);
    const invitations = await tx.get(invitationQuery);
    const movies = await tx.get(movieQuery);
    const notifications = await tx.get(notificationQuery);
    const organizations = await tx.get(organizationQuery);
    const permissions = await tx.get(permissionQuery);
    const templates = await tx.get(templateQuery);
    const users = await tx.get(userQuery);

    // Upgrade deliveries
    console.log("Upgrading deliveries");
    deliveries.forEach(doc => upgradeDelivery(doc, tx));
    console.log("Deliveries upgraded");

    // Upgrade invitations
    console.log("Upgrading invitation");
    invitations.forEach(doc => upgradeInvitation(doc, tx));
    console.log("Invitations upgraded");

    // Upgrade movies
    console.log("Upgrading movies");
    movies.forEach(doc => upgradeMovie(doc, tx));
    console.log("Movies upgraded");

    // Upgrade notifications
    console.log("Upgrading notifications");
    notifications.forEach(doc => upgradeNotification(doc, tx));
    console.log("Notifications upgraded");

    // Upgrade organizations
    console.log("Upgrading organizations");
    organizations.forEach(doc => upgradeOrganization(doc, tx));
    console.log("Organizations upgraded");

    // Upgrade permissions
    console.log("Upgrading permissions");
    permissions.forEach(doc => upgradePermission(doc, tx));
    console.log("Permissions upgraded");

    // Upgrade templates
    console.log("Upgrading templates");
    templates.forEach(doc => upgradeTemplate(doc, tx));
    console.log("Templates upgraded");

    // Upgrade users
    console.log("Upgrading users");
    users.forEach(doc => upgradeUser(doc, tx));
    console.log("Users upgraded");
  });
}
