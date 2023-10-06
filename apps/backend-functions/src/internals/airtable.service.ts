import Airtable, { FieldSet, Records, Record as AirtableRecord } from 'airtable';
import { AirtableBase } from 'airtable/lib/airtable_base';
import { airtable, airtableToken } from './../environments/environment';

interface AirtableUpdate {
  airtableId: string;
  update: Record<string, any>;
}

export class AirtableService {
  private airtableBase: AirtableBase;
  private getBase(){
    if (!this.airtableBase) this.airtableBase = new Airtable({ apiKey: airtableToken }).base(airtable.baseId);
    return this.airtableBase;
  }

  async create(tableId: string, records: Record<string, any> | Record<string, any>[]) {
    const base = this.getBase();
    if (!Array.isArray(records)) records = [records];
    const rows = records.map(r => ({ fields: r }));
    const createAll = [];
    const chunkSize = 10;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      createAll.push(base(tableId).create(chunk, { typecast: true }));
    }
    const result = (await Promise.all(createAll)).flat();
    const tableName = getTableName(tableId);
    return `${result.length} rows injected to ${tableName} table.`;
  }

  async get(tableId: string) {
    const base = this.getBase();
    const result = await base(tableId).select().all();
    return result;
  }
  
  async delete(tableId: string, recordIds: string | string[]) {
    const tableName = getTableName(tableId);
    if (!recordIds.length) return `0 rows deleted from ${tableName} table.`;
    const base = this.getBase();
    if (!Array.isArray(recordIds)) recordIds = [recordIds];
    const deleteAll = [];
    const chunkSize = 10;
    for (let i = 0; i < recordIds.length; i += chunkSize) {
      const chunkIds = recordIds.slice(i, i + chunkSize);
      deleteAll.push(base(tableId).destroy(chunkIds));
    }
    await Promise.all(deleteAll);
    return `${recordIds.length} rows deleted from ${tableName} table.`;
  }

  async deleteAll(tableId: string) {
    const base = this.getBase();
    const records = await base(tableId).select().all();
    const recordIds = records.map(r => r.id);
    await this.delete(tableId, recordIds);
    const tableName = getTableName(tableId);
    return `${records.length} rows deleted from ${tableName} table.`;
  }

  // Updates an airtable record, only updating the given fields (others stay intact)
  async update(tableId: string, updates: AirtableUpdate[]) {
    const tableName = getTableName(tableId);
    if (!updates.length) return `0 rows updated in ${tableName} table.`;
    const base = this.getBase();
    const rows = updates.map(u => ({ id: u.airtableId, fields: u.update }));
    const updateAll = [];
    const chunkSize = 10;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      updateAll.push(base(tableId).update(chunk, { typecast: true }));
    }
    await Promise.all(updateAll);
    return `${updates.length} rows updated in ${tableName} table.`;
  }

  // Retrieves airtable data, compares it with firebase, deletes obsolete records, creates news ones and updates records where needed
  async synchronize(tableId: string, firebaseRecords: Record<string, any>[], uniqueKeysCombination: string | string[], options = { verbose: false }) {
    if (!Array.isArray(uniqueKeysCombination)) uniqueKeysCombination = [uniqueKeysCombination];
    const tableName = getTableName(tableId);

    // Retrieves data from airtable's table
    const airtableRecords = await this.get(tableId);

    //* The commented block below serves for testing purpose.

    // First run will hide some records from firebaseRecords.
    // Firebase being the source of truth, the equivalent record in airtable will be considered obsolete and deleted.

    // During second run, as we check the newRecords without the obsoleteSimulation(), the records that
    // have been deleted from airtable in the first run will now be considered as new ones and injected back.

    /*
    function obsoleteSimulation(tableId: string, records: Record<string, any>[]) {
      switch (tableId) {
        case tables.users:
          return records.filter(r => !r['filtered Avails Map']);
        case tables.orgs:
          return records.filter(r => r['memberCount'] <= 15);
        case tables.titles:
          return records.filter(r => !r['expected premiere']);
        case tables.events:
          return records.filter(r => r['event name'] !== 'Zero Fucks Given');
        case tables.contracts:
          return records.filter(r => r['status'] !== 'New');
        case tables.offers:
          return records.filter(r => r['# of title'] < 8);
        case tables.buckets:
          return records.filter(r => r['# of title'] !== 1);
        case tables.titleAnalytics:
          return records.filter(r => !r['screener requested']);
        case tables.orgAnalytics:
          return records.filter(r => r['lastName'] !== 'Bossenmeyer');
        case tables.searchAnalytics:
          return records.filter(r => r['genres'] !== 'Fantasy');
        case tables.movieAnalytics:
          return records.filter(r => !r['filtered Avails Calendar']);
        default:
          return records;
      }
    }

    const obsoleteRecords = getObsoleteRecords(airtableRecords, obsoleteSimulation(tableId, firebaseRecord), uniqueKeysCombination);
    */
    //* end of testing block

    //* comment line below for obsolete simultation testing
    const obsoleteRecords = getObsoleteRecords(airtableRecords, firebaseRecords, uniqueKeysCombination);
    if (options.verbose) console.log(`Obsolete records to be deleted from ${tableName} table :`, obsoleteRecords);

    const newRecords = getNewRecords(airtableRecords, firebaseRecords, uniqueKeysCombination);
    if (options.verbose) console.log(`New records to be injected in ${tableName} table :`, newRecords);

    const updates = getUpdates(getRecordChanges(airtableRecords, firebaseRecords, uniqueKeysCombination));
    if (options.verbose) console.log(`Records to be updated in ${tableName} table :`, updates);

    const deletion = await this.delete(tableId, obsoleteRecords.map(r => r.id));
    if (options.verbose) console.log(deletion);

    const creation = await this.create(tableId, newRecords);
    if (options.verbose) console.log(creation);

    const update = await this.update(tableId, updates);
    if (options.verbose) console.log(update);

    return `Synchronization of ${tableName} table completed.`;
  }

  // If needed, erases all a table before populating it again
  async replaceAll(tableId: string, records: Record<string, any>[]) {
    const deletion = await this.deleteAll(tableId);
    console.log(deletion);

    const creation = await this.create(tableId, records);
    console.log(creation);
  }
}

//* Helpers

//? What are uniqueKeysCombination ?
// A combination of properties that ensures unique identification of each record
// Most of the time it will only be defined by one field, but sometimes we have up to 3

// Returns airtable's records that are unknown in firebase => will be deleted from airtable
function getObsoleteRecords(
  airtableRecords: Records<FieldSet>,
  firebaseRecord: Record<string, any>[],
  uniqueKeysCombination: string[]
) {
  const obsoleteRecords = airtableRecords.filter(
    previousRecord =>
      !firebaseRecord.some(record => uniqueKeysCombination.every(key => equalValues(record[key], previousRecord.fields[key])))
  );
  return obsoleteRecords;
}

// Returns firebase's records that are unknown in airtable => will be created in airtable
function getNewRecords(
  airtableRecords: Records<FieldSet>,
  firebaseRecord: Record<string, any>[],
  uniqueKeysCombination: string[]
) {
  const newRecords = firebaseRecord.filter(
    record =>
      !airtableRecords.some(previousRecord =>
        uniqueKeysCombination.every(key => equalValues(record[key], previousRecord.fields[key]))
      )
  );
  return newRecords;
}

// For records known in airtable and firebase, returns airtable's record id and what is new from firebase record
function getRecordChanges(
  airtableRecords: Records<FieldSet>,
  firebaseRecords: Record<string, any>[],
  uniqueKeysCombination: string[]
) {
  const recordChanges = airtableRecords
    .filter(airtableRecord =>
      firebaseRecords.some(
        firebaseRecord =>
          // True if unique keys combination have the same values => same record in airtable and firebase
          uniqueKeysCombination.every(key => equalValues(firebaseRecord[key], airtableRecord.fields[key])) &&
          Object.keys(firebaseRecord).some(
            // False if any keys have a different value between airtable and firebase records
            key =>
              !equalValues(firebaseRecord[key], airtableRecord.fields[key]) &&
              // Ensures that a difference is not caused by having two different falsies (null from firebase vs undefined from airtable)
              !(!firebaseRecord[key] && !airtableRecord.fields[key])
          )
      )
    )
    .map(airtableRecord => ({
      // Returns airtable record, from which we will use the id to target the update properly
      airtableRecord,
      // Returns firebase record, from which we will later extract the fields to be updated
      updateRecord: firebaseRecords.find(firebaseRecord =>
        uniqueKeysCombination.every(key => equalValues(firebaseRecord[key], airtableRecord.fields[key]))
      ),
    }));
  return recordChanges;
}

// Compares records from airtable and firebase and return an object with all unmatching data (update values)
function getFieldUpdates(airtableRecord: Record<string, any>, firebaseRecord: Record<string, any>) {
  const updatesArray = Object.entries(firebaseRecord).map(([key, value]) => {
    if (!equalValues(firebaseRecord[key], airtableRecord[key]) && !(!firebaseRecord[key] && !airtableRecord[key])) {
      return { [key]: value };
    }
  });
  const updatesObject = updatesArray.reduce((update, obj) => Object.assign(update, obj), {});
  return updatesObject;
}

function getUpdates(
  recordChanges: {
    airtableRecord: AirtableRecord<FieldSet>;
    updateRecord: Record<string, any>;
  }[]
): AirtableUpdate[] {
  const updates = recordChanges.map(c => ({
    airtableId: c.airtableRecord.id, // targets airtable record
    update: getFieldUpdates(c.airtableRecord.fields, c.updateRecord), // contains the fields to be updated
  }));
  return updates;
}

function getTableName(tableId: string) {
  return Object.keys(airtable.tables).find(k => airtable.tables[k] === tableId);
}

function equalValues(value1, value2) {
  // JSON.stringify is important, because airtable sends us dates as string, instead of Date like firebase
  return JSON.stringify(value1) === JSON.stringify(value2);
}
