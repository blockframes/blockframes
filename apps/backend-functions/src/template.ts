import { getCollection, getCount, Organization } from './utils';
import { db, serverTimestamp } from './firebase';
import { WriteBatch, FieldValue, Timestamp } from '@google-cloud/firestore';
import { Material } from './material';

interface Template {
  id: string;
  orgId: string;
  materialsId: string[];
  created: FieldValue | Timestamp;
}

async function migrateMaterialsToNewCollection(
  batch: WriteBatch,
  template: Template,
  materials: Material[]
) {
  const promises = materials.map(async material => {
    if (template.materialsId.includes(material.id)) {
      const materialDoc = await db.doc(`templates/${template.id}/materials/${material.id}`).get();
      batch.set(materialDoc.ref, material);
    }
  });
  return Promise.all(promises);
}

async function migrateTemplateToNewCollection(
  batch: WriteBatch,
  org: Organization,
  template: Template
) {
  delete template.materialsId;
  template = { ...template, orgId: org.id, created: serverTimestamp() };
  const templateDoc = await db.doc(`templates/${template.id}`).get();
  batch.set(templateDoc.ref, template);
}

async function migrateOrgsTemplate(batch: WriteBatch, org: Organization): Promise<any> {
  const templates = await getCollection<Template>(`orgs/${org.id}/templates`);
  const materials = await getCollection<Material>(`orgs/${org.id}/materials`);

  const promises = templates.map(async template => {
    await migrateTemplateToNewCollection(batch, org, template);
    await migrateMaterialsToNewCollection(batch, template, materials);
  });

  return Promise.all(promises);
}

export async function copyTemplates() {
  const batch = db.batch();
  const orgs = await getCollection<Organization>(`orgs`);
  const promises = orgs.map(org => migrateOrgsTemplate(batch, org));
  await Promise.all(promises);
  return batch.commit();
}



export async function deleteTemplates() {
  const batch = db.batch();
  const orgs = await getCollection<Organization>(`orgs`);
  const promises = orgs.map(async org => {
    const nbTemplates = await getCount(`orgs/${org.id}/templates`);
    const nbMaterials = await getCount(`orgs/${org.id}/materials`);

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
