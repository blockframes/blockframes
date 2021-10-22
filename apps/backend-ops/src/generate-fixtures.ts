import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { USER_FIXTURES_PASSWORD } from './users';
import staticUsers from 'tools/static-users.json'
import type { Movie } from '@blockframes/movie/+state/movie.model';
import type { Organization } from '@blockframes/organization/+state/organization.model';
import type { User } from '@blockframes/user/types';

export async function generateFixtures(db: FirebaseFirestore.Firestore) {
  await generateUsers(db);
  await generateMovies(db);
  await generateOrgs(db);
  await generateStaticUsers(db);
}

/**
 * This function will generate `tools/fixtures/users.json` from local Firestore
 */
async function generateUsers(db: FirebaseFirestore.Firestore) {
  console.log('Generating user fixtures file from Firestore...');

  console.time('Fetching users from Firestore');
  const { docs } = await db.collection('users').get();
  const users = docs.map(d => d.data() as User);
  console.timeEnd('Fetching users from Firestore');

  const output = users.map((user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    uid: user.uid,
    password: USER_FIXTURES_PASSWORD,
  }));
  const dest = join(process.cwd(), 'tools', 'fixtures', 'users.json');
  await fsPromises.writeFile(dest, JSON.stringify(output));
  console.log('User fixture saved:', dest);
}

/**
 * This function will generate `tools/fixtures/movies.json` from local Firestore
 */
async function generateMovies(db: FirebaseFirestore.Firestore) {
  console.log('Generating movie fixtures file from Firestore...');

  console.time('Fetching movies from Firestore');
  const { docs } = await db.collection('movies').get();
  const movies =  docs.map(d => d.data() as Movie);
  console.timeEnd('Fetching movies from Firestore');

  const output: Partial<Movie>[] = movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    app: movie.app
  }));
  const dest = join(process.cwd(), 'tools', 'fixtures', 'movies.json');
  await fsPromises.writeFile(dest, JSON.stringify(output));
  console.log('Movie fixture saved:', dest);
}

/**
 * This function will generate `tools/fixtures/orgs.json` from local Firestore
 */
async function generateOrgs(db: FirebaseFirestore.Firestore) {
  console.log('Generating orgs fixtures file from Firestore...');

  console.time('Fetching orgs from Firestore');
  const { docs } = await db.collection('orgs').get();
  const orgs =  docs.map(d => d.data() as Organization);
  console.timeEnd('Fetching orgs from Firestore');

  const output: Partial<Organization>[] = orgs.map((org) => ({
    id: org.id,
    denomination: org.denomination,
    description: org.description,
    email: org.email,
    appAccess: org.appAccess,
    userIds: org.userIds,
  }));
  const dest = join(process.cwd(), 'tools', 'fixtures', 'orgs.json');
  await fsPromises.writeFile(dest, JSON.stringify(output));
  console.log('Orgs fixture saved:', dest);
}

async function generateStaticUsers(db: FirebaseFirestore.Firestore) {
  console.log('Generating static user fixtures...');

  for (const userType in staticUsers) {
    try {
      const doc = await db.doc(`users/${staticUsers[userType]}`).get();
      const { email, uid } = doc.data() as User;
      console.log(`User type: ${userType} found! UID: ${uid}`)
      staticUsers[userType] = { uid, email, password: USER_FIXTURES_PASSWORD }
    } catch (e) {
      console.log(`Failed to find: ${userType} : ${staticUsers[userType]}`)
    }
  }

  const dest = join(process.cwd(), 'tools', 'fixtures', 'static-users.json');
  await fsPromises.writeFile(dest, JSON.stringify(staticUsers));
  console.log('Static user fixture saved:', dest);
}
