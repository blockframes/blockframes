import { createMandate } from "../../contract/+state/contract.model";
import { toTerritoryMarker } from "./../avails";
import { BucketForm } from '@blockframes/contract/bucket/form'
import { createTerm } from "../../term/+state/term.model";
import { AvailsForm } from "../form/avails.form";

describe('BucketForm', () => {

  it('Add 2 territories to same contract bucket', () => {
    const bucketForm = new BucketForm();
    const availsForm = new AvailsForm({ territories: [] }, ['duration']);

    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('12/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(true);

    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const term = createTerm({ id: 'termA', contractId: mandate.id });
    term.duration.from = new Date('01/01/2020');
    term.duration.to = new Date('01/01/2030');
    term.medias = ['theatrical'];
    term.territories = ['france', 'germany'];
    term.exclusive = true;

    const selected1 = toTerritoryMarker('germany', 'MandateA', [mandate], term);
    bucketForm.addTerritory(availsForm.value, selected1);

    const selected2 = toTerritoryMarker('france', 'MandateA', [mandate], term);
    bucketForm.addTerritory(availsForm.value, selected2);

    expect(bucketForm.value.contracts.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms[0].territories.length).toBe(2);
  });

  it('Add 2 territories from various mandates resulting in 2 disctinct contracts in bucket', () => {
    const bucketForm = new BucketForm();
    const availsForm = new AvailsForm({ territories: [] }, ['duration']);

    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('12/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(true);

    const mandateA = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const termA = createTerm({ id: 'termA', contractId: mandateA.id });
    termA.duration.from = new Date('01/01/2020');
    termA.duration.to = new Date('01/01/2030');
    termA.medias = ['theatrical'];
    termA.territories = ['france','australia'];
    termA.exclusive = true;

    const mandateB = createMandate({
      id: 'MandateB',
      termIds: ['termB'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const termB = createTerm({ id: 'termB', contractId: mandateB.id });
    termA.duration.from = new Date('01/01/2020');
    termA.duration.to = new Date('01/01/2030');
    termA.medias = ['theatrical'];
    termA.territories = ['germany','india'];
    termA.exclusive = true;

    const selected1 = toTerritoryMarker('france', 'MandateA', [mandateA], termA);
    bucketForm.addTerritory(availsForm.value, selected1);

    const selected2 = toTerritoryMarker('germany', 'MandateB', [mandateB], termB);
    bucketForm.addTerritory(availsForm.value, selected2);

    expect(bucketForm.value.contracts.length).toBe(2);
    expect(bucketForm.value.contracts[0].terms.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms[0].territories.length).toBe(1);
    expect(bucketForm.value.contracts[0].terms[0].territories[0]).toBe('france');

    expect(bucketForm.value.contracts[1].terms.length).toBe(1);
    expect(bucketForm.value.contracts[1].terms[0].territories.length).toBe(1);
    expect(bucketForm.value.contracts[1].terms[0].territories[0]).toBe('germany');
  });

  it('Removes territories from selection', () => {
    const bucketForm = new BucketForm();
    const availsForm = new AvailsForm({ territories: [] }, ['duration']);

    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('12/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(true);

    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
      titleId: 'titleA',
      sellerId: 'orgA'
    });

    const term = createTerm({ id: 'termA', contractId: mandate.id });
    term.duration.from = new Date('01/01/2020');
    term.duration.to = new Date('01/01/2030');
    term.medias = ['theatrical'];
    term.territories = ['france', 'germany'];
    term.exclusive = true;

    const selected1 = toTerritoryMarker('germany', 'MandateA', [mandate], term);
    bucketForm.addTerritory(availsForm.value, selected1);

    const selected2 = toTerritoryMarker('france', 'MandateA', [mandate], term);
    bucketForm.addTerritory(availsForm.value, selected2);

    expect(bucketForm.isAlreadyInBucket(availsForm.value, selected1)).toBe(true);
    expect(bucketForm.isAlreadyInBucket(availsForm.value, selected2)).toBe(true);

    bucketForm.removeTerritory(availsForm.value, selected2);
    expect(bucketForm.isAlreadyInBucket(availsForm.value, selected2)).toBe(false);

    bucketForm.removeTerritory(availsForm.value, selected1);
    expect(bucketForm.isAlreadyInBucket(availsForm.value, selected1)).toBe(false);
  
    expect(bucketForm.value.contracts[0].terms.length).toBe(0);
  });
})

