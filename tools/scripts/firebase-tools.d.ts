declare module 'firebase-tools' {
  /**
   * This is the config object passed into `firebase-tools` CLI
   * Set either token, project or both. Token is for CI.
   */
  export interface FirebaseConfig {
    /**
     * This is the Firebase CI token used to authenticate in a CI environment
     * The Token is usually specified as a flag - `firebase-tools` also looks at
     * various environment variables - see more here: https://www.npmjs.com/package/firebase-tools#using-with-ci-systems
     */
    token?: string;
    /**
     * This is the Firebase projectId for the project you want to use
     */
    project?: string;
    cwd?: string;
  }

  /**
   * This namespace is for functions configuration related functions
   */
  namespace functions.config {
      /**
       * This function will get the functions config for either the current or specified project
       * @param FIREBASE_CONFIG is an object which provides config for `firebase-tools`
       * @param path undefined if you want to get the whole config, or a dot-separated path to the
       * config key you want to retrieve.
       */
      export function get(path: string | undefined, FIREBASE_CONFIG: FirebaseConfig): Promise<object>;
      export function set(... agrs: any[]): Promise<any>;
  }
}
