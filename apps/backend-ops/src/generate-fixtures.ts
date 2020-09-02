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
 * This function will generate `tools/fixtures/users.json` from local Firestore
 */
async function generateUsers() {
  console.log('Generating user fixtures file from Firestore...');

  console.time('Fetching users from Firestore');
  const users = await getCollection<User>('users');
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
 * TODO: update movie fixture generator once model changes #3582
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
  console.log('Movie fixture saved:', dest);
}

/**
 * This function will generate `tools/fixtures/orgs.json` from local Firestore
 */
async function generateOrgs() {
  console.log('Generating orgs fixtures file from Firestore...');

  console.time('Fetching orgs from Firestore');
  const orgs = await getCollection<Organization>('orgs');
  console.timeEnd('Fetching orgs from Firestore');

  const output: Partial<Organization>[] = orgs.map((org) => ({
    id: org.id,
    denomination: org.denomination,
    description: org.description,
    email: org.email,
    movieIds: org.movieIds,
    appAccess: org.appAccess,
    userIds: org.userIds,
  }));
  const dest = join(process.cwd(), 'tools', 'fixtures', 'orgs.json');
  await fsPromises.writeFile(dest, JSON.stringify(output));
  console.log('Orgs fixture saved:', dest);
}
