import { createMandate } from "../../contract/+state/contract.model";
import { availableTerritories, getMandateTerms, getSoldTerms, toTerritoryMarker } from "./../avails";
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form'
import { createTerm } from "../../term/+state/term.model";

describe('availableTerritories', () => {

  it('France should stay available', () => {
    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
    });

    const availsForm = new AvailsForm({ territories: [] }, ['duration']);
    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('12/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(true);

    const term = createTerm({ id: 'termA', contractId: mandate.id });
    term.duration.from = new Date('01/01/2020');
    term.duration.to = new Date('01/01/2030');
    term.medias = ['theatrical'];
    term.territories = ['france', 'germany', 'greece'];
    term.exclusive = true;

    const selected = toTerritoryMarker('germany', 'MandateA', [mandate], term);
    const sold = toTerritoryMarker('greece', 'MandateA', [mandate], term);
    const available = availableTerritories([selected], [sold], [], availsForm.value, [mandate], [term]);

    expect(available.length).toBe(1);
    expect(available[0].slug).toBe('france');
    expect(available[0].contract.id).toBe('MandateA');
  });


  it('France is already selected, not available', () => {
    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
    });

    const availsForm = new AvailsForm({ territories: [] }, ['duration']);
    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('12/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(true);

    const term = createTerm({ id: 'termA', contractId: mandate.id });
    term.duration.from = new Date('01/01/2020');
    term.duration.to = new Date('01/01/2030');
    term.medias = ['theatrical'];
    term.territories = ['france'];
    term.exclusive = true;

    const selected = toTerritoryMarker('france', 'MandateA', [mandate], term);
    const available = availableTerritories([selected], [], [], availsForm.value, [mandate], [term]);

    expect(available.length).toBe(0);
  });

  it('Return sold terms according to availsForm values', () => {

    const availsForm = new AvailsForm({ territories: [] }, ['duration']);
    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('12/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(true);

    const termA = createTerm({ id: 'termA' });
    termA.duration.from = new Date('01/01/2020');
    termA.duration.to = new Date('01/01/2030');
    termA.medias = ['theatrical'];
    termA.territories = ['france'];
    termA.exclusive = true;

    const termB = createTerm({ id: 'termB' });
    termB.duration.from = new Date('12/30/2021');
    termB.duration.to = new Date('01/01/2030');
    termB.medias = ['theatrical'];
    termB.territories = ['germany'];
    termB.exclusive = true;

    const termC = createTerm({ id: 'termC' });
    termC.duration.from = new Date('01/01/2020');
    termC.duration.to = new Date('01/01/2030');
    termC.medias = ['rental'];
    termC.territories = ['france'];
    termC.exclusive = true;

    const termD = createTerm({ id: 'termD' });
    termD.duration.from = new Date('07/01/2020');
    termD.duration.to = new Date('01/01/2022');
    termD.medias = ['theatrical'];
    termD.territories = ['france'];
    termD.exclusive = true;

    const soldTerms = getSoldTerms(availsForm.value, [termA, termB, termC, termD]);

    expect(soldTerms.length).toBe(2);
    expect(soldTerms[0].id).toBe('termA');
    expect(soldTerms[1].id).toBe('termD');
  });


  it('When getting sold terms, should return none if not exclusive', () => {

    const availsForm = new AvailsForm({ territories: [] }, ['duration']);
    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('12/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(false);

    const termA = createTerm({ id: 'termA' });
    termA.duration.from = new Date('01/01/2020');
    termA.duration.to = new Date('01/01/2030');
    termA.medias = ['theatrical'];
    termA.territories = ['france'];
    termA.exclusive = false;

    const termB = createTerm({ id: 'termB' });
    termB.duration.from = new Date('12/30/2021');
    termB.duration.to = new Date('01/01/2030');
    termB.medias = ['theatrical'];
    termB.territories = ['germany'];
    termB.exclusive = false;

    const termC = createTerm({ id: 'termC' });
    termC.duration.from = new Date('01/01/2020');
    termC.duration.to = new Date('01/01/2030');
    termC.medias = ['rental'];
    termC.territories = ['france'];
    termC.exclusive = false;

    const termD = createTerm({ id: 'termD' });
    termD.duration.from = new Date('07/01/2020');
    termD.duration.to = new Date('01/01/2022');
    termD.medias = ['theatrical'];
    termD.territories = ['france'];
    termD.exclusive = false;

    const soldTerms = getSoldTerms(availsForm.value, [termA, termB, termC, termD]);

    expect(soldTerms.length).toBe(0);
  });


  it('Should return available terms mandate', () => {

    const availsForm = new AvailsForm({ territories: [] }, ['duration']);
    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('12/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(false);

    const termA = createTerm({ id: 'termA' });
    termA.duration.from = new Date('01/01/2020');
    termA.duration.to = new Date('01/01/2030');
    termA.medias = ['theatrical'];
    termA.territories = ['france', 'germany', 'australia', 'india'];
    termA.exclusive = false;

    const termB = createTerm({ id: 'termB' });
    termB.duration.from = new Date('01/01/2020');
    termB.duration.to = new Date('01/01/2027');
    termB.medias = ['theatrical'];
    termB.territories = ['france'];
    termB.exclusive = false;

    const termC = createTerm({ id: 'termC' });
    termC.duration.from = new Date('01/01/2020');
    termC.duration.to = new Date('01/01/2028');
    termC.medias = ['rental', 'theatrical'];
    termC.territories = ['france'];
    termC.exclusive = false;

    const termD = createTerm({ id: 'termD' });
    termD.duration.from = new Date('06/02/2021');
    termD.duration.to = new Date('01/01/2028');
    termD.medias = ['rental', 'theatrical'];
    termD.territories = ['france'];
    termD.exclusive = false;

    const mandateTerms = getMandateTerms(availsForm.value, [termA, termB, termC, termD]);
    expect(mandateTerms.length).toBe(3);
  });


})

