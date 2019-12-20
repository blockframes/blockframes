import { Firestore } from '../admin';
import { withoutUndefined } from './0001';

interface Language {
  [language: string]:
    {
      dubbed: boolean,
    subtitle: boolean,
    closedCaptioned: boolean
  }
}

/**
 * Upgrade invitation collection
 */
export async function upgradeInvitationCollection(db: Firestore) {
  const invitations = await db.collection('invitations').get();

  const newInvitationDoc = invitations.docs.map( async (invitDocSnapshot: any): Promise<any> => {
    const invitationData = invitDocSnapshot.data();
    const {organization, user} = invitationData;

    delete invitationData.organization;
    delete invitationData.user;

    const newData = {
      ...invitationData,
      organizationId: organization.id,
      userId: user.uid
    }
    return invitDocSnapshot.ref.set(newData);
  });
  await Promise.all(newInvitationDoc);
  console.log('Upgrading invitation collection done.');
}

/**
 * Upgrade Organization Documents
 */
export async function upgradeOrganizationCollection(db: Firestore) {
  const organizations = await db.collection('orgs').get();

  const newOrgData = organizations.docs.map(async (orgDocSnapshot: any): Promise<any> => {
    const organizationData = orgDocSnapshot.data();
    const { name, movieIds } = organizationData;

    delete organizationData.name;

    const newData = {
      ...organizationData,
      allowLineUpCreation: false,
      denomination: {
        full: name,
        public: name
      },
      isBlockchainEnabled: false,
      // movieIds: {
      //   archipelContent: movieIds
      // }
    };

    return orgDocSnapshot.ref.set(newData);
  });

  await Promise.all(newOrgData);
  console.log('Upgrading organization collection done.');
}

/**
 * Upgrade movie collection
 */
export async function upgradeMovieCollection(db: Firestore) {
  const movies = await db.collection('movies').get();

  const newMovieData = movies.docs.map(async (movieDocSnapshot: any): Promise<any> => {
    const movieData = movieDocSnapshot.data();
    const {length, languages} = movieData.main;
    const {pegi} = movieData.salesInfo;
    const {rights} = movieData.salesAgentDeal;
    const {totalBudget} = movieData.budget;
    const {dubbings, subtitles} = movieData.versionInfo;

    function convertStrToNumber(string) {
      const numberWithoutComma = string.replace(/,/g, '');
      const newNumber = numberWithoutComma.match(/([0-9])+/g);
      return Number(newNumber);
    };

    function findCurrency(string) {
      const regex = /[A-Z]{1,3}|[$£€]+/;
      const currency = string.match(regex);
      return String(currency);
    };

    function termsDate(string) {
      const seconds = Date.parse(string);
      return new Date(seconds);
    };

    function subDubTitle(dubbingArray, subtitleArray) {
      let languages : Language;
      const subDub = dubbingArray.filter(e => subtitleArray.includes(e)); // tableau des langues dans sub et dub
      const dubOnly = dubbingArray.filter(e => !subtitleArray.includes(e))
      const subOnly = subtitleArray.filter(e => !dubbingArray.includes(e))

      subOnly.forEach(key => {
        languages = ({...languages, [key]:{dubbed: false, subtitle: true, closedCaptioned: false}})
      })

      dubOnly.forEach(key => {
        languages = ({...languages, [key]:{dubbed: true, subtitle: false, closedCaptioned: false}})
      })

      subDub.forEach(key => {
        languages = ({...languages, [key]:{dubbed: true, subtitle: true, closedCaptioned: false}})
      })
    };

    delete movieData.main.length;
    delete movieData.salesInfo.pegi;
    delete movieData.salesAgentDeal.rights;

    const newData = {
      ...movieData,
      // applications: {
      //   archipelContent: true
      // },
      budget: {
        realBudget: {
          currency: findCurrency(totalBudget),
          value: convertStrToNumber(totalBudget)
        }
      },
      main: withoutUndefined({
        ...movieData.main,
        originalLanguages: languages,
        totalRunTime: length
      }),
      salesAgentDeal: {
        ...movieData.salesAgentDeal,
        terms: {
          start: termsDate(rights.from),
          end: termsDate(rights.to),
        }
      },
      salesInfo: withoutUndefined({
        ...movieData.salesInfo,
        rating: {
          value: pegi
        },
      }),
      versionInfo: subDubTitle(dubbings, subtitles)
    };

    return movieDocSnapshot.ref.set(newData);
  });

  await Promise.all(newMovieData);
  console.log('Upgrading movie collection done.');
}

export async function upgrade(db: Firestore) {
  await upgradeInvitationCollection(db);
  await upgradeOrganizationCollection(db);
  await upgradeMovieCollection(db);
}
