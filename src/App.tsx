// https://ipfs.io/ipfs/QmbggeqWQjLwNb9FZ6m6taUuRoXuC9rYWPzFw3hNUuxHrF/

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
  PointerEventTypes,
  Scene,
  Space,
  StandardMaterial,
  FreeCamera,
  SceneLoader, 
  ExtrudeShapeCustom,
  TransformNode
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
  WebXRCamera,
  WebXRHitTest,
  WebXRState,
  WebXRPlaneDetector,
  WebXRAnchorSystem,
  IWebXRHitResult
 } from '@babylonjs/core/XR';

import { useEffect, useRef } from "react";

let item: AbstractMesh | undefined;
let item2: AbstractMesh | undefined;
let item3: AbstractMesh | undefined;

var itemState = 0;
var itemRotation = 0.0;
let pivot: TransformNode | undefined;
//var cor = new Vector3(0,1,0);

const loadmodel = async (scene: Scene) => {

  const model = await SceneLoader.ImportMeshAsync("", "https://bafybeibyoumttavsexltkqbcbkkae6rgm46a6mijdahzwp6yclkzeuecia.ipfs.nftstorage.link/","toolbox.glb" , scene);

  // const model = await SceneLoader.ImportMeshAsync("", "https://nftstorage.link/ipfs/bafybeibyoumttavsexltkqbcbkkae6rgm46a6mijdahzwp6yclkzeuecia/","toolbox.glb" , scene);
  //  const model = await SceneLoader.ImportMeshAsync("", "https://gateway.pinata.cloud/ipfs/QmSmaEnrPWZoos4SH9btG2xe3osrgMwmyac4h2n7xcWeNa/","toolbox.glb" , scene);
  // const model = await SceneLoader.ImportMeshAsync("", "https://siegfriedschaefer.github.io/rn-babylonjs-pg/assets/", "toolbox.glb", scene);

  item = model.meshes[0];
  item.name = "Toolbox";
  item2 = model.meshes[1];
  item3 = model.meshes[2];

  item.setEnabled(false);
  item.scaling.scaleInPlace(0.2);


//  model.meshes[0].setEnabled(false);
//  model.meshes[1].setEnabled(false);
//  model.meshes[2].setEnabled(false);

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



// Test screen, just to see something
function createScene(engine: Engine, canvas: HTMLCanvasElement) :  Scene  {
   
  // Create the scene space
  var scene = new Scene(engine);
  scene.createDefaultEnvironment({ createGround: false, createSkybox: false });

  // Add a camera to the scene and attach it to the canvas
  var camera = new FreeCamera("camera1", new Vector3(0, 2, -10), scene);
  camera.setTarget(Vector3.Zero());

  // var camera = new ArcRotateCamera("Camera", Math.PI / 2, 15 * Math.PI / 32, 25, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  // Add lights to the scene
  // var light2 = new PointLight("Omni0", new Vector3(0, 1, -1), scene);
  var light1 = new HemisphericLight("light1", new Vector3(0, 3, 0), scene);

  // var sphere = MeshBuilder.CreateSphere("sphere", {}, scene);

  activateWebXR(scene);  

  return scene;

};

async function activateWebXR(scene: Scene) {

  let placementIndicator: AbstractMesh;
  var modelPlaced: boolean = false;
  var hitpoint : IWebXRHitResult ;

/*
  // record state of AudioMediaStream
  let audioStream: MediaStream | undefined = undefined;

  // try to get am AudioMediaStream for recording
  function getAudioStream() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioStream = stream;
    }).catch(() => {
      audioStream = undefined;
    });
  }

  // record Microphone input
  function recordAudio() {
    if (audioStream) {
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 3000);
      mediaRecorder.ondataavailable = (e) => {
        const audioBlob = new Blob([e.data], { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      };
    } else {
      console.log('no audio stream');
    }
  }
*/
  
    const sessionManager = new WebXRSessionManager(scene);
  const supported = await sessionManager.isSessionSupportedAsync('immersive-ar');
  if (!supported) {
    return;
  }

  try {
      const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
          sessionMode: "immersive-ar",
        },
        optionalFeatures: ["hit-test", "anchors","unbounded"],
      });

      if (!xr.baseExperience) {
        return;
      }

      // Loading the model after setting up the XR-Experience helps to get rid of some
      // wired rendering effects like unusual, but happening when loading before the setup, black box effects.
      loadmodel(scene);

      // var xrSession = xr.baseExperience.sessionManager;

      // getAudioStream();

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

            if (itemState == 0) {
              hitpoint = results[0];
              let quat: Quaternion = placementIndicator.rotationQuaternion as Quaternion;
              hitpoint.transformationMatrix.decompose(placementIndicator.scaling, quat, placementIndicator.position);
              placementIndicator.position = results[0].position;
            }              
/*
            modelPlaced = true;
            if (item !== undefined) {
              item.rotationQuaternion = Quaternion.Identity();
//              placementIndicator.setEnabled(false);
              item.setEnabled(true);
              item.position = placementIndicator.position.clone();
              item.scalingDeterminant = 0.2;
            }
*/
          }
        } else {
          placementIndicator.setEnabled(false);
        }
      });


      const anchorSystem = fm.enableFeature(WebXRAnchorSystem, 'latest') as WebXRAnchorSystem;

      if (anchorSystem) {

        anchorSystem.onAnchorAddedObservable.add(webxranchor => {
          let anchor: any = webxranchor;
            if (item !== undefined) {
              // anchor.attachedNode = item;
            }
        })

        anchorSystem.onAnchorRemovedObservable.add(webxranchor => {
            let anchor: any = webxranchor;
            if (anchor) {
                // anchor.attachedNode.dispose();
            }
        });
      }

      scene.onBeforeRenderObservable.add(() => {
        if ((item !== undefined) && (item2 !== undefined) && (item3 !== undefined)) {
          // var axis = new Vector3(0,0,1);

//          item2.setPivotPoint(Vector3.Left());
//          console.log("pivot: " + pivot);
          if (item !== undefined) {
            item.rotate(Vector3.Up(), (-Math.PI * itemRotation) / 150);
          }
        }
      });


      scene.onPointerDown = (evt, pickInfo) => {

        if (hitTest && anchorSystem && xr.baseExperience.state === WebXRState.IN_XR) {
          if (hitpoint) {
          console.log("add hitpoint: " + hitpoint.position);
          // anchorSystem.addAnchorPointUsingHitTestResultAsync(hitpoint);
          if ((item !== undefined) && (item2 !== undefined) && (item3 !== undefined)) {

            if (itemState === 0) {

              item.position.x = hitpoint.position.x;
              item.position.y = hitpoint.position.y;
              item.position.z = hitpoint.position.z; 
              item.setEnabled(true);

              /*
              pivot = new TransformNode("lid2");
              pivot.position = item.position;
              item.parent = pivot;
              */
              itemState = 1;
            }
          }
        }
      }
    }

    scene.onPointerObservable.add((pointerInfo) => {
      console.log("pointerInfo: ", pointerInfo.type);
        if (itemState === 1) {
          switch (pointerInfo.type) {
              case PointerEventTypes.POINTERDOWN:
                {
                  var pickResult = pointerInfo.pickInfo;
                  if (pickResult != null) {
                    if (pickResult.hit) {
                      var pickedMesh = pickResult.pickedMesh;
                      if (pickedMesh != null) {
                        if ((pickedMesh.name === "base") || (pickedMesh.name === "Lid")) {
                          if (itemRotation === 0) {
//                             recordAudio();
                            itemRotation = 1.0;
                          } else {
                            itemRotation = 0.0;
                            itemState = 0;
                          }
                          break;
                        }
                      }
                    }
                  }
                  break;
                }
              case PointerEventTypes.POINTERPICK:
              break;
          }
        }
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
