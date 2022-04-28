import { generateUsers, generateMovies, generateOrgs } from '@blockframes/devops';

export async function generateFixtures(db: FirebaseFirestore.Firestore) {
  await generateUsers(db);
  await generateMovies(db);
  await generateOrgs(db);
}