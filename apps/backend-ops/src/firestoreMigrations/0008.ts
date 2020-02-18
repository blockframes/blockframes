import { Firestore } from '../admin';

export async function upgrade(db: Firestore) {
  const perms = await db.collection('permissions').get();
  const batch = db.batch();

  perms.docs.forEach(x => {
    const data = x.data();

    // already up to date
    if (data.roles) {
      return;
    }

    const { superAdmins, admins } = data;
    const roles = {};

    if (superAdmins) {
      superAdmins.forEach(id => (roles[id] = 'superAdmin'));
    }

    if (admins) {
      admins.forEach(id => (roles[id] = 'admin'));
    }

    console.log('newRoles:', roles);

    delete data.admins;
    delete data.superAdmins;

    batch.set(x.ref, { ...data, roles });
  });

  return await batch.commit();
}
