![GLTFSJSX](https://i.imgur.com/ZB4uUaz.png)

[![Version](https://img.shields.io/npm/v/@react-three/gltfjsx?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@react-three/gltfjsx) [![Discord Shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/ZZjjNvJ)

Turns GLTF assets into dynamic, re-usable [react-three-fiber](https://github.com/pmndrs/react-three-fiber) JSX components. See it in action here: https://twitter.com/0xca0a/status/1224335000755146753

The usual GLTF workflow is cumbersome: objects can only be found by traversal, changes are made by mutation, making contents conditional is hard. With gltfjsx the full graph is declarative and immutable. It creates look-up tables of all the objects and materials inside your asset, it will not touch or modify your files in any way.

## Usage

```bash
Usage
  npx gltfjsx [path/to/model.gltf] [options]

Options
  --types, -t      Add Typescript definitions
  --verbose, -v    Verbose output w/ names and empty groups
  --meta, -m       Include metadata (as userData)
  --precision, -p  Number of fractional digits (default: 2)
  --draco, -d      Draco binary path
  --root, -r       Sets directory from which .gltf file is served

Examples
  npx gltfjsx model.glb -t
```

### Requirements

- The GLTF file has to be present in your projects `/public` folder
- [three](https://github.com/mrdoob/three.js/) (>= 121.x)
- [react-three-fiber](https://github.com/pmndrs/react-three-fiber) (>= 5.x)
- [@react-three/drei](https://github.com/pmndrs/drei) (>= 2.x)

### A typical result will look like this

```jsx
/*
auto-generated by: https://github.com/react-spring/gltfjsx
author: abcdef (https://sketchfab.com/abcdef)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/models/...
title: Model
*/

import React from 'react'
import { useLoader } from 'react-three-fiber'
import { useGLTF } from '@react-three/drei/useGLTF'

export default function Model(props) {
  const { nodes, materials } = useGLTF('/model.gltf')
  return (
    <group {...props} dispose={null}>
      <group name="Camera" position={[10, 0, 50]} rotation={[Math.PI / 2, 0, 0]}>
        <primitive object={nodes.Camera_Orientation} />
      </group>
      <group name="Sun" position={[100, 50, 100]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={nodes.Sun_Orientation} />
      </group>
      <group name="Cube">
        <mesh material={materials.base} geometry={nodes.Cube_003_0.geometry} />
        <mesh material={materials.inner} geometry={nodes.Cube_003_1.geometry} />
      </group>
    </group>
  )
}

useGLTF.preload('/model.gltf')
```

This component is async and must be wrapped into `<Suspense>` for fallbacks:

```jsx
import React, { Suspense } from 'react'

function App() {
  return (
    <Suspense fallback={null}>
      <Model />
    </Suspense>
```

### Draco compression

You don't need to do anything if your models are draco compressed, since `useGLTF` defaults to a draco CDN (`https://www.gstatic.com/draco/v1/decoders/`). By adding the `--draco` flag you can refer to [local binaries](https://github.com/mrdoob/three.js/tree/dev/examples/js/libs/draco/gltf) which must reside in your /public folder.

### Animation

If your GLTF contains animations it will add [drei's](https://github.com/pmndrs/drei) `useAnimations` hook, which extracts all clips and prepares them as actions:

```jsx
const { nodes, materials, animations } = useGLTF('/model.gltf')
const { actions } = useAnimations(animations, group)
```

If you want to play an animation you can do so at any time:

```jsx
<mesh onClick={(e) => actions.jump.play()} />
```

if you want to blend animations:

```jsx
const [name, setName] = useState("jump")
...
useEffect(() => {
  actions[name].reset().fadeIn(0.5).play()
  return () => actions[name]].fadeOut(0.5)
}, [name])
```

### Preload

The asset will be preloaded by default, this makes it quicker to load and reduces time-to-paint. Remove the preloader if you don't need it.

```jsx
export default function Model(props) {
  const { nodes, materials } = useGLTF('/model.gltf')
  ...
}

useGLTF.preload('/model.gltf')
```

### Types

Add the `--types` flag and your GLTF will be typesafe.

```tsx
type GLTFResult = GLTF & {
  nodes: {
    cube1: THREE.Mesh
    cube2: THREE.Mesh
  }
  materials: {
    base: THREE.MeshStandardMaterial
    inner: THREE.MeshStandardMaterial
  }
}

export default function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF<GLTFResult>('/model.gltf')
```
