/**
 * Data module for the backend,
 * defines the interface for client code and internal data storage operations.
 *
 * This module will (TODO) define a human-readable, business oriented interface,
 * and introduce separation of concern between the client code (create delivery, generate notification, etc)
 * and the storage layer (firestore, retrieve document, access path `/delivery/${deliveryId}/x/y`
 *
 * Right now this module only contains types & low level data manipulation,
 * this is the initial step of a three step refactoring:
 *
 * - Regroup, organize and prepare the data manipulation code we already have,
 * - Build a layer of abstraction atop this layer to abstract the implementation details (firestore)
 *   and our business code (Materials, Delivery, etc),
 * - Reunite the backend and frontend data layers in a single shared library,
 *   to keep a single, up-to-date codebase.
 */
