import AppManager from './appManager';
import './../css/app.scss';

export {appManager}

const appManager = new AppManager();
appManager.start();