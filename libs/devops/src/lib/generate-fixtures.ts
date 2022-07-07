import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { USER_FIXTURES_PASSWORD } from './firebase-utils/anonymize/util';
import type { Movie, Organization, User } from '@blockframes/model';

export async function generateFixtures(db: FirebaseFirestore.Firestore) {
  await generateUsers(db);
  await generateMovies(db);
  await generateOrgs(db);
}
/**
 * This function will generate `tools/fixtures/users.json` from local Firestore
 */
async function generateUsers(db: FirebaseFirestore.Firestore) {
  console.log('Generating user fixtures file from Firestore...');

  console.time('Fetching users from Firestore');
  const { docs } = await db.collection('users').get();
  const users = docs.map((d) => d.data() as User);
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
  const movies = docs.map((d) => d.data() as Movie);
  console.timeEnd('Fetching movies from Firestore');

  const output: Partial<Movie>[] = movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    app: movie.app,
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
  const orgs = docs.map((d) => d.data() as Organization);
  console.timeEnd('Fetching orgs from Firestore');

  const output: Partial<Organization>[] = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    description: org.description,
    email: org.email,
    appAccess: org.appAccess,
    userIds: org.userIds,
  }));
  const dest = join(process.cwd(), 'tools', 'fixtures', 'orgs.json');
  await fsPromises.writeFile(dest, JSON.stringify(output));
  console.log('Orgs fixture saved:', dest);
}
