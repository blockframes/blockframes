import type { firestore } from "firebase-admin"
import * as faker from 'faker'

export async function clearOrgs(db: firestore.Firestore) {
    console.log('starting orgs anonimisation')
    const orgsQuerySnapshot = await db.collection('orgs').get()
    const orgs = orgsQuerySnapshot.docs.map(snapshot => {
      const org = snapshot.data()
      org.id = snapshot.id;

      const companyName = faker.company.companyName()
      const denomination = {
        full: companyName,
        public: companyName
      }
      org.denomination = denomination;
      const email = `${faker.name.firstName()}.${faker.name.lastName()}-${companyName.replace(/\s/g, '').replace(/\W/g,'')}-fakeOrg@cascade8.com`
      org.email = email;
      const { ref } = snapshot;
      return { org, ref };
    })
    return Promise.all(orgs.map(update => update.ref.set(update.org, {merge: true})))

}

/**
 * This function will take a db as a parameter and clean it's emails as per anonimisation policy
 */
export async function cleanUsers(db: firestore.Firestore) {
  // const users = await db.collection('users').get()
  // users.forEach(snapshot => {
  //   const user = snapshot.data()
  //   const uid = snapshot.id;
  //   const { email, firstName, lastName, orgId } = user;
  //   console.log(uid, email, firstName, lastName, orgId)
  // })

    console.log('starting email anonimisation')
    const usersQuerySnapshot = await db.collection('users').get()
    const orgsQuerySnapshot = await db.collection('orgs').get()
    const orgs = orgsQuerySnapshot.docs.map(snapshot => {
      const orgId = snapshot.id
      const org = snapshot.data()
      org.id = orgId;
      return org
    })
    const users = usersQuerySnapshot.docs.map(snapshot => {
      const uid = snapshot.id;
      const user = snapshot.data()
      user.id = uid;
      return user;
    })

    const updates = users.map(user => {
      const { orgId } = user;
      const org = orgs.find(thisOrg => {
        return thisOrg.id === orgId
      })
      const firstName = faker.name.firstName()
      const lastName = faker.name.lastName()
      let newEmail = `${firstName}.${lastName}-${org?.denomination?.full.replace(/\W/g, '') ?? 'company'}-fake@cascade8.com`
      newEmail = newEmail.replace(/\s/g, '')
      newEmail = newEmail.toLowerCase()

      console.log(newEmail)
      return {
        ref: db.collection('users').doc(user.id),
        data: {firstName, lastName, email: newEmail}
      }

    })
    return Promise.all(updates.map(update => update.ref.set(update.data, {merge: true})))
    // transaction.set()
    // const orgRefs = users.docs.map(snapshot => {
    //   const user = snapshot.data()
    //   const { orgId } = user;
    //   return db.collection('orgs').doc(orgId)
    // })
    // const orgs = await transaction.getAll(...orgRefs)
}
