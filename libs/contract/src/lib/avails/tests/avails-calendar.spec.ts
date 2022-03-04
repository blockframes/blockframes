import {
  calendarColumns,
  calendarRows,
  CellState,
  createAvailCalendarState,
  dateToMatrixPosition,
  hover,
  isBefore,
  isContinuous,
  markersToMatrix,
  MatrixPosition,
  reset,
  select
} from '../calendar/calendar.model';
import { durationAvailabilities, DurationMarker } from '../avails';
import {
  availSouthKorea, availAfghanistan,
  availFrance, availsSVODArgentina, availsPayTVArgentina,
  availsGermany, availsBelgium, availsExistingEndedSales,
  availsOngoingSales, availsTerritoryWithExclusivity, availsTerritoryWithoutExclusivity,
  availsFranceLuxembourg, availsAllButSouthKorea, availsPayTV, availsPlanes,
} from './../fixtures/availsFilters';
import { assertDate } from './utils'
import {
  mandateMovie1, saleArgentinaMovie1, saleGermanyMovie1, saleCanadaMovie1, saleBelgiumFranceLuxembourgMovie1, mandateMovie6,
} from './../fixtures/mandatesAndSales';

const sales = [saleArgentinaMovie1, saleGermanyMovie1, saleCanadaMovie1, saleBelgiumFranceLuxembourgMovie1]
const { from: saleGermanyFrom, to: saleGermanyTo } = saleGermanyMovie1.terms[0].duration;

const { from: saleCanadaFrom, to: saleCanadaTo } = saleCanadaMovie1.terms[0].duration;

const { from: saleArgentinaFrom, to: saleArgentinaTo } = saleArgentinaMovie1.terms[0].duration;

const { from: mandateFrom, to: mandateTo } = mandateMovie1.terms[0].duration;

const { from: saleBelgiumFranceLuxembourgFrom, to: saleBelgiumFranceLuxembourgTo } = saleBelgiumFranceLuxembourgMovie1.terms[0].duration;

describe.skip('Calendar', () => {
  describe('Test Matrix', () => {

    it.skip('Test isBefore', () => {
      const posA = { row: 1, column: 1 } as MatrixPosition;
      const posB = { row: 1, column: 2 } as MatrixPosition;
      const posC = { row: 1, column: 1 } as MatrixPosition;
      const posD = { row: 10, column: 10 } as MatrixPosition;
      const posE = { row: 10, column: 1 } as MatrixPosition;

      expect(isBefore(posA, posB)).toBeTruthy();
      expect(isBefore(posA, posC)).toBeFalsy();
      expect(isBefore(posA, posD)).toBeTruthy();
      expect(isBefore(posA, posE)).toBeTruthy();
    });

    it.skip('Test dateToMatrixPosition', () => {
      const currentYear = new Date().getFullYear();

      const dateA = new Date('01/04/2028');
      const posA = dateToMatrixPosition(dateA);

      expect(posA.row).toEqual(dateA.getFullYear() - currentYear);
      expect(posA.column).toEqual(0);

      const dateB = new Date('12/30/2025');
      const posB = dateToMatrixPosition(dateB);

      expect(posB.row).toEqual(dateB.getFullYear() - currentYear);
      expect(posB.column).toEqual(11);

      // One month after posB but new year, should go to next row
      const dateC = new Date('01/25/2026');
      const posC = dateToMatrixPosition(dateC);

      expect(posC.row).toEqual(dateC.getFullYear() - currentYear);
      expect(posC.column).toEqual(0);

      // One month after posC but same year, should go to new column
      const dateD = new Date('02/25/2026');
      const posD = dateToMatrixPosition(dateD);

      expect(posD.row).toEqual(dateD.getFullYear() - currentYear);
      expect(posD.column).toEqual(1);
    });

    it.skip('Test isContinuous', () => {
      const posA = { row: 0, column: 1 } as MatrixPosition;
      const posB = { row: 0, column: 2 } as MatrixPosition;
      const posC = { row: 0, column: 3 } as MatrixPosition;
      const posD = { row: 0, column: 5 } as MatrixPosition;
      const posE = { row: 4, column: 11 } as MatrixPosition;
      const posF = { row: 5, column: 0 } as MatrixPosition;
      const posG = { row: 5, column: 1 } as MatrixPosition;
      const posH = { row: 5, column: 3 } as MatrixPosition;
      const posI = { row: 5, column: 4 } as MatrixPosition;

      const stateMatrix = [[], [], [], [], [], []] as CellState[][];
      stateMatrix[posA.row][posA.column] = 'available';
      stateMatrix[posB.row][posB.column] = 'available';
      stateMatrix[posC.row][posC.column] = 'available';
      stateMatrix[posD.row][posD.column] = 'available';
      stateMatrix[posE.row][posE.column] = 'available';
      stateMatrix[posF.row][posF.column] = 'available';
      stateMatrix[posG.row][posG.column] = 'available';
      stateMatrix[posH.row][posH.column] = 'available';
      stateMatrix[posI.row][posI.column] = 'sold';

      expect(isContinuous(posA, posB, stateMatrix)).toBeTruthy();
      expect(isContinuous(posB, posA, stateMatrix)).toBeFalsy();
      expect(isContinuous(posB, posC, stateMatrix)).toBeTruthy();
      expect(isContinuous(posA, posC, stateMatrix)).toBeTruthy();
      expect(isContinuous(posC, posD, stateMatrix)).toBeFalsy();
      expect(isContinuous(posE, posF, stateMatrix)).toBeTruthy();
      expect(isContinuous(posE, posG, stateMatrix)).toBeTruthy();
      expect(isContinuous(posG, posH, stateMatrix)).toBeFalsy();
      expect(isContinuous(posH, posI, stateMatrix)).toBeFalsy();
    });

    it.skip('Test markersToMatrix', () => {
      const offset = new Date('12/30/2025').getFullYear() - new Date().getFullYear();

      const markers: DurationMarker[] = [];
      markers.push({ from: new Date('12/30/2025'), to: new Date('12/30/2026') });

      markers.push({ from: new Date('10/01/2028'), to: new Date('10/30/2028') });

      let stateMatrix: CellState[][] = calendarRows.map(() => calendarColumns.map(() => 'empty'));

      stateMatrix = markersToMatrix(markers, stateMatrix, 'available');

      expect(stateMatrix[0 + offset][10]).toBe('empty');
      expect(stateMatrix[0 + offset][11]).toBe('available');
      expect(stateMatrix[1 + offset].filter(s => s === 'available').length).toBe(12);
      expect(stateMatrix[2 + offset].filter(s => s === 'empty').length).toBe(12);
      expect(stateMatrix[3 + offset].filter(s => s === 'empty').length).toBe(11);
      expect(stateMatrix[3 + offset][9]).toBe('available');
    });

    it.skip('Test select', () => {
      const stateMatrix: CellState[][] = calendarRows.map(() => calendarColumns.map(() => 'available'));

      const newState = select(1, 11, stateMatrix, createAvailCalendarState());
      expect(newState.start.row).toEqual(1);
      expect(newState.start.column).toEqual(11);
    });

    it.skip('Test hover', () => {
      const markers: DurationMarker[] = [];
      markers.push({ from: new Date('12/30/2025'), to: new Date('12/30/2026') });

      markers.push({ from: new Date('10/01/2028'), to: new Date('10/30/2028') });

      const stateMatrix: CellState[][] = calendarRows.map(() => calendarColumns.map(() => 'available'));

      const hoveredState = hover(1, 10, stateMatrix, createAvailCalendarState());

      expect(hoveredState.hoverRow).toEqual(1);
      expect(hoveredState.hoverColumn).toEqual(10);
      expect(hoveredState.hoverStart.row).toEqual(1);
      expect(hoveredState.hoverStart.column).toEqual(10);
    });

    it.skip('Test reset', () => {
      const dirtyState = createAvailCalendarState({
        hoverColumn: 10,
        hoverRow: 1,
        highlightedRange: [[true], [true]]
      });

      const stateMatrix: CellState[][] = calendarRows.map(() => calendarColumns.map(() => 'available'));

      const resetedState = reset(dirtyState, stateMatrix);
      expect(resetedState.hoverColumn).toBeUndefined();
      expect(resetedState.hoverRow).toBeUndefined();
      expect(resetedState.highlightedRange.flat().filter(r => !!r).length).toEqual(0);
    });
  });
});

describe('Test terms out of movie mandates', () => {
  it('Checks not licensed due to territory', () => {
    const markers = durationAvailabilities(availSouthKorea, [mandateMovie1], sales, []);
    expect(markers.available.length).toBe(0);
    expect(markers.sold.length).toBe(0);
    expect(markers.inBucket.length).toBe(0);
  })

  it('Check available on mandate duration', () => {
    const markers = durationAvailabilities(availAfghanistan, [mandateMovie1], sales, []);
    expect(markers.available.length).toBe(1);
    const [{ from, to }] = markers.available;
    assertDate(from, mandateFrom)
    assertDate(to, mandateTo)
  })

  it('Check not licensed due to media', () => {
    const markers = durationAvailabilities(availFrance, [mandateMovie1], sales, []);
    expect(markers.available.length).toBe(0)
    expect(markers.sold.length).toBe(0)
    expect(markers.inBucket.length).toBe(0)
  })

  it('Check available  on terms with existing ended sales', () => {
    const markers = durationAvailabilities(availsExistingEndedSales, [mandateMovie1], sales, []);

    //Germany is sold
    expect(markers.sold.length).toBe(1);
    const [{ from: soldFrom, to: soldTo }] = markers.sold;
    assertDate(soldFrom, saleGermanyFrom);
    assertDate(soldTo, saleGermanyTo);

    //Available on mandate duration.
    expect(markers.available.length).toBe(1);
    const [{ from: availableFrom, to: availableTo }] = markers.available;
    assertDate(availableFrom, mandateFrom);
    assertDate(availableTo, mandateTo);

    expect(markers.inBucket.length).toBe(0);
  })

  it('Check sold on Germany and available on avail territories', () => {
    const markers = durationAvailabilities(availsOngoingSales, [mandateMovie1], sales, []);
    //Germany is sold
    expect(markers.sold.length).toBe(1);
    const [{ from: soldFrom, to: soldTo }] = markers.sold;
    assertDate(soldFrom, saleGermanyFrom);
    assertDate(soldTo, saleGermanyTo);

    //Available on mandate duration.
    expect(markers.available.length).toBe(1);
    const [{ from: availableFrom, to: availableTo }] = markers.available;
    assertDate(availableFrom, mandateFrom);
    assertDate(availableTo, mandateTo);

    expect(markers.inBucket.length).toBe(0);
  })

  it('Check available non exclusive', () => {
    const markers = durationAvailabilities(availsTerritoryWithoutExclusivity, [mandateMovie1], sales, []);
    expect(markers.available.length).toBe(1);
    const [{ from, to }] = markers.available;
    assertDate(from, mandateFrom);
    assertDate(to, mandateTo);
    expect(markers.inBucket.length).toBe(0);
  })

  it('Check not licensed due to territory and exclusivity', () => {
    const markers = durationAvailabilities(availsTerritoryWithExclusivity, [mandateMovie1], sales, []);
    //Germany is sold
    expect(markers.sold.length).toBe(1);
    const [{ from: soldFrom, to: soldTo }] = markers.sold;
    assertDate(soldFrom, saleGermanyFrom);
    assertDate(soldTo, saleGermanyTo);

    //Available on mandate duration
    expect(markers.available.length).toBe(1);
    const [{ from: availableFrom, to: availableTo }] = markers.available;
    assertDate(availableFrom, mandateFrom);
    assertDate(availableTo, mandateTo);

    expect(markers.inBucket.length).toBe(0);
  })

  it('Check terms available', () => {
    const markers = durationAvailabilities(availsSVODArgentina, [mandateMovie1], sales, []);
    expect(markers.available.length).toBe(1);
    const [{ from, to }] = markers.available;
    assertDate(from, mandateFrom);
    assertDate(to, mandateTo);

    expect(markers.sold.length).toBe(0);
    expect(markers.inBucket.length).toBe(0);
  })

  it('Check term sold', () => {
    const markers = durationAvailabilities(availsPayTVArgentina, [mandateMovie1], sales, []);
    //Argentina is sold
    expect(markers.sold.length).toBe(1);
    const [{ from: soldFrom, to: soldTo }] = markers.sold;
    assertDate(soldFrom, saleArgentinaFrom);
    assertDate(soldTo, saleArgentinaTo);

    //Available on mandate duration.
    expect(markers.available.length).toBe(1);
    const [{ from: availableFrom, to: availableTo }] = markers.available;
    assertDate(availableFrom, mandateFrom);
    assertDate(availableTo, mandateTo);

    expect(markers.inBucket.length).toBe(0);
  })

  it('Check available due to non exclusivity', () => {
    const markers = durationAvailabilities(availsGermany, [mandateMovie1], sales, []);
    expect(markers.available.length).toBe(1);
    const [{ from, to }] = markers.available;
    assertDate(from, mandateFrom);
    assertDate(to, mandateTo);

    expect(markers.inBucket.length).toBe(0);
    expect(markers.sold.length).toBe(0);
  })

  it('Check available terms with existing future sales', () => {
    const markers = durationAvailabilities(availsBelgium, [mandateMovie1], sales, []);
    //Belgium is sold
    expect(markers.sold.length).toBe(1);
    const [{ from: soldFrom, to: soldTo }] = markers.sold;
    assertDate(soldFrom, saleBelgiumFranceLuxembourgFrom);
    assertDate(soldTo, saleBelgiumFranceLuxembourgTo);

    //Available on mandate duration.
    expect(markers.available.length).toBe(1);
    const [{ from: availableFrom, to: availableTo }] = markers.available;
    assertDate(availableFrom, mandateFrom);
    assertDate(availableTo, mandateTo);
    expect(markers.inBucket.length).toBe(0);
  })

  it('Check not available due to terms with existing future sales', () => {
    const markers = durationAvailabilities(availsFranceLuxembourg, [mandateMovie1], sales, []);
    //France/Luxembourg are sold
    expect(markers.sold.length).toBe(1);
    const [{ from: soldFrom, to: soldTo }] = markers.sold;
    assertDate(soldFrom, saleBelgiumFranceLuxembourgFrom);
    assertDate(soldTo, saleBelgiumFranceLuxembourgTo);

    //Available on mandate duration.
    expect(markers.available.length).toBe(1);
    const [{ from: availableFrom, to: availableTo }] = markers.available;
    assertDate(availableFrom, mandateFrom);
    assertDate(availableTo, mandateTo);

    expect(markers.inBucket.length).toBe(0);
  })

  it('Check available on several Media + Last day of mandate', () => {
    const markers = durationAvailabilities(availsAllButSouthKorea, [mandateMovie1], sales, []);
    const argentinaMarker = markers.sold.find(marker => marker.term.contractId === saleArgentinaMovie1.id)
    const germanyMarker = markers.sold.find(marker => marker.term.contractId === saleGermanyMovie1.id)
    const canadaMarker = markers.sold.find(marker => marker.term.contractId === saleCanadaMovie1.id)

    expect(markers.sold.length).toBe(3);

    assertDate(argentinaMarker?.from, saleArgentinaFrom);
    assertDate(argentinaMarker?.to, saleArgentinaTo);

    assertDate(germanyMarker?.from, saleGermanyFrom);
    assertDate(germanyMarker?.to, saleGermanyTo);

    assertDate(canadaMarker?.from, saleCanadaFrom);
    assertDate(canadaMarker?.to, saleCanadaTo);
    const [{ from, to }] = markers.available;
    assertDate(from, mandateFrom);
    assertDate(to, mandateTo);
  })


  it('Check unavailability of china/france on payTV media', () => {
    const markers = durationAvailabilities(availsPayTV, [mandateMovie6], [], []);
    expect(markers.available.length).toBe(0);
  })

  it('Check available of china/france on planes media', () => {
    const markers = durationAvailabilities(availsPlanes, [mandateMovie6], [], []);
    expect(markers.available.length).toBeGreaterThan(0);
  })

})
