﻿import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';
import { Movie } from '@blockframes/movie/+state';
import { StoreStatus } from '@blockframes/utils/static-model';

describe('Movies Rules Tests', () => {
  const projectId = `movrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {
    const newMovieId = 'MI-007';
    const existMovieInDraft = 'MI-077';
    const existMovieAccepted = 'M001';
    const appConfig = {
      catalog: {
        status: <StoreStatus>'draft',
        access: false,
        refusedAt: null,
        acceptedAt: null
      },
      festival: {
        status: <StoreStatus>'draft',
        access: true,
        refusedAt: null,
        acceptedAt: null
      },
      financiers: {
        status: <StoreStatus>'draft',
        access: false,
        refusedAt: null,
        acceptedAt: null
      }
    };

    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    describe('Read Movie', () => {
      test('should be able to read movie with status draft', async () => {
        const movieRef = db.doc(`movies/${existMovieInDraft}`);
        await assertSucceeds(movieRef.get());
      });

      test('should be able to read movie with status accepted', async () => {
        const movieRef = db.doc(`movies/${existMovieAccepted}`);
        await assertSucceeds(movieRef.get());
      })
    });

    describe('Create Movie', () => {
      test('storestatus other than draft should not be able', async () => {
        const movieRef = db.doc(`movies/${newMovieId}`);
        const createdMovie: Partial<Movie> = {
          id: newMovieId,
          app: {
            ...appConfig,
            festival: {
              ...appConfig.festival, status: 'accepted'
            }
          },
        };
        await assertFails(movieRef.set(createdMovie));
      });

      test('without create permission for org should not be able', async () => {
        const newMovieTitleUnavailableId = 'MI-000';
        const movieRef = db.doc(`movies/${newMovieTitleUnavailableId}`);
        const createdMovie: Partial<Movie> = {
          id: newMovieTitleUnavailableId,
          app: appConfig,
        };
        await assertFails(movieRef.set(createdMovie));
      });

      test('with create permission for org, invalid id should not be able', async () => {
        const newMovieTitleUnavailableId = 'MI-000';
        const movieRef = db.doc(`movies/${newMovieId}`);
        const createdMovie: Partial<Movie> = {
          id: newMovieTitleUnavailableId,
          app: appConfig,
        };
        await assertFails(movieRef.set(createdMovie));
      });

      test('with create permission for org should be able', async () => {
        const createdMovie: Partial<Movie> = {
          id: newMovieId,
          app: appConfig,
        };
        const movieDoc = db.collection('movies').doc(newMovieId).set(createdMovie);
        await assertSucceeds(movieDoc);
      });
    });

    describe('Update Movie', () => {
      const fields: [string, unknown][] = [
        ['id', 'MI-0xx'],
        ['_meta', { createdBy: '' }],
        ['_meta', { createdAt: '' }],
        ['_type', 'drama'],
        ['app', { catalog: { access: true }}],
        ['app', { catalog: { status: 'rejected' }}],
        ['app', { festival: { access: {} }}],
      ];
      test.each(fields)("updating restricted '%s' field shouldn't be able", async (key, value) => {
        const movieRef = db.doc(`movies/${existMovieInDraft}`);
        const details = {};
        details[key] = value;
        await assertFails(movieRef.update(details));
      });

      test('user valid org, updating unrestricted field should be able', async () => {
        const movieRef = db.doc(`movies/${existMovieInDraft}`);
        const movieDetailsOther = { notes: 'update in unit-test' };
        await assertSucceeds(movieRef.update(movieDetailsOther));
      });
    });
  });

  describe('User with admin role', () => {
    const draftMovieId = 'MI-0d7';

    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    //TODO #4301
    test('should not be able to delete movie', async () => {
      const movieRef = db.doc(`movies/${draftMovieId}`);
      await assertFails(movieRef.delete());
    });
  });

  describe('With User not belonging to any org', () => {
    const newMovieId = 'MI-007';
    const draftMovieId = 'MI-0d7';
    const newMovieDetails = { id: `${newMovieId}` };

    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {
        uid: 'uid-peeptom',
      });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test("user without valid org shouldn't be able to read movie title", async () => {
      const movieRef = db.doc('movies/M001');
      await assertFails(movieRef.get());
    });

    test("user without valid org shouldn't be able to create movie title", async () => {
      const movieRef = db.doc(`movies/${newMovieId}`);
      await assertFails(movieRef.set(newMovieDetails));
    });

    test("user without valid org shouldn't be able to delete movie title", async () => {
      const movieRef = db.doc(`movies/${draftMovieId}`);
      await assertFails(movieRef.delete());
    });
  });

  describe('User not belonging to organization in movies.orgIds', () => {
    const draftMovieId = 'MI-077';
    const acceptedMovieId = 'M001';

    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {
        uid: 'uid-user3'
      })
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test("user without rights to edit movie shouldn't be able to read movie title when in draft", async () => {
      const movieRef = db.doc(`movies/${draftMovieId}`);
      await assertFails(movieRef.get());
    });

    test("user without rights to edit movie should be able to read movie title when accepted", async () => {
      const movieRef = db.doc(`movies/${acceptedMovieId}`);
      await assertSucceeds(movieRef.get())
    });
  });
});
