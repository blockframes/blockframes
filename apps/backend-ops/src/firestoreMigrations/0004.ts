import { loadAdminServices } from "../admin";

/**
 * Update organisation permissions data model.
 */
export async function updateOrganizationPermissionsModel() {
  const permissions = await loadAdminServices().db.collection('permissions').get();
  const newPermissionsData = permissions.docs.map(async (permissionsSnap: any): Promise<any> => {
    const permissionsData = permissionsSnap.data();
    const updatedPermissionsData = {
      ...permissionsData,
      id: permissionsData.orgId,
      roles: {}
    }

    permissionsData.superAdmins.forEach((uid:string) => updatedPermissionsData.roles[uid] = 'superAdmin');
    permissionsData.admins.forEach((uid:string) => updatedPermissionsData.roles[uid] = 'superAdmin');

    delete updatedPermissionsData.superAdmins;
    delete updatedPermissionsData.admins;
    delete updatedPermissionsData.orgId;

    return permissionsSnap.ref.set(updatedPermissionsData);
  });

  await Promise.all(newPermissionsData);
  console.log('Organization permissions model updated.');
}
