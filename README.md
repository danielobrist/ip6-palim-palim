# Palim Palim

A fun video chat application with integrated 3D multiplayer capabilities. //TODO project description

Based on a basic boilerplate for a Three.js project including the use of Webpack and ES6 syntax via Babel.
https://github.com/paulmg/ThreeJS-Webpack-ES6-Boilerplate/

## Project Structure
```
build - Directory for built and compressed files from the npm build script
src - Directory for all dev files
├── css - Contains all SCSS files, that are compiled to `src/public/css`
├── js - All the Three.js app files, with `app.js` as entry point. Compiled to `src/public/js` with webpack
│   ├── app
│   │   ├── components - Three.js components that get initialized in `main.js`
│   │   ├── helpers - Classes that provide ideas on how to set up and work with defaults
│   │   ├── managers - Manage complex tasks such as GUI or input
│   │   └── model - Classes that set up the model object
│   ├── data - Any data to be imported into app
│   └── utils - Various helpers and vendor classes
└── public - Used by webpack-dev-server to serve content. Webpack builds local dev files here. 
    └── assets - Is copied over to build folder with build command. Place external asset files here.
```

## Getting started
Install dependencies:

```
npm install
```

Then build the production files with:

```
npm run build
```

This cleans existing build folder while linting js folder and copies over the public assets folder from src. Then sets environment to production and compiles js and css into build.

```
npm start
```

Spins up the node.js server at localhost:8080 and uses the current prod build from the build folder. Open a second tab to chat and play the game with yourself.


## Running App in dev mode (wihout Server/VideoChat)
After installing the dependencies, run:

```
npm run dev
```

This will spin up a webpack dev server at localhost:8080 and keeps track of all js and sass changes to files. Useful for developing the Three.js-scene but does not start the node.js server, so the video chat can not be tested (for this you have to build it and then start the node.js server locally - as described above)



## Other NPM Scripts
You can run any of these individually if you'd like with the `npm run` command:
* `test` - Runs the Mocha tests defined in test/test.js
* `prebuild` - Cleans up build folder and lints `src/js`
* `clean` - Cleans build folder
* `lint` - Runs lint on the `src/js` folder and uses the `.eslintrc` file in root for linting rules
* `webpack-server` - Start up a  webpack-dev-server with hot-module-replacement
* `webpack-watch` - Run webpack in dev environment with watch
* `dev:js` - Run webpack in dev environment without watch
* `build:dir` - Copy files and folders from `src/public` to `build`
* `build:js` - Run webpack in production environment

## Input Controls
* Press H to hide dat.GUI
* Arrow controls will pan
* Mouse left click will rotate/right click will pan
* Scroll wheel zooms in and out


## Heroku Deployment
Normally, Heroku will recognise the app as a node.js application and use the proper buildpack for the deployment. If you encounter any problems, try folliwing steps:
* Set up Heroku CLI [More infos](https://devcenter.heroku.com/articles/heroku-cli)
* Ensure the Heroku application is using the `heroku/nodejs` buildpack by running the `heroku buildpacks -a <your-heroku-app-name>` command. [More infos](https://devcenter.heroku.com/articles/nodejs-support#specifying-a-node-js-version)
* If it is not set to `heroku/nodejs`, set the buildpack with the command `heroku buildpacks:set heroku/nodejs -a <your-heroku-app-name>`. [More infos](https://devcenter.heroku.com/articles/buildpacks#setting-a-buildpack-on-an-application)
* With the proper buildpack set up, Heroku will automatically install all dependencies and will start the server using `npm start`, when deploying the app.

