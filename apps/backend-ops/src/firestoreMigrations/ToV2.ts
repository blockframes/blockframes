import { Firestore } from '../admin';


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
    const {address, phoneNumber} = orgData;

    delete orgData.address;
    delete orgData.catalog;
    delete orgData.officeAddress;
    delete orgData.phoneNumber;
    delete orgData.members;

    const newData = {
      ...orgData,
      addresses: {
        main : {
          city: address,
          country: '',
          phoneNumber: phoneNumber,
          region: '',
          street: '',
          zipCode: ''
        }
      }
    };

    return orgDocSnapshot.ref.set(newData);
  });
  await Promise.all(newOrgnizationData);
  console.log('Updating organization documents done');
}
