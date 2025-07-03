import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';

export const useThreeControls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const [isControlling, setIsControlling] = useState(false);

  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      const handleStart = () => setIsControlling(true);
      const handleEnd = () => setIsControlling(false);
      
      controls.addEventListener('start', handleStart);
      controls.addEventListener('end', handleEnd);
      
      return () => {
        controls.removeEventListener('start', handleStart);
        controls.removeEventListener('end', handleEnd);
      };
    }
  }, []);

  const setCameraPosition = (x, y, z) => {
    if (controlsRef.current) {
      camera.position.set(x, y, z);
      controlsRef.current.update();
    }
  };

  const setCameraTarget = (x, y, z) => {
    if (controlsRef.current) {
      controlsRef.current.target.set(x, y, z);
      controlsRef.current.update();
    }
  };

  const resetCamera = () => {
    setCameraPosition(5, 5, 5);
    setCameraTarget(0, 0, 0);
  };

  const setCameraPreset = (preset) => {
    switch (preset) {
      case 'top':
        setCameraPosition(0, 20, 0);
        setCameraTarget(0, 0, 0);
        break;
      case 'front':
        setCameraPosition(0, 5, 15);
        setCameraTarget(0, 0, 0);
        break;
      case 'side':
        setCameraPosition(15, 5, 0);
        setCameraTarget(0, 0, 0);
        break;
      case 'isometric':
        setCameraPosition(10, 10, 10);
        setCameraTarget(0, 0, 0);
        break;
      default:
        resetCamera();
    }
  };

  return {
    controlsRef,
    isControlling,
    setCameraPosition,
    setCameraTarget,
    resetCamera,
    setCameraPreset
  };
};

export default useThreeControls;