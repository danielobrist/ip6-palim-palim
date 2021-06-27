:bell: Palim Palim
========

A fun video chat application with integrated 3D multiplayer capabilities. //TODO project description

Based on a basic boilerplate for a Three.js project including the use of Webpack and ES6 syntax via Babel.
https://github.com/paulmg/ThreeJS-Webpack-ES6-Boilerplate/

## :apple: Project Structure
```
build - Directory for built and compressed files from the npm build script
src - Directory for all dev files
├── css - Contains all SCSS files, that are compiled to `src/public/css`
├── js - All the Three.js app files, with `app.js` as entry point. Compiled to `src/public/js` with webpack
│   ├── game
│   │   ├── components - Various compontents used by the game
│   │   └── config - Different scene configurations to be loaded in `game.js`
│   ├── utils - Helpers and vendor classes
|   └── videoChat - WebRTC peer connection for video chat and other data channels
└── public - Used by webpack-dev-server to serve content. Webpack builds local dev files here. 
    └── assets - Is copied over to build folder with build command. Place external asset files here.
```

## :orange: Getting started
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


## :pear: Running App in dev mode (wihout Server/VideoChat)
After installing the dependencies, run:

```
npm run dev
```

This will spin up a webpack dev server at localhost:8080 and keeps track of all js and sass changes to files. Useful for developing the Three.js-scene but does not start the node.js server, so the video chat can not be tested (for this you have to build it and then start the node.js server locally - as described above). Press <kbd>H</kbd> to show or hide the dat.GUI menu.



## :cherries: All NPM Scripts
You can run any of these individually if you'd like with the `npm run` command:
* `build` - Cleans build folder, lints js code, copies assets, sets env to production, compiles everything into build
* `start` - Starts `server.js` at localhost:8080 serving the current prod build from the build folder
* `test` - Runs the Mocha tests defined in `test/test.js`
* `prebuild` - Cleans up build folder and lints `src/js`
* `clean` - Cleans build folder
* `lint` - Runs lint on the `src/js` folder and uses the `.eslintrc` file in root for linting rules
* `webpack-server` - Starts up a webpack-dev-server with hot-module-replacement
* `webpack-watch` - Runs webpack in dev environment with watch
* `dev:js` - Runs webpack in dev environment without watch
* `build:dir` - Copies files and folders from `src/public` to `build`
* `build:js` - Runs webpack in production environment


## :grapes: Heroku Deployment
Normally, Heroku will recognise the app as a node.js application and use the proper buildpack for the deployment. If you encounter any problems, try folliwing steps:
* Set up Heroku CLI [More infos](https://devcenter.heroku.com/articles/heroku-cli)
* Ensure the Heroku application is using the `heroku/nodejs` buildpack by running the `heroku buildpacks -a <your-heroku-app-name>` command. [More infos](https://devcenter.heroku.com/articles/nodejs-support#specifying-a-node-js-version)
* If it is not set to `heroku/nodejs`, set the buildpack with the command `heroku buildpacks:set heroku/nodejs -a <your-heroku-app-name>`. [More infos](https://devcenter.heroku.com/articles/buildpacks#setting-a-buildpack-on-an-application)
* With the proper buildpack set up, Heroku will automatically install all dependencies and will start the server using `npm start`, when deploying the app.



## :banana: TURN-Server aufsetzen
Um selbst einen TURN-Server (Traversal Using Relays around NAT (Network Address Translation)) zu erstellen, wird ein Linux-Server mit einer öffentlichen IP-Adresse (Internet Protocol Adresse) benötigt. Der in Palim-Palim verwendete TURN-Server benutzt Coturn, dies ist eine Open-Source Implementierung des TURN-Protokolls (https://www.hostsharing.net/features/coturn/).
Spezifikationen Linux-Server (nicht zwingend):
* 8 GB (Gigabyte) RAM (Random-Access Memory)
* 8 VCPU (virtual central processing unit)
* Speicher: 20 GB
* Betriebssystem: Linux Ubuntu
* Je nach Umgebung, auf welcher der Server aufgesetzt wird, müssen die Ports, welche der TURN-Server benötigt, freigegeben werden. Mit der untenstehenden TURN-Konfiguration müssen folgende Ports freigegeben werden (TODO: noch verifizieren):
* TCP und UDP, Eintritt und Austritt: 10000 bis 20000
* TCP, Eintritt: 3478

Anleitung für den Palim-Palim-TURN-Server basierend auf der Anleitung von Gabriel Tanner (https://gabrieltanner.org/blog/turn-server):
Der TURN-Server hat die folgende IP-Adresse: 86.119.43.130
Als Eintrittsport wurde der Port 3478 festgelegt.
1.	Linux-Server auf den aktuellen Stand bringen
sudo apt-get update -y
2.	Coturn installieren
sudo apt-get install coturn
3.	Coturn als automatischen Service definieren, damit dieser nach einem Server-Neustart automatisch wieder hochfährt
TURNSERVER_ENABLED=1 in der Datei /etc/default/coturn einkommentieren
4.	Coturn-Service starten
systemctl start coturn
5.	Die Konfiguration des Turn-Servers liegt unter /etc/turnserver.conf und muss folgendermassen gesetzt werden:
Siehe Datei xyzBlaBla
6.	Coturn-Service neu starten
sudo service coturn restart
7.	Der Turn-Server kann unter «Trickle ICE» (https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) getestet werden. Dazu müssen folgende Angaben gemacht werden:
STUN or TURN URI	turn:86.119.43.130:3478
TURN username	palimpalim
TURN password	password aus der Config-Datei


