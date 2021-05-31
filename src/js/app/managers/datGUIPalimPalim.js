import Config from '../../data/config';

// Manages all dat.GUI interactions
export default class DatGUIPalimPalim {
  constructor() {
    this.gui = new dat.GUI();
  }

  load(plane, camera, duckMesh1) {

   const duck1Folder = this.gui.addFolder("Duck 1");
   duck1Folder.add(duckMesh1.position, "x", -10, 10, 0.01);
   duck1Folder.add(duckMesh1.position, "y", -10, 10, 0.01);
   duck1Folder.add(duckMesh1.position, "z", -10, 10, 0.01);
   duck1Folder.open();

   const planeFolder = this.gui.addFolder("Plane");
   planeFolder.add(plane.position, "x", -10, 10, 0.01);
   planeFolder.add(plane.position, "y", -10, 10, 0.01);
   planeFolder.add(plane.position, "z", -10, 10, 0.01);
   planeFolder.open();
   
   const cameraFolder = this.gui.addFolder("Kamera");
   cameraFolder.add(camera.position, "x", -10, 10, 0.01);
   cameraFolder.add(camera.position, "y", -10, 10, 0.01);
   cameraFolder.add(camera.position, "z", -10, 50, 0.1);
   cameraFolder.open();
   
  }
}
