// CODE FROM: https://github.com/BTOdell/path-resolve/blob/master/index.ts


const SLASH = 47;
const DOT = 46;

/**
 * Resolves . and .. elements in a path with directory names
 * @param {string} path
 * @param {boolean} allowAboveRoot
 * @return {string}
 */
function normalizeStringPosix(path: string, allowAboveRoot: boolean): string {
  let res = '';
  let lastSlash = -1;
  let dots = 0;
  let code: number | undefined = void 0;
  let isAboveRoot = false;
  for (let i = 0; i <= path.length; ++i) {
      if (i < path.length) {
          code = path.charCodeAt(i);
      } else if (code === SLASH) {
          break;
      } else {
          code = SLASH;
      }
      if (code === SLASH) {
          if (lastSlash === i - 1 || dots === 1) {
              // NOOP
          } else if (lastSlash !== i - 1 && dots === 2) {
              if (res.length < 2 || !isAboveRoot ||
                  res.charCodeAt(res.length - 1) !== DOT ||
                  res.charCodeAt(res.length - 2) !== DOT) {
                  if (res.length > 2) {
                      const start = res.length - 1;
                      let j = start;
                      for (; j >= 0; --j) {
                          if (res.charCodeAt(j) === SLASH) {
                              break;
                          }
                      }
                      if (j !== start) {
                          res = (j === -1) ? '' : res.slice(0, j);
                          lastSlash = i;
                          dots = 0;
                          isAboveRoot = false;
                          continue;
                      }
                  } else if (res.length === 2 || res.length === 1) {
                      res = '';
                      lastSlash = i;
                      dots = 0;
                      isAboveRoot = false;
                      continue;
                  }
              }
              if (allowAboveRoot) {
                  if (res.length > 0) {
                      res += '/..';
                  } else {
                      res = '..';
                  }
                  isAboveRoot = true;
              }
          } else {
              const slice = path.slice(lastSlash + 1, i);
              if (res.length > 0) {
                  res += '/' + slice;
              } else {
                  res = slice;
              }
              isAboveRoot = false;
          }
          lastSlash = i;
          dots = 0;
      } else if (code === DOT && dots !== -1) {
          ++dots;
      } else {
          dots = -1;
      }
  }
  return res;
}

/**
* https://nodejs.org/api/path.html#path_path_resolve_paths
* @param {...string} paths A sequence of paths or path segments.
* @return {string}
*/
export function resolvePath(...paths: string[]): string {
  let resolvedPath: string = "";
  let resolvedAbsolute: boolean = false;

  for (let i = paths.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      let path: string;
      if (i >= 0) {
          path = paths[i];
      }
      // Skip empty entries
      if (path.length === 0) {
          continue;
      }
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === SLASH;
  }
  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe
  // Normalize the path (removes leading slash)
  resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute) {
      return "/" + resolvedPath;
  } else if (resolvedPath.length > 0) {
      return resolvedPath;
  } else {
      return '.';
  }
}
