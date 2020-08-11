const fs = require("fs");
/**
 * This file is used to create mocked data for unit testing.
 * 
 * @see apps/backend-ops/src/db-cleaning.spec.ts
 * 
 * Example usage:
 * npx ts-node libs/testing/src/lib/scripts/create-mocked-data-db-cleaning.ts "/home/bruce/Bureau/cascade8/ninja/db/2020-07-20T22 00 20.378Z-anonymised.jsonl"
 */

///////////
// CONFIG
///////////

const pathToJsonFile: string = process.argv[2]; // @dev see Example usage below
const collectionsToImport = ['movies', 'orgs', 'permissions', 'notifications', 'invitations', 'events', 'users'];
const outputDirectory = './libs/testing/src/lib/mocked-data-unit-tests';

const max = {
  orgs: 10,
  movies: 30,
  permissions: 20,
  notifications: 20,
  events: 10,
  users: 2,
  invitations: 10,
}

const idsToFetch = {
  orgs: ['51x9zk4ejbhjADq2uMcC', 'Q9isufv6FATFBwK1YcIe'],
  permissions: ['xKppTiAKeRmZTGOZENQ4', 'xTNwdVBGO2iO3x8bUL8G', 'xYueOBZascUTxsry9uau'],
  movies: [],
  notifications: ['NLY6wLHdIYABxwM9hQZC', 'SrJorDdNLAKWJseqezfe', 'kxSUZzyYAmW8hAfj5eUI', '02ioTf7XaWba6cDmOEGE', '07bw2vq6SeinxpMibCUz', '040RK0ZG8XK9B8Kbtc2T'],
  events: ['2H0WKExmizor9Ua0lSlz'],
  users: ['PlsmWeCu6WRIau8tWLFzkQTGe6F2', '1M9DUDBATqayXXaXMYThZGtE9up1'],
  invitations: [],
}

///////////
// TOOLS
///////////

const current = {
  orgs: 0,
  permissions: 0,
  movies: 0,
  notifications: 0,
  events: 0,
  users: 0,
  invitations: 0,
}

const emptyLocation = {
  street: '',
  zipCode: '',
  city: '',
  country: '',
  phoneNumber: '',
  region: ''
}

const emptyPromotionalElement = {
  still_photo: {},
  scenario: '',
  presentation_deck: '',
  promo_reel_link: '',
  screener_link: '',
  trailer_link: '',
  teaser_link: ''
}

const emptySalesCast = {
  crew: [],
  cast: [],
  producers: []
}

/**
 * Clean document from unwanted data
 * @param doc 
 * @param collection 
 */
function cleanDocument(doc: any, collection: string) {
  switch (collection) {
    case 'orgs':
      doc.logo = '';
      doc.addresses.main = emptyLocation;
      doc.fiscalNumber = 'FR 76 ABC 123';
      doc.denomination = {
        public: `Public denomination ${doc.id}`,
        full: `Full denomination ${doc.id}`
      }
      doc.bankAccounts = [];

      // this is needed for db-cleaning unit testing:
      if (doc.members && doc.members.length) {
        doc.members = doc.members.map(m => ({
          avatar: '',
          watermark: `users/${m.uid}/watermark/${m.uid}.svg`,
          phoneNumber: '',
          lastName: `lastName ${m.uid}`,
          firstName: `firstName ${m.uid}`,
          position: ''
        }))
      }
      break;
    case 'movies':
      doc.promotionalElements = emptyPromotionalElement;
      doc.hostedVideo = 'xxxxx';
      doc.main.title.international = `International title ${doc.id}`;
      doc.main.title.original = `Original title ${doc.id}`;
      doc.story.logline = `Logline ${doc.id}`;
      doc.story.synopsis = `Synopsis ${doc.id}`;
      doc.main.directors = [];
      doc.salesCast = emptySalesCast;
      doc.salesInfo.originalRelease = [];
      doc.festivalPrizes.prizes = [];
      break;
    case 'users':
      doc.avatar = '';
      doc.watermark = `users/${doc.uid}/watermark/${doc.uid}.svg`;
      doc.phoneNumber = '';
      doc.lastName = `lastName ${doc.uid}`;
      doc.firstName = `firstName ${doc.uid}`;
      doc.position = '';

      // this is needed for db-cleaning unit testing:
      if (doc.surname) {
        doc.surname = `surname ${doc.uid}`;
      }

      if (doc.name) {
        doc.name = `name ${doc.uid}`;
      }

      break;
    case 'permissions':
    default:
      break;
  }
  return doc;
}

/**
 * Retreive and store documents found in first argument
 * @param file 
 */
async function getDocuments(file: string) {
  const documents = {
    movies: [],
    orgs: [],
    permissions: [],
    notifications: [],
    invitations: [],
    events: [],
    users: [],
  };

  const data = await fs.readFileSync(file, 'utf8');
  const lines = data.split('\n');

  for (const line of lines) {
    if (line) {
      const document = JSON.parse(line);
      const docParts = document.docPath.split('/');
      const collection = docParts[0];
      if (docParts.length === 2) { // Not a sub-collection
        if (collectionsToImport.includes(collection)) {
          documents[collection].push(cleanDocument(document.content, collection));
        };
      }
    }
  }

  return documents;
}


const mockedData = {
  movies: [],
  orgs: [],
  permissions: [],
  notifications: [],
  invitations: [],
  events: [],
  users: [],
}

getDocuments(pathToJsonFile).then(docs => {

  let collections = Object.keys(docs);
  // First pass
  for (const collection of collections) {
    for (const d of docs[collection]) {
      if (current[collection] !== undefined && current[collection] < max[collection] && idsToFetch[collection].includes(d.id || d.uid)) {
        current[collection]++;
        mockedData[collection].push(d);
      }
    }
  }

  // Second pass
  for (const collection of collections) {
    for (const d of docs[collection]) {
      if (current[collection] !== undefined && current[collection] < max[collection]) {
        current[collection]++;
        mockedData[collection].push(d);
      }
    }
  }

  return collections;
}).then(async collections => {
  for (const collection of collections) {
    await fs.writeFileSync(`${outputDirectory}/${collection}.json`, JSON.stringify(mockedData[collection]))
  }
  console.log(`Data created to : ${outputDirectory}`);
})