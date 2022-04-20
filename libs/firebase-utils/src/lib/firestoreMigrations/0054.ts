import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';
import { StorageFile } from '@blockframes/model';
import { privacies } from '@blockframes/utils/file-sanitizer';

function createStorageFile(data: StorageFile) {
  if (data.ref) delete data.ref;
  if (data.storagePath) {
    // Removing privacy prefix
    const elements = data.storagePath.split('/');
    if (privacies.some(privacy => privacy === elements[0])) {
      elements.shift();
    }
    data.storagePath = elements.join('/');
  } else {
    data.storagePath = ''
  }
  
  return data;
}

/**
 * File Migration - Issue #4881
*/
export async function upgrade(db: Firestore) {

  // ORG
  const orgs = await db.collection('orgs').get();
  await runChunks(orgs.docs, async (orgDoc) => {
    const data = orgDoc.data();

    // documents.notes
    if (data.documents) {
      data.documents.notes = data.documents.notes.map(note => {
        return createStorageFile({
          storagePath: note.ref,
          privacy: 'protected',
          collection: 'orgs',
          docId: data.id,
          field: `documents.notes`,
          ...note
        });
      })
    }
    // logo
    data.logo = createStorageFile({
      storagePath: data.logo,
      privacy: 'public',
      collection: 'orgs',
      docId: data.id,
      field: 'logo',
    });

    await orgDoc.ref.set(data);
  })

  // MOVIE
  const movies = await db.collection('movies').get()
  await runChunks(movies.docs, async (movieDoc) => {
    const data = movieDoc.data();

    const fields = ['poster', 'banner'];
    fields.forEach(field => {
      data[field] = createStorageFile({
        storagePath: data[field],
        privacy: 'public',
        collection: 'movies',
        docId: data.id,
        field
      })
    })

    const promotionalFields = ['financialDetails', 'presentation_deck', 'scenario', 'moodboard'];
    promotionalFields.forEach(field => {
      data.promotional[field] = createStorageFile({
        storagePath: data.promotional[field],
        privacy: 'public',
        collection: 'movies',
        docId: data.id,
        field: `promotional.${field}`
      })
    })

    // promotional.still_photo
    data.promotional.still_photo = data.promotional.still_photo.map(still => createStorageFile({
      storagePath: still,
      privacy: 'public',
      collection: 'movies',
      docId: data.id,
      field: `promotional.still_photo`
    }));

    // promotional.salesPitch
    if (data.promotional.salesPitch) {
      data.promotional.salesPitch = createStorageFile({
        storagePath: data.promotional.salesPitch.ref,
        privacy: 'public',
        collection: 'movies',
        docId: data.id,
        field: `promotional.salesPitch`,
        ...data.promotional.salesPitch
      })
    }
  
    if (data.promotional.videos) {
      // promotional.videos.screener
      if (data.promotional.videos.screener) {
        data.promotional.videos.screener = createStorageFile({
          storagePath: data.promotional.videos.screener.ref,
          privacy: 'protected',
          collection: 'movies',
          docId: data.id,
          field: `promotional.videos.screener`,
          ...data.promotional.videos.screener
        });
      }

      // promotional.videos.otherVideos
      if (data.promotional.videos.otherVideos) {
        data.promotional.videos.otherVideos = data.promotional.videos.otherVideos.map(video => createStorageFile({
          storagePath: video.ref,
          privacy: 'public',
          collection: 'movies',
          docId: data.id,
          field: `promotional.videos.otherVideos`,
          ...video
        }));
      }
    }

    // promotional.notes
    if (data.promotional.notes) {
      data.promotional.notes = data.promotional.notes.map(note => createStorageFile({
        storagePath: note.ref,
        privacy: 'public',
        collection: 'movies',
        docId: data.id,
        field: `promotional.notes`,
        ...note
      }))
    }

    await movieDoc.ref.set(data);
  })

  // CAMPAIGN
  const campaigns = await db.collection('campaigns').get();
  await runChunks(campaigns.docs, async (campaignDoc) => {
    const data = campaignDoc.data();

    const fields = ['budget', 'financingPlan', 'waterfall'];
    fields.forEach(field => {
       data.files[field] = createStorageFile({
        storagePath: data.files[field],
        privacy: 'public',
        collection: 'campaigns',
        docId: data.id,
        field: `files.${field}`
      })
    })

    await campaignDoc.ref.set(data);
  })

  // USER
  const users = await db.collection('users').get();
  await runChunks(users.docs, async (userDoc) => {
    const data = userDoc.data();

    const fields = ['avatar', 'watermark'];
    fields.forEach(field => {
      data[field] = createStorageFile({
        storagePath: data[field],
        privacy: 'public',
        collection: 'users',
        docId: data.uid,
        field
      })
    })

    await userDoc.ref.set(data)
  });

  // INVITATION
  const invitations = await db.collection('invitations').get();
  await runChunks(invitations.docs, async (invitationDoc) => {
    const data = invitationDoc.data();

    const orgFields = ['fromOrg', 'toOrg'];
    orgFields.forEach(field => {
      if (data[field]) {
        data[field].logo = createStorageFile({
          storagePath: data[field].logo,
          privacy: 'public',
          collection: 'orgs',
          docId: data[field].id,
          field: 'logo'
        })
      }
    });

    const userFields = ['fromUser', 'toUser'];
    const userMediaFields = ['avatar', 'watermark'];
    userFields.forEach(field => {

      if (data[field]) {
        userMediaFields.forEach(mediaField => {

          data[field][mediaField] = createStorageFile({
            storagePath: data[field][mediaField],
            privacy: 'public',
            collection: 'users',
            docId: data[field].uid,
            field: mediaField
          });

        });
      }
    });

    await invitationDoc.ref.set(data);
  });

  // CMS
  const cms = await db.collection('cms/festival/home').get();
  await runChunks(cms.docs, async (cmsDoc) => {
    const data = cmsDoc.data();

    data.sections.forEach((section, i) => {
      if (section._type === 'banner') {

        const fields = ['background', 'image'];
        fields.forEach(field => {
          section[field] = createStorageFile({
            storagePath: section[field],
            collection: 'cms/festival/home',
            docId: cmsDoc.id,
            field: `section[${i}].${field}`,
            privacy: 'public'
          });
        });
      }

      if (section._type === 'hero') {
        section.background = createStorageFile({
          storagePath: section.background,
          collection: 'cms/festival/home',
          docId: cmsDoc.id,
          field: `section[${i}].background`,
          privacy: 'public'
        });
      }
    });
    await cmsDoc.ref.set(data);
  })
}