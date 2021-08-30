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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)
    );
}

export function isChrome() {return navigator.userAgent.indexOf("Chrome") != -1}

export function scrollIntoView(element:HTMLElement){
  if(isChrome()){
    element.scrollIntoView()
  } else {
   element.scrollIntoView({behavior:'smooth'})
  }
}

/**
 * This is black magic from stack-overflow to detect if the browser and its version.
 * More details about the code below here : https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
 */
export function getBrowserWithVersion(): { browser_name: string, browser_version: string } {
  const ua = navigator.userAgent
  let tem
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { browser_name: 'IE', browser_version: (tem[1] || '') };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return { browser_name: tem[1].replace('OPR', 'Opera'), browser_version: tem[2] };
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
  return { browser_name: M[0], browser_version: M[1] };
}
