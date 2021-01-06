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

/**
 * This is black magic from stack-overflow to detect if the browser and its version.
 * More details about the code below here : https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
 */
export function getBrowserWithVersion(): { name: string, version: string } {
  var ua = navigator.userAgent, tem, 
  M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name:'IE',version:(tem[1] || '') };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return { name:tem[1].replace('OPR', 'Opera'), version:tem[2] };
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
  return { name:M[0], version:M[1] };
}