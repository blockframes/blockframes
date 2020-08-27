import { getCollection } from '@blockframes/firebase-utils';
import { User } from '@blockframes/user/types';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { USER_FIXTURES_PASSWORD } from './users';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { Organization } from '@blockframes/organization/+state/organization.model';

export async function generateFixtures() {
  await generateUsers();
  await generateMovies();
  await generateOrgs();
}

/**
 * This function will generate `tools/fixtures/users.json` from users currently in Firestore
 */
async function generateUsers() {
  console.log('Generating user fixtures file from Firestore...');

  console.time('Fetching users from Firestore');
  const users = await getCollection<User>('users');
  console.timeEnd('Fetching users from Firestore');

  const output = users.map((user) => ({
    email: user.email,
    uid: user.uid,
    password: USER_FIXTURES_PASSWORD,
  }));
  const dest = join(process.cwd(), 'tools', 'fixtures', 'users.json');
  await fsPromises.writeFile(dest, JSON.stringify(output));
  console.log('Fixture saved:', dest);
}

/**
 * This function will generate `tools/fixtures/movies.json` from users currently in Firestore
 */
async function generateMovies() {
  console.log('Generating movie fixtures file from Firestore...');

  console.time('Fetching movies from Firestore');
  const movies = await getCollection<Movie>('movies');
  console.timeEnd('Fetching movies from Firestore');

  const output: Partial<Movie>[] = movies.map((movie) => ({
    id: movie.id,
    main: movie.main,
  }));
  const dest = join(process.cwd(), 'tools', 'fixtures', 'movies.json');
  await fsPromises.writeFile(dest, JSON.stringify(output));
  console.log('Fixture saved:', dest);
}

/**
 * This function will generate `tools/fixtures/orgs.json` from users currently in Firestore
 */
async function generateOrgs() {
  console.log('Generating orgs fixtures file from Firestore...');

  console.time('Fetching orgs from Firestore');
  const orgs = await getCollection<Organization>('orgs');
  console.timeEnd('Fetching orgs from Firestore');

  const output: Partial<Organization>[] = orgs.map((org) => ({
    movieIds: org.movieIds,
    appAccess: org.appAccess,
    userIds: org.userIds,
  }));
  const dest = join(process.cwd(), 'tools', 'fixtures', 'orgs.json');
  await fsPromises.writeFile(dest, JSON.stringify(output));
  console.log('Fixture saved:', dest);
}
