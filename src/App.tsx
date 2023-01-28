import { FC, useState } from 'react';
// import React from 'react';
import logo from './logo.png';
import './App.css';
// import { Engine, Scene, useScene } from 'react-babylonjs';
import {Engine,
        HemisphericLight,
        MeshBuilder,
        PointLight,
        Scene} from '@babylonjs/core';

import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';


import { WebXRSessionManager, 
  WebXRTrackingState, 
  WebXRFeatureName, 
  WebXRFeaturesManager,
  WebXRExperienceHelper,
 } from '@babylonjs/core/XR';

 import { useEffect, useRef } from "react";
 
 /*
  ({ antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady, ...rest }) => {
   const reactCanvas = useRef(null);
 
   // set up basic engine and scene
   useEffect(() => {
     const { current: canvas } = reactCanvas;
 
     if (!canvas) return;
 
     const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio);
     const scene = new Scene(engine, sceneOptions);
     if (scene.isReady()) {
       onSceneReady(scene);
     } else {
       scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
     }
 
     engine.runRenderLoop(() => {
       if (typeof onRender === "function") onRender(scene);
       scene.render();
     });
 
     const resize = () => {
       scene.getEngine().resize();
     };
 
     if (window) {
       window.addEventListener("resize", resize);
     }
 
     return () => {
       scene.getEngine().dispose();
 
       if (window) {
         window.removeEventListener("resize", resize);
       }
     };
   }, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady]);
 
   return <canvas ref={reactCanvas} {...rest} />;
 };
*/

function createScene(engine: Engine, canvas: HTMLCanvasElement) :  Scene {

  // Create the scene space
  var scene = new Scene(engine);

  // Add a camera to the scene and attach it to the canvas
  var camera = new ArcRotateCamera("Camera", Math.PI / 2, 15 * Math.PI / 32, 25, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  // Add lights to the scene
  var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
  var light2 = new PointLight("Omni0", new Vector3(0, 1, -1), scene);


  // Add and manipulate meshes in the scene
  var sphere = MeshBuilder.CreateSphere("sphere", {diameter:3}, scene);
  sphere.position.y = 1;
//  var ground = MeshBuilder.CreateGround("ground", {width:50, height:100}, scene);

  return scene;

};

async function getwebxr(scene: Scene) {
  try {
    const xrHelper = await WebXRExperienceHelper.CreateAsync(scene);
  } catch (e) {
      // no XR support
      console.log('no WebXr support');
  }  
}


type WithVRProps = {
  xrstate: boolean;
}

const WithVR: FC<WithVRProps> = (props) => {

  const [xrSession, setXrSession] = useState<WebXRSessionManager>();
  const [xrScene, setXrScene] = useState<Scene>();

  const [rotationY, setRotationY] = useState(Math.PI);
  const { xrstate } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("useEffect");

    const canvas = canvasRef.current;
    if (canvas === null) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
 
  
    const engine = new Engine(canvas, true);
    console.log(engine);

    var scene: Scene = createScene(engine, canvas);
    setXrScene(scene);

    engine.runRenderLoop(function () { // Register a render loop to repeatedly render the scene
      scene.render();
    });

    window.addEventListener("resize", function () { // Watch for browser/canvas resize events
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
        engine.resize();
    });
  
  //   getwebxr(scene);
  }, []);


/*
  (async () => {
    if (xrSession) {
      await xrSession.exitXRAsync();
      if (root !== undefined)
        root.setEnabled(false);
    } else {
      if (scene !== null) {

        const xr = await scene.getEngine().createDefaultXRExperienceAsync({
          disableDefaultUI: true,
          disableTeleportation: true,
        });
      }
    }
  });
*/
  const onToggleXR = () => {
    if (xrScene !== undefined)
      xrScene.getEngine().switchFullscreen(false);
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



/*
const App = () => {
  const [xrstate, setxrstate] = useState(true);
  const onToggleXR = () => {
    setxrstate((current) => !current)
  }

  return (
    <>
   <div style={{ flex: 1, display: 'flex' }}>
        <button className="btn btn-primary" onClick={onToggleXR}>
          XR On/Off
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        <WithVR xrstate={xrstate} />
      </div>
    </>
  );
};
*/

function App() {
  const [xrstate, setxrstate] = useState(true);

  return (
    <div style={{ flex: 1}}>
      <div style={{ flex: 1 }}>
          <WithVR xrstate={xrstate} />
      </div>
    </div>
  );
}

export default App;
