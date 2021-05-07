import { createMandate } from "../../contract/+state/contract.model";
import { availableTerritories, toTerritoryMarker } from "./../avails";
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form'
import { createTerm } from "../../term/+state/term.model";

describe('availableTerritories', () => {

  it('France should stay available', () => {
    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['TermA'],
    });

    const availsForm = new AvailsForm({ territories: [] }, ['duration']);
    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('06/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(true);

    const term = createTerm({ id: 'TermA', contractId: mandate.id });
    term.duration.from = new Date('01/01/2020');
    term.duration.to = new Date('01/01/2030');
    term.medias = ['theatrical'];
    term.territories = ['france'];
    term.exclusive = true;

    const selected = toTerritoryMarker('germany', 'A', [mandate]);
    const available = availableTerritories([selected], [], [], availsForm.value, [mandate], [term]);


    expect(available.length).toBe(1);
    expect(available[0].slug).toBe('france');
  });


  it('France is already selected, not available', () => {
    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['TermA'],
    });

    const availsForm = new AvailsForm({ territories: [] }, ['duration']);
    availsForm.get('duration').get('from').setValue(new Date('06/01/2021'));
    availsForm.get('duration').get('to').setValue(new Date('06/01/2021'));
    availsForm.get('medias').setValue(['theatrical']);
    availsForm.get('exclusive').setValue(true);

    const term = createTerm({ id: 'TermA', contractId: mandate.id });
    term.duration.from = new Date('01/01/2020');
    term.duration.to = new Date('01/01/2030');
    term.medias = ['theatrical'];
    term.territories = ['france'];
    term.exclusive = true;

    const selected = toTerritoryMarker('france', 'A', [mandate]);
    const available = availableTerritories([selected], [], [], availsForm.value, [mandate], [term]);

    expect(available.length).toBe(0);
  });


})

