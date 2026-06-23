import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import '../styles/Avatar3D.css';

export const AVATAR_MODELS = {
  male: '/models/male.glb',
  female: '/models/female.glb',
};

const DEFAULT_AVATAR = 'male';

export const normalizeAvatarType = (type) => (
  Object.prototype.hasOwnProperty.call(AVATAR_MODELS, type) ? type : DEFAULT_AVATAR
);

function AvatarModel({ type }) {
  const group = useRef();
  const modelPath = AVATAR_MODELS[normalizeAvatarType(type)];
  const { scene, animations } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const idleAnimation =
      animations.find((animation) => animation.name.toLowerCase().includes('idle')) ||
      animations[0];

    if (!idleAnimation) {
      return undefined;
    }

    const action = actions[idleAnimation.name];
    action?.reset().fadeIn(0.2).play();

    return () => {
      action?.fadeOut(0.2);
    };
  }, [actions, animations]);

  return (
    <group ref={group} position={[0, -1.45, 0]} rotation={[0, 0.12, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

function AvatarFallback() {
  return (
    <div className="avatar3d-fallback" aria-hidden="true">
      Carregando avatar...
    </div>
  );
}

function Avatar3D({ type = DEFAULT_AVATAR, className = '' }) {
  const avatarType = normalizeAvatarType(type);

  return (
    <div className={`avatar3d ${className}`.trim()}>
      <Suspense fallback={<AvatarFallback />}>
        <Canvas camera={{ position: [0, 1.15, 4.4], fov: 38 }} dpr={[1, 1.75]}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} />
          <AvatarModel type={avatarType} />
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.45}
            enableDamping
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
            rotateSpeed={0.35}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

useGLTF.preload(AVATAR_MODELS.male);
useGLTF.preload(AVATAR_MODELS.female);

export default Avatar3D;
