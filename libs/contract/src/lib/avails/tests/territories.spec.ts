import { createMandate } from "../../contract/+state/contract.model";
import { availableTerritories, getMandateTerms, getSoldTerms, toTerritoryMarker } from "./../avails";
import { createTerm } from "../../term/+state/term.model";
import { availDetailsExclusive, availDetailsNonExclusive } from './../fixtures/availsFilters';

describe.skip('Test availableTerritories pure function', () => {

  it('France should stay available', () => {
    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
    });

    const term = createTerm({
      id: 'termA',
      contractId: mandate.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france', 'germany', 'greece'],
      exclusive: true
    });

    const selected = toTerritoryMarker('germany', [mandate], term);
    const sold = toTerritoryMarker('greece', [mandate], term);
    const available = availableTerritories([selected], [sold], [], availDetailsExclusive, [mandate], [term]);

    expect(available.length).toBe(1);
    expect(available[0].slug).toBe('france');
    expect(available[0].contract.id).toBe('MandateA');
  });

  it('France is already selected, not available', () => {
    const mandate = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
    });

    const term = createTerm({
      id: 'termA',
      contractId: mandate.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france'],
      exclusive: true
    });

    const selected = toTerritoryMarker('france', [mandate], term);
    const available = availableTerritories([selected], [], [], availDetailsExclusive, [mandate], [term]);

    expect(available.length).toBe(0);
  });

  it('Return sold terms according to availsForm values', () => {
    const termA = createTerm({
      id: 'termA',
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france'],
      exclusive: true
    });

    const termB = createTerm({
      id: 'termB',
      duration: {
        from: new Date('12/30/2021'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['germany'],
      exclusive: true
    });

    const termC = createTerm({
      id: 'termC',
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['rental'],
      territories: ['france'],
      exclusive: true
    });

    const termD = createTerm({
      id: 'termD',
      duration: {
        from: new Date('07/01/2020'),
        to: new Date('01/01/2022')
      },
      medias: ['theatrical'],
      territories: ['france'],
      exclusive: true
    });

    const soldTerms = getSoldTerms(availDetailsExclusive, [termA, termB, termC, termD]);

    expect(soldTerms.length).toBe(2);
    expect(soldTerms[0].id).toBe('termA');
    expect(soldTerms[1].id).toBe('termD');
  });

  it('When getting sold terms, should return none if not exclusive', () => {
    const termA = createTerm({
      id: 'termA',
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france'],
      exclusive: false
    });

    const termB = createTerm({
      id: 'termB',
      duration: {
        from: new Date('12/30/2021'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['germany'],
      exclusive: false
    });

    const termC = createTerm({
      id: 'termC',
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['rental'],
      territories: ['france'],
      exclusive: false
    });

    const termD = createTerm({
      id: 'termD',
      duration: {
        from: new Date('07/01/2020'),
        to: new Date('01/01/2022')
      },
      medias: ['theatrical'],
      territories: ['france'],
      exclusive: false
    });

    const soldTerms = getSoldTerms(availDetailsNonExclusive, [termA, termB, termC, termD]);

    expect(soldTerms.length).toBe(0);
  });

  it('Should return available terms mandate', () => {
    const termA = createTerm({
      id: 'termA',
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france', 'germany', 'australia', 'india'],
      exclusive: false
    });

    const termB = createTerm({
      id: 'termB',
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2027')
      },
      medias: ['theatrical'],
      territories: ['france'],
      exclusive: false
    });

    const termC = createTerm({
      id: 'termC',
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['rental', 'theatrical'],
      territories: ['france'],
      exclusive: false
    });

    const termD = createTerm({
      id: 'termD',
      duration: {
        from: new Date('06/02/2021'),
        to: new Date('01/01/2028')
      },
      medias: ['rental', 'theatrical'],
      territories: ['france'],
      exclusive: false
    });

    const mandateTerms = getMandateTerms(availDetailsNonExclusive, [termA, termB, termC, termD]);
    expect(mandateTerms.length).toBe(3);
  });

  it('Test available territories with two non-exlusives mandates on same scope', () => {
    const mandateA = createMandate({
      id: 'MandateA',
      termIds: ['termA'],
    });

    const termA = createTerm({
      id: 'termA',
      contractId: mandateA.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france', 'germany'],
      exclusive: false
    });

    const mandateB = createMandate({
      id: 'MandateB',
      termIds: ['termB'],
    });

    const termB = createTerm({
      id: 'termB',
      contractId: mandateB.id,
      duration: {
        from: new Date('01/01/2020'),
        to: new Date('01/01/2030')
      },
      medias: ['theatrical'],
      territories: ['france', 'germany', 'greece'],
      exclusive: false
    });

    const available = availableTerritories([], [], [], availDetailsExclusive, [mandateA, mandateB], [termA, termB]);

    expect(available.length).toBe(5);
    // @TODO #5760 may need update if we choose to return only one marker per territory
    expect(available.filter(a => a.slug === 'france').length).toEqual(2);
    expect(available.filter(a => a.slug === 'greece').length).toEqual(1);
  });

  it('Territory marker should contain good contract', () => {
    const mandateA = createMandate({ id: 'MandateA', termIds: ['termA'] });
    const mandateB = createMandate({ id: 'MandateB', termIds: ['termB'] });

    const termA = createTerm({
      id: 'termA',
      contractId: mandateA.id,
      territories: ['france', 'germany'],
      exclusive: false
    });

    const selectedA = toTerritoryMarker('france', [mandateA, mandateB], termA);
    expect(selectedA.contract.id).toEqual(mandateA.id);

    const selectedB = toTerritoryMarker('germany', [mandateA, mandateB], termA);
    expect(selectedB.contract.id).toEqual(mandateA.id);

    const selectedC = toTerritoryMarker('france', [mandateB], termA);
    expect(selectedC.contract).toBeUndefined();
  });
})

