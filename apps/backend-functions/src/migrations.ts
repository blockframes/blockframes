import { getCollection, getCount } from './data/internals';
import { OrganizationDocument, MaterialDocument } from './data/types';
import { db, serverTimestamp } from './internals/firebase';
import { WriteBatch, FieldValue, Timestamp } from '@google-cloud/firestore';
import { setRestoreFlag } from './backup';

// TODO: Move this to shared library
interface Template {
  id: string;
  orgId: string;
  materialsId: string[];
  created: FieldValue | Timestamp;
}

/*
  UpdateToV2:
  ===========

  The following functions move Templates from Organizations (/orgs/orgID/templates)
  to a root collection for Templates (/templates).

  It also moves the Material collection from Organizations (/orgs/orgID/materials) to a
  template sub-collection (/templates/templateID/materials)
*/

function migrateMaterialToNewCollection(
  batch: WriteBatch,
  template: Template,
  material: MaterialDocument
) {
  if (template.materialsId.includes(material.id)) {
    const materialRef = db.doc(`templates/${template.id}/materials/${material.id}`);
    batch.set(materialRef, material);
  }
}

function migrateTemplateToNewCollection(
  batch: WriteBatch,
  org: OrganizationDocument,
  template: Template
) {
  const newTemplate = { ...template, orgId: org.id, created: serverTimestamp() };
  delete newTemplate.materialsId;
  const templateRef = db.doc(`templates/${template.id}`);
  batch.set(templateRef, newTemplate);
}

async function migrateOrgsTemplate(batch: WriteBatch, org: OrganizationDocument): Promise<void> {

  const [templates, materials] = await Promise.all([
    getCollection<Template>(`orgs/${org.id}/templates`),
    getCollection<MaterialDocument>(`orgs/${org.id}/materials`)
  ]);

  templates.forEach(template => {
    migrateTemplateToNewCollection(batch, org, template);

    materials.forEach(material => {
      migrateMaterialToNewCollection(batch, template, material);
    });
  });
}

export async function copyTemplates() {
  const batch = db.batch();
  const orgs = await getCollection<OrganizationDocument>(`orgs`);
  const promises = orgs.map(org => migrateOrgsTemplate(batch, org));
  await Promise.all(promises);
  return batch.commit();
}

export async function deleteTemplates() {
  const batch = db.batch();
  const orgs = await getCollection<OrganizationDocument>(`orgs`);
  const promises = orgs.map(async org => {
    const [nbTemplates, nbMaterials] = await Promise.all([
      getCount(`orgs/${org.id}/templates`),
      getCount(`orgs/${org.id}/materials`)
    ]);

    if (nbTemplates > 0) {
      const templates = await db.collection(`orgs/${org.id}/templates`).get();
      templates.forEach(doc => batch.delete(doc.ref));
    }

    if (nbMaterials > 0) {
      const materials = await db.collection(`orgs/${org.id}/materials`).get();
      materials.forEach(doc => batch.delete(doc.ref));
    }
  });
  await Promise.all(promises);
  return batch.commit();
}

export async function updateToV2(req: any, resp: any) {
  await setRestoreFlag();
  await copyTemplates();
  await deleteTemplates();
  return resp.status(200).send('success');
}
