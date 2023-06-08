import { WebIO } from '@gltf-transform/core'
import {
  simplify,
  instance,
  flatten,
  dequantize,
  join,
  weld,
  sparse,
  dedup,
  resample,
  prune,
  textureCompress,
  draco,
} from '@gltf-transform/functions'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'
import { ready as resampleReady, resample as resampleWASM } from 'keyframe-resample'
import { BufferUtils } from '@gltf-transform/core';
// import draco3d from 'draco3dgltf'
// import Jimp from 'jimp';

async function transformWeb(file, output, config = {}) {
  await MeshoptDecoder.ready
  await MeshoptEncoder.ready
  const io = new WebIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  //   'draco3d.decoder': await draco3d.createDecoderModule(),
  //   'draco3d.encoder': await draco3d.createEncoderModule(),
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  })

  const document = await io.read(file)
  const resolution = config.resolution ?? 1024
  const outputQuality = 20;

  const functions = [dedup(), instance({ min: 5 }), flatten(), dequantize()]

  if (!config.keepmeshes) {
    functions.push(join())
  }

  if (config.simplify) {
    functions.push(
      // Weld vertices
      weld({ tolerance: config.weld ?? 0.0001 / 2 }),
      // Simplify meshes
      simplify({ simplifier: MeshoptSimplifier, ratio: config.ratio ?? 0, error: config.error ?? 0.0001 })
    )
  }

  functions.push(
    resample({ ready: resampleReady, resample: resampleWASM }),
    prune({ keepAttributes: false, keepLeaves: false }),
    // customResize({size: [resolution, resolution], quality: outputQuality}),
    sparse()
  )

  functions.push(draco())

  await document.transform(...functions)

  document.getRoot().listTextures()[0].getImage()

  await io.write(output, document)
}

/*
function customResize({ size, quality }) {
  return async (document) => {
    for (const texture of document.getRoot().listTextures()) {

      const buffer = await Jimp.read(texture.getImage())
        .resize(size[0], size[1], { upscale: false })
        .quality(quality)
        .getBufferAsync(Jimp.MIME_JPEG);

      texture.setImage(BufferUtils.toView(buffer));

    }
  };
}
*/

export default transformWeb
