import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';

export const useThreeControls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const [isControlling, setIsControlling] = useState(false);
  const [isDraggingObject, setIsDraggingObject] = useState(false);

  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      const handleStart = () => {
        if (!isDraggingObject) {
          setIsControlling(true);
        }
      };
      
      const handleEnd = () => {
        setIsControlling(false);
      };
      
      controls.addEventListener('start', handleStart);
      controls.addEventListener('end', handleEnd);
      
      return () => {
        controls.removeEventListener('start', handleStart);
        controls.removeEventListener('end', handleEnd);
      };
    }
  }, [isDraggingObject]);

  const setCameraPosition = (x, y, z) => {
    if (controlsRef.current && camera) {
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

  // Enhanced control management for drag operations
  const disableControls = () => {
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
      setIsDraggingObject(true);
    }
  };

  const enableControls = () => {
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
      setIsDraggingObject(false);
    }
  };

  // Focus camera on selected furniture
  const focusOnObject = (position, distance = 8) => {
    if (position && controlsRef.current) {
      const { x = 0, z = 0 } = position;
      setCameraPosition(x + distance, 5, z + distance);
      setCameraTarget(x, 0, z);
    }
  };

  return {
    controlsRef,
    isControlling,
    isDraggingObject,
    setCameraPosition,
    setCameraTarget,
    resetCamera,
    setCameraPreset,
    disableControls,
    enableControls,
    focusOnObject
  };
};

export default useThreeControls;