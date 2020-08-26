/** This is black magic from stack-overflow to detect if the browser is Safari or not.
 * Here we can not rely on `navigator.userAgent` because other Browser like Chromium put "Safari"
 * in there userAgent.
 * More details about the code below here : https://stackoverflow.com/a/9851769
*/
export function isSafari() {
  return /constructor/i.test(window.HTMLElement as any) ||
    (
      function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
      }
    )(
      // @ts-ignore
      !window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)
    );
}