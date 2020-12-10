---
name: Component
about: Issue to describe how to create a component
title: "[Component] ..."
labels: ''
assignees: ''

---

# Component

## UI review
_remove this section once everything is checked_
- [ ] UI doesn't already have a existing component.
- [ ] Name display in Zeplin is the same as the one in the issue (see below).
- [ ] Data can be display like in the UI (see notion).
- [ ] A link to this issue in the zeplin object

## Description

- name: ...
- lib/app: ...

## Type
- [ ] **Layout**: _Structure a page with content projection (ex: MovieView)._
- [ ] **Page**: _Loaded by the router. Usually used in an app (ex: CatalogDashboardMovieView)._
- [ ] **Component**: _Structure a piece of data in the page (ex: MovieTable)._
- [ ] **Display**: _Render data in a page. Can use a component-type (ex: MovieMain, MovieBudget)._
- [ ] **Form**: _Get data from the user (ex: MovieFormBudget)._

### Input
_can be data (movie, distribution right, ...), or UI related (dense, appearance)_
- [ ] ...

### Data view
_data displayed in the UI, derived from the inputs (ex: **title**: movie.main.title.international)
- [ ] ...

## Where is it used
-links and snapshots where the component is used_
