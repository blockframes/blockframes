import {
  Firestore,
  QueryDocumentSnapshot,
  Transaction
} from '../admin';
import { PLACEHOLDER_LOGO } from '@blockframes/organization';


/**
 * Lets you select values from an item while configuring default values.
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


///////////////////
/// COLLECTION  ///
///////////////////

/**
 * Delivery Migration
 */
function deliveryUpgrade(delivery: QueryDocumentSnapshot, tx: Transaction) {
  const data = delivery.data();
  const defaultValues = {
    _type: 'deliveries',
    acceptationPeriod: '',
    dueDate: '',
    isPaid: false,
    isSigned: false,
    mgAmount: '',
    mgCurrency: '',
    mgCurrentDeadline: '',
    mgDeadlines: [],
    movieId: '',
    mustBeSigned: true,
    mustChargeMaterials: false,
    processedId: '',
    reWorkindPeriod: '',
    status: 'pending',
    steps: [],
    validated: [],
  };

  const newDeliveryData = selectAndMergeValues(data, defaultValues);
  tx.update(delivery.ref, newDeliveryData);
}

/**
 * Invitation Migration
 */
function invitationUpgrade(invitation: QueryDocumentSnapshot, tx: Transaction) {
  const data = invitation.data();
  const defaultValues = {
    app: '',
    date: '',
    docId: '',
    processedId: '',
    organization: {},
    status: 'pending',
    type: '',
    user: {}
  };

  const newInvitationData = selectAndMergeValues(data, defaultValues);
  tx.update(invitation.ref, newInvitationData);
}

/**
 * Movie Migration
 * Can I integrate changement inside this function ?
 */
function movieUpgrade(movie: QueryDocumentSnapshot, tx: Transaction) {
  const data = movie.data();
  const defaultValues = {
    _type: 'movies',
    // applications: {},
    budget: {
      budgetCurrency: '',
      detailedBudget: '',
      totalBudget: ''
    },
    deliveryIds: [],
    festivalPrizes: {
      prizes: {}
    },
    main: {
      // companyDisplayCredit: '',
      languages: [],
      // officialIds: {
      //   ISAN: '',
      //   EIDR: ''
      // },
      title: {
        original: '',
      },
      // totalRunTime: '',
    },
    promotionalDescription: {
      keyAssets: [],
      keywords: []
    },
    promotionalElements: {
      images: [],
      promotionalElements: {}
    },
    salesAgentDeal: {
      medias: [],
      rights: {},
      // terms: {
      //   start: '',
      //   startLag: '',
      //   end: '',
      //   endLag: ''
      // },
      territories: [],
    },
    salesCast: {
      credits: []
    },
    salesInfo: {
      broadcasterCoproducers: [],
      certifications: [],
      color: '',
      europeanQualification: '',
      internationalPremiere: {},
      originCountryReleaseDate: '',
      pegi: '',
      // rating: {
      //   system: '',
      //   value: '',
      //   country: '',
      //   reason: ''
      // },
      // releaseHistoryOriginal: '',
      // releaseHistoryPhysicalHV: '',
      // releaseYear: '',
      scoring: '',
      theatricalRelease: '',
    },
    story: {
      logline: '',
      synopsis: '',
    },
    versionInfo: {
      dubbings: [],
      subtitles: [],
    }
  };

  const newMovieData = selectAndMergeValues(data, defaultValues);
  tx.update(movie.ref, newMovieData);
}

/**
 * Notification Migration
 */
function notificationUpgrade(notification: QueryDocumentSnapshot, tx: Transaction) {
  const data = notification.data();
  const defaultValues = {
    app: 'main',
    date: '',
    docId: '',
    isRead: false,
    movie: {},
    organization: {},
    type: '',
    userId: ''
  };

  const newNotificationData = selectAndMergeValues(data, defaultValues);
  tx.update(notification.ref, newNotificationData);
}

/**
 * Organization Migration
 * TODO : Denomination doesn't exist yet, have I to create it with a function and delete the organization.name before ?
 * Or can I do this in the same function ?
 */
function organizationUpgrade(organization: QueryDocumentSnapshot, tx: Transaction) {
  const data = organization.data();
  const defaultValues = {
    activity: '',
    addresses: {},
    cart: [],
    created: data.created,
    denomination: { full: data.name, public: ''},
    email: '',
    fiscalNumber: '',
    logo: data.logo || PLACEHOLDER_LOGO,
    // movieIds: { App: [], App: []},
    status: 'pending',
    templateIds: [],
    updated: data.updated,
    userIds: [],
    wishlist: []
  };

  const newOrganizationData = selectAndMergeValues(data, defaultValues);
  tx.update(organization.ref, newOrganizationData);
}


///////////////////
// SUBCOLLECTION //
///////////////////

/**
 * Template's materials Migration
 */
async function materialTemplateUpgrade(template: QueryDocumentSnapshot) {
  const materials = await template.ref.collection('materials').get();

  materials.docs.map(async (material: any): Promise<any> => {
    const data = material.data();
    const defaultValues = {
      category: '',
      description: '',
      price: {},
      value: ''
    };

    const newMaterialData = selectAndMergeValues(data, defaultValues);
    await template.ref.collection('materials').doc(data.id).set(newMaterialData);
  })
}

/**
 * Delivery's materials and stakeholders Migration
 */
async function materialDeliveryUpgrade(delivery: QueryDocumentSnapshot) {
  const materials = await delivery.ref.collection('materials').get();

  materials.docs.map(async (material: any): Promise<any> => {
    const data = material.data();
    const defaultValues = {
      category: '',
      description: '',
      isOrdered: false,
      isPaid: false,
      owner: '',
      price: {
        type: '',
        value: '',
        currency: '' || data.currency
      },
      status: 'pending',
      stepId: '',
      storage: '',
      value: ''
    };

    const newMaterialData = selectAndMergeValues(data, defaultValues);
    await delivery.ref.collection('materials').doc(data.id).set(newMaterialData);
  })
}

/**
 * Function to upgrade the database
 */
async function upgradeV2(db: Firestore) {

  // Query all collections
  const deliveryQuery = db.collection('deliveries');
  const invitationQuery = db.collection('invitations');
  const movieQuery = db.collection('movies');
  const notificationQuery = db.collection('notifications');
  const organizationQuery = db.collection('orgs');

  await db.runTransaction(async tx => {
    const deliveries = await tx.get(deliveryQuery);
    const invitations = await tx.get(invitationQuery);
    const movies = await tx.get(movieQuery);
    const notifications = await tx.get(notificationQuery);
    const organizations = await tx.get(organizationQuery);

    // Upgrade deliveries
    console.log("Upgrading deliveries");
    deliveries.forEach(doc => deliveryUpgrade(doc, tx));
    console.log("Deliveries upgraded");

    // Upgrade invitations
    console.log("Upgrading invitation");
    invitations.forEach(doc => invitationUpgrade(doc, tx));
    console.log("Invitations upgraded");

    // Upgrade movies
    console.log("Upgrading movies");
    movies.forEach(doc => movieUpgrade(doc, tx));
    console.log("Movies upgraded");

    // Upgrade notifications
    console.log("Upgrading notifications");
    notifications.forEach(doc => notificationUpgrade(doc, tx));
    console.log("Notifications upgraded");

    // Upgrade organizations
    console.log("Upgrading organizations");
    organizations.forEach(doc => organizationUpgrade(doc, tx));
    console.log("Organizations upgraded");
  });
}
