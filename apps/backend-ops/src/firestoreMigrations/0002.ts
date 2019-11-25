import { Firestore } from '../admin';
import { firestore as fs } from 'firebase/app';


/**
 * Update invitation collection with organization object and user object instead of organizationId and userId
 */
export async function updateInvitationDocument(db: Firestore) {
  const invitations = await db.collection('invitations').get();

  const newInvitationDoc = invitations.docs.map( async (invitDocSnapshot: any): Promise<any> => {
    const invitationData = invitDocSnapshot.data();
    const {organizationId, userId} = invitationData;

    const org = await db.doc(`orgs/${organizationId}`).get();
    const orgName = org.data().name;

    const user = await db.doc(`users/${userId}`).get();
    const userData = user.data();

    delete invitationData.organizationId;
    delete invitationData.userId;

    const newData = {
      ...invitationData,
      organization: {id: organizationId, name: '' || orgName},
      user: {id: userData.uid, email: userData.email, name: '' || userData.name, surname: '' || userData.surname, avatar: '' || userData.avatar}
    }
    return invitDocSnapshot.ref.set(newData);
  });
  await Promise.all(newInvitationDoc);
  console.log('Updating organisation in invitation collection done');
}

/**
 * Update organisation document from AFM information to today master information (18/11/19)
 */
export async function updateOrganizationDocument(db: Firestore) {
  const organizations = await db.collection('orgs').get();

  const newOrgnizationData = organizations.docs.map(async (orgDocSnapshot: any): Promise<any> => {
    const orgData = orgDocSnapshot.data();
    const {address, phoneNumber, created, updated, logo} = orgData;

    delete orgData.address;
    delete orgData.catalog;
    delete orgData.officeAddress;
    delete orgData.phoneNumber;
    delete orgData.members;

    const newData = {
      ...orgData,
      addresses: {
        main : {
          city: address || '',
          country: '',
          phoneNumber: phoneNumber || '',
          region: '',
          street: '',
          zipCode: ''
        }
      },
      created: new Date(created),
      logo: {
        originalRef: '',
        ref: '',
        url: logo
      },
      updated: new Date(updated)
    };

    return orgDocSnapshot.ref.set(newData);
  });
  await Promise.all(newOrgnizationData);
  console.log('Updating organization documents done');
}

/**
 * Update poster url in movie documents
 */
export async function updatePicturesMovieDocument(db: Firestore) {
  const movies = await db.collection('movies').get();

  const newMovieData = movies.docs.map(async (movieDocSnapshot: any): Promise<any> => {
    const movieData = movieDocSnapshot.data();

    const { poster } = movieData.main;

    const newData = {
      ...movieData,
      festivalPrizes: {
        ...movieData.festivalPrizes,
        prizes: movieData.festivalPrizes.prizes.map(prizeData =>({
          ...prizeData,
          logo: {
            originalRef: '',
            ref: '',
            url: prizeData.logo
          }
        }))
      },
      main: {
        ...movieData.main,
        poster: {
          originalRef: '',
          ref: '',
          url: poster
        }
      },
      promotionalElements: {
        ...movieData.promotionalElements,
        promotionalElements: movieData.promotionalElements.promotionalElements.map(promoData => {
          const { url } = promoData;
          delete promoData.url;

          return {
            ...promoData,
            media: {
              originalRef: '',
              ref: '',
              url: url
            }
          }
        })
      },
    };


    return movieDocSnapshot.ref.set(newData);
  });
  await Promise.all(newMovieData);
  console.log('Updating poster in movie documents done');
}

/**
 * Update user's avatar in user documents
 */
export async function updateAvatarUserDocument(db: Firestore) {
  const users = await db.collection('users').get();

  const newUserData = users.docs.map(async (userDocSnapshot: any): Promise<any> => {
    const userData = userDocSnapshot.data();

    const { avatar } = userData;

    const newData = {
      ...userData,
      avatar: {
        originalRef: '',
        ref: '',
        url: avatar || ''
      }
    };

    return userDocSnapshot.ref.set(newData);
  });
  await Promise.all(newUserData);
  console.log('Updating avatar in user documents done');
}
