import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

// Manages all dat.GUI interactions
export default class DatGUI {
  constructor() {
    this.gui = new GUI();
  }


  addFolder(name) {
    this.gui.addFolder(name);
  }

  addFolderWithPositions(el, name, rangeStart, rangeEnd, step) {
    const folder = this.gui.addFolder(name);
    folder.add(el.position, "x", rangeStart, rangeEnd, step);
    folder.add(el.position, "y", rangeStart, rangeEnd, step);
    folder.add(el.position, "z", rangeStart, rangeEnd, step);
    folder.open();
  }
}
