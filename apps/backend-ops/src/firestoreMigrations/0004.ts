import * as admin from 'firebase-admin';

/**
 * Update organisation permissions data model.
 */
export async function updateOrganizationPermissionsModel() {
  const permissions = await admin.firestore().collection('permissions').get();
  const newPermissionsData = permissions.docs.map(async (permissionsSnap: any): Promise<any> => {
    const permissionsData = permissionsSnap.data();

    permissionsData.superAdmins.forEach((uid:string) => permissionsData.roles[uid] = 'superAdmin');
    permissionsData.admins.forEach((uid:string) => permissionsData.roles[uid] = 'admin');
    permissionsData.members.forEach((uid:string) => permissionsData.roles[uid] = 'member');

    delete permissionsData.superAdmins;
    delete permissionsData.admins;
    delete permissionsData.members;

    return permissionsSnap.ref.set(permissionsData);
  });
  await Promise.all(newPermissionsData);
  console.log('Organization permissions model updated.');
}
