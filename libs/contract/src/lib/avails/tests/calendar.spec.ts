import { createMandate } from "../../contract/+state/contract.model";
import { DurationMarker, toDurationMarker } from "./../avails";
import { createTerm } from "../../term/+state/term.model";
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

describe.skip('Calendar', () => {
  describe('Test DurationMarker', () => {

    it('Duration marker should contain good contract', () => {
      const mandateA = createMandate({ id: 'MandateA', termIds: ['termA'] });
      const mandateB = createMandate({ id: 'MandateB', termIds: ['termB'] });

      const termA = createTerm({ id: 'termA', contractId: mandateA.id });
      const termB = createTerm({ id: 'termB', contractId: mandateB.id });

      const selectedA = toDurationMarker([mandateA, mandateB], termA);
      expect(selectedA.contract.id).toEqual(mandateA.id);

      const selectedB = toDurationMarker([mandateA, mandateB], termB);
      expect(selectedB.contract.id).toEqual(mandateB.id);

      const selectedC = toDurationMarker([mandateB], termA);
      expect(selectedC.contract).toBeUndefined();
    });
  });

  describe('Test Matrix', () => {

    it('Test isBefore', () => {
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

    it('Test dateToMatrixPosition', () => {
      const dateA = new Date('01/04/2028');
      const posA = dateToMatrixPosition(dateA);

      expect(posA.row).toEqual(7);
      expect(posA.column).toEqual(0);

      const dateB = new Date('12/30/2025');
      const posB = dateToMatrixPosition(dateB);

      expect(posB.row).toEqual(4);
      expect(posB.column).toEqual(11);

      // One month after posB but new year, should go to next row
      const dateC = new Date('01/25/2026');
      const posC = dateToMatrixPosition(dateC);

      expect(posC.row).toEqual(5);
      expect(posC.column).toEqual(0);

      // One month after posC but same year, should go to new column
      const dateD = new Date('02/25/2026');
      const posD = dateToMatrixPosition(dateD);

      expect(posD.row).toEqual(5);
      expect(posD.column).toEqual(1);
    });

    it('Test isContinuous', () => {
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

    it('Test markersToMatrix', () => {
      const markers: DurationMarker[] = [];
      markers.push({ from: new Date('12/30/2025'), to: new Date('12/30/2026') });

      markers.push({ from: new Date('10/01/2028'), to: new Date('10/30/2028') });

      let stateMatrix: CellState[][] = calendarRows.map(() => calendarColumns.map(() => 'empty'));

      stateMatrix = markersToMatrix(markers, stateMatrix, 'available');

      expect(stateMatrix[4][10]).toBe('empty');
      expect(stateMatrix[4][11]).toBe('available');
      expect(stateMatrix[5].filter(s => s === 'available').length).toBe(12);
      expect(stateMatrix[6].filter(s => s === 'empty').length).toBe(12);
      expect(stateMatrix[7].filter(s => s === 'empty').length).toBe(11);
      expect(stateMatrix[7][9]).toBe('available');
    });

    it('Test select', () => {
      const stateMatrix: CellState[][] = calendarRows.map(() => calendarColumns.map(() => 'available'));

      const newState = select(1, 11, stateMatrix, createAvailCalendarState());
      expect(newState.start.row).toEqual(1);
      expect(newState.start.column).toEqual(11);
    });

    it('Test hover', () => {
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

    it('Test reset', () => {
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
