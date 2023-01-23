import { FC } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

const App: FC = () => {
  return (
    <div style={{ flex: 1, display: 'flex' }}>
      <Engine
        antialias
        adaptToDeviceRatio
        canvasId="babylon-js"
        renderOptions={{
          whenVisibleOnly: true,
        }}
      >
        <Scene>
          <freeCamera
            name="camera1"
            position={new Vector3(0, 5, -10)}
            setTarget={[Vector3.Zero()]}
          />
          <hemisphericLight
            name="light1"
            intensity={0.9}
            direction={new Vector3(0, 1, 0)}
          />
          <ground name="ground" width={6} height={6} />
        </Scene>
      </Engine>
    </div>
  );
}

/*
import React from 'react';
import logo from './logo.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>mtvs4u</h2>
        PWA with Babylon.js
        <p><img src={logo} className="App-logo" alt="logo" /></p>
        <p>https://github.com/siegfriedschaefer/bjs-pwa-workshop.git</p>
      </header>
    </div>
  );
}
*/

export default App;
