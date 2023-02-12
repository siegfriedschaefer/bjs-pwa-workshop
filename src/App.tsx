import { FC, useState } from 'react';
// import React from 'react';
import logo from './logo.png';
import './App.css';
// import { Engine, Scene, useScene } from 'react-babylonjs';
import {Engine,
        HemisphericLight,
        MeshBuilder,
        PointLight,
        Scene,
      FreeCamera} from '@babylonjs/core';

import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';


import { WebXRSessionManager, 
  WebXRTrackingState, 
  WebXRFeatureName, 
  WebXRFeaturesManager,
  WebXRExperienceHelper,
 } from '@babylonjs/core/XR';

import { useEffect, useRef } from "react";

// Test screen, just to see something
function createScene(engine: Engine, canvas: HTMLCanvasElement) :  Scene {

  // Create the scene space
  var scene = new Scene(engine);
  scene.createDefaultEnvironment({ createGround: false, createSkybox: false });

  // Add a camera to the scene and attach it to the canvas

  var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());

  // var camera = new ArcRotateCamera("Camera", Math.PI / 2, 15 * Math.PI / 32, 25, Vector3.Zero(), scene);
  // camera.attachControl(canvas, true);

  // Add lights to the scene
  var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
  var light2 = new PointLight("Omni0", new Vector3(0, 1, -1), scene);


  // Add and manipulate meshes in the scene
  var sphere = MeshBuilder.CreateSphere("sphere", {diameter:2}, scene);
  sphere.position.y = 2;
  sphere.position.x = 0;
  sphere.position.z = 4;

  activateWebXR(scene);  

  return scene;

};

async function activateWebXR(scene: Scene) {

  try {
//    const env = scene.createDefaultEnvironment();

//    if ((env !== null) && (env.ground !== null)) {
      console.log("XR enabled");
      const xr = await scene.createDefaultXRExperienceAsync({
//        disableDefaultUI: true,
        disableTeleportation: true,
//        floorMeshes: [env.ground],
        uiOptions: {
          sessionMode: "immersive-ar",
        },
//        optionalFeatures: true
        optionalFeatures: ["hit-test", "anchors"],
      });

  } catch (e) {
      // no XR support
      console.log('no WebXr support');
  }  
}

const BabylonView: FC = () => {

  const [xrScene, setXrScene] = useState<Scene>();
  const [xrEngine, setXrEngine] = useState<Engine>();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    const canvas = canvasRef.current;
    if (canvas === null) return;

    // Fullpage support
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  
    const engine = new Engine(canvas, true);
    setXrEngine(engine);

    var scene: Scene = createScene(engine, canvas);

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
//      console.log('.');
      scene.render();
    });
    setXrScene(scene);

  // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
        engine.resize();
    });
  
  }, []);

  const onToggleXR = () => {
    if (xrScene !== undefined) {
//      xrScene.getEngine().switchFullscreen(false);
    }
}

  return (
    <>
    <button className="btn btn-primary" onClick={onToggleXR}>
    XR On/Off
    </button>
    <canvas id="renderCanvas" width="100%" height="100%" ref={canvasRef} style={{flex: 1}}/>
    </>
  );
}

function App() {
  return (
    <>
      <BabylonView />
    </>
  )
}

export default App;
