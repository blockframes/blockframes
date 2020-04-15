# How to create an app with Angular Console extension
Small documentaion how to create an app in the monorepo of blockframes

## Requirements
You need to install the *Angular Console* extension for your IDE. Assuming you're using VSCode, you will get prompted on the buttom right corner if you want to install the recommended extensions. Of course you need to be in the blockframes repository for that to get the prompt message.

## Preparation
Delete the *node_modules* folder and the *package-lock.json* file. Then run from your command line 
`npm install`. 

## Creating the app with configurations
When you're in the *Angular Console* extension go to *generate* and scroll down to the section *@nrwl/angular* and click on application.
In the input field you type in your application name. Then you click on the section *Optional fields*.
In the *directory* input field you can specifiy a directory where the app should live. 

> **Use this field!** Otherwise your app will get generated directly in the *apps* folder with the *e2e* directory and this will mess the apps folder.

 - For the style property use `scss`.
 - For the routing use `true`.
 - For the *skipTests* use `true`. Because unit test can be added later easily.
 - For the *prefix* use your app specific name. Like for the *catalog* app we use the prefix *catalog*

The rest can be the default value.

> You can always check in the terminal which is going to show up when you work on the input fields where the app is going to be generated and what options are selected. If there is no terminal shown, click on the arrow on the buttom right corner.

After you checked everything you can hit the *generate* button on top right corner.
Look at the terminal and see if there were errors if not, you can start working on the index.html file of the app. Go into the *src* folder in your app and update the index.html with the following code:
```
<!doctype  html>
<html  lang="en">
<head>
<meta  charset="utf-8">
<title>APP-TITLE-HERE!!!</title>
<base  href="/">
<meta  name="viewport"  content="width=device-width, initial-scale=1">
<link  rel="icon"  type="image/x-icon"  href="favicon.ico">
<link  href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined"  rel="stylesheet">
<link  rel="manifest"  href="manifest.json">
<meta  name="theme-color"  content="#1976d2">
</head>
<body>
<YOUR APP ROOT HERE></YOUR APP ROOT HERE>
<noscript>Please enable JavaScript to continue using this application.</noscript>
</body>
</html>
```
Delete also the assets folder. You don't need them because we got a assets library for that.
Also update the environments folder.

**environment.ci.ts** + **environment.prod.ts** + **environment.staging.ts**
```
import { production, firebase, persistenceSettings } from  '@env';
export  const  environment  = {
production,
firebase,
persistenceSettings
};
```
**environment.ts**
```
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { production, firebase, contracts, hmr, persistenceSettings } from  '@env';

export  const  environment  = {
production,
firebase,
contracts,
hmr,
persistenceSettings
};
/*
* For easier debugging in development mode, you can import the following file
* to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
*
* This import should be commented out in production mode because it will have a negative impact
* on performance if an error is thrown.
*/
// import 'zone.js/dist/zone-error'; // Included with Angular CLI.
```
It could happen that there is no `main.spec.ts` file is created next to the `main.ts` file. So create one and fill it with this: 
```
// Make sure we have at least one test in this module
test('smoke', () => {
expect(true).toBeTruthy();
});
```
After that is been done. We have to go into the wild jungle. The *angular.json*. You find this file in the root directory of the blockframes app. Open up the file and navigate to your new created app. You can find it by searching it with `ctrl + f`. We will ignore the *e2e* version of the app for now and focus on the *"real"* one. 

 - First, check if the name is correct. Sometimes the name is
   duplicated. This is a know bug. 
  - Second, go into `architect` --> `build` --> `options` and check if the paths are correct. You can delete in the `assets` *array* the path to the assets folder, because you deleted it and it won't be there.
  - Third,  checkout the `configurations` key. In this *object* you define the options of every environment. For now, there should be only one environment, `production`. But you also need `ci`, `dev` and `staging`. Go ahead and creat them below the `production` *object*.
  - Fourth, update the `production` *object* as followed. In the `fileReplacement` *array* you need to correct the path of the `env.ts` files.
   ```
   "fileReplacements": [
{
"replace": "env/env.ts",
"with": "env/env.prod.ts"
},
{
"replace": "apps/YOUR_APP_NAME/YOUR_APP_NAME/src/environments/environment.ts",
"with": "apps/YOUR_APP_NAME/YOUR_APP_NAME/src/environments/environment.prod.ts"
}
],
```
- Fifth, you need to delete the second *object* inside of the *budget* *array*. Maybe you also want to increase the `maximumError` key value to `10mb` if this is going to throw you an error in the build process.
```
{
"type": "i",
"maximumWarning": "6kb",
"maximumError": "10kb"
}
```
- Sixthly, you need to do the same for `ci` and `staging`. `dev` can be an empty *object*. You can use the `production` as a template, but be careful to replace the correct `env.ts` files with their corresponding partner. 

You almost made it. You only need to update some scripts in the *package.json*.
First, create a script in the *scripts* *object*. 
	```
	"build:YOUR-APP-NAME": "npx ng build YOUR-APP-NAME --base-href /YOUR-APP-NAME/ --configuration=\"${ENV:-dev}\"",
	```
You also want to update the `buid:all` script. Add your app to the script like 

    && npm run build:YOUR-APP-NAME
That's it. You created your first blockframe (D)app.

