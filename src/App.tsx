import { FC, useState } from 'react';
// import React from 'react';
import logo from './logo.png';
import './App.css';
// import { Engine, Scene, useScene } from 'react-babylonjs';
import {
  AbstractMesh,
  Axis,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  PointLight,
  PolygonMeshBuilder,
  Scene,
  Space,
  StandardMaterial,
  FreeCamera,
  SceneLoader, 
  ExtrudeShapeCustom
} from '@babylonjs/core';

import '@babylonjs/loaders/glTF';
import earcut from 'earcut';

import { Quaternion, Vector3, Vector2 } from '@babylonjs/core/Maths/math.vector';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';


import { WebXRSessionManager, 
  WebXRTrackingState, 
  WebXRFeatureName, 
  WebXRFeaturesManager,
  WebXRExperienceHelper,
  WebXRHitTest,
  WebXRPlaneDetector
 } from '@babylonjs/core/XR';

import { useEffect, useRef } from "react";

let item: AbstractMesh | undefined;

// Test screen, just to see something
function createScene(engine: Engine, canvas: HTMLCanvasElement) :  Scene  {


  const loadmesh = async (scene: Scene) => {

    const model = await SceneLoader.ImportMeshAsync("", "https://siegfriedschaefer.github.io/rn-babylonjs-pg/assets/", "toolbox.glb", scene);

    item = model.meshes[0];
//    item.scaling.scaleInPlace(1.0);
    item.rotate(Axis.X, -Math.PI/0.5, Space.LOCAL);
    item.translate(new Vector3(2, 0, 4), 2 );

    /*
    // load animations from glTF
    const fanRunning = scene.getAnimationGroupByName("fanRunning");

    // Stop all animations to make sure the asset it ready
    scene.stopAllAnimations();
    
    // run the fanRunning animation
    if (fanRunning !== null)
      fanRunning.start(true);
    */
  };
   
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

  loadmesh(scene);

  activateWebXR(scene);  

  return scene;

};

async function activateWebXR(scene: Scene) {

  let placementIndicator: AbstractMesh;
  var modelPlaced: boolean = false;


  try {
      const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
          sessionMode: "immersive-ar",
        },
        optionalFeatures: ["hit-test", "anchors"],
      });
      const fm = xr.baseExperience.featuresManager;

      const hitTest = fm.enableFeature(WebXRHitTest, 'latest') as WebXRHitTest;

      placementIndicator = MeshBuilder.CreateTorus("torus", {thickness: 0.01, diameter: 0.1, tessellation: 64}, scene);
      var indicatorMat = new StandardMaterial('noLight', scene);
      indicatorMat.disableLighting = true;
      indicatorMat.emissiveColor = Color3.White();
      placementIndicator.material = indicatorMat;
      placementIndicator.scaling = new Vector3(1, 0.01, 1);
      placementIndicator.setEnabled(false);

      hitTest.onHitTestResultObservable.add((results) => {
        if (results.length) {
          if (!modelPlaced) {
            placementIndicator.setEnabled(true);
//            placementIndicator.isVisible = false;
          }
          else {
//            placementIndicator.setEnabled(false);
          }

          if (placementIndicator) {
            placementIndicator.position = results[0].position;
            modelPlaced = true;
            if (item !== undefined) {
              item.rotationQuaternion = Quaternion.Identity();
//              placementIndicator.setEnabled(false);
              item.setEnabled(true);
              item.position = placementIndicator.position.clone();
              item.scalingDeterminant = 0.2;
            }
          }
        } else {
          placementIndicator.setEnabled(false);
        }
      });

      const planeDetector = fm.enableFeature(WebXRPlaneDetector, "latest") as WebXRPlaneDetector;
      const planes: any[] = [];

      planeDetector.onPlaneUpdatedObservable.add(webXRPlane => {

        // we have to transform the plane's type because of typescript complaining if not
        let plane : any = webXRPlane;
        if (plane.mesh) {
            plane.mesh.dispose(false, false);
        }

        const some = plane.polygonDefinition.some((p: any) => !p);
        if (some) {
            return;
        }

        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        try {
          plane.mesh = MeshBuilder.CreatePolygon("plane", { shape : plane.polygonDefinition }, scene, earcut);
          let tubeMesh : Mesh =  MeshBuilder.CreateTube("tube", { path: plane.polygonDefinition, radius: 0.005, sideOrientation: Mesh.FRONTSIDE, updatable: true }, scene);
          tubeMesh.setParent(plane.mesh);
          planes[plane.id] = (plane.mesh);

          const mat = new StandardMaterial("mat", scene);
          mat.alpha = 0.5;
          mat.diffuseColor = Color3.Random();


          plane.mesh.material = mat;
          plane.mesh.rotationQuaternion = new Quaternion();
          plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
          plane.mesh.receiveShadows = true;
        }
        catch (ex)
        {
          console.error(ex);
        }
      });

      planeDetector.onPlaneAddedObservable.add(webxrplane => {

        // we have to transform the plane's type because of typescript complaining if not
        let plane: any = webxrplane;

        webxrplane.polygonDefinition.push(webxrplane.polygonDefinition[0]);

        try {
          plane.mesh = MeshBuilder.CreatePolygon("plane", { shape : plane.polygonDefinition }, scene, earcut);
          let tubeMesh : Mesh =  MeshBuilder.CreateTube("tube", { path: plane.polygonDefinition, radius: 0.005, sideOrientation: Mesh.FRONTSIDE, updatable: true }, scene);
          tubeMesh.setParent(plane.mesh);
          planes[plane.id] = (plane.mesh);

          const mat = new StandardMaterial("mat", scene);
          mat.alpha = 0.5;
          mat.diffuseColor = Color3.Random();

          plane.mesh.material = mat;

          plane.mesh.rotationQuaternion = new Quaternion();
          plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
        }
        catch (ex)
        {
          console.error(ex);
        }
      });
      
      planeDetector.onPlaneRemovedObservable.add(plane => {
        if (plane && planes[plane.id]) {
            planes[plane.id].dispose()
        }
      })

  } catch (e) {
      // no XR support
      console.log('no WebXr support');
  }  
}

const BabylonView: FC = () => {

  let item: AbstractMesh;

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

    var scene: Scene;

    scene = createScene(engine, canvas);

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
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
