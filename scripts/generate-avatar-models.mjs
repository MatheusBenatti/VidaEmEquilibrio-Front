import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'public', 'models');

const COMPONENT_TYPE = {
  FLOAT: 5126,
  UNSIGNED_SHORT: 5123,
};

const TARGET = {
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
};

const cubePositions = [
  -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
  0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
  -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
  -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
  0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
  -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
];

const cubeNormals = [
  0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
  0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
  0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
  0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
  -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
];

const cubeIndices = [
  0, 1, 2, 0, 2, 3,
  4, 5, 6, 4, 6, 7,
  8, 9, 10, 8, 10, 11,
  12, 13, 14, 12, 14, 15,
  16, 17, 18, 16, 18, 19,
  20, 21, 22, 20, 22, 23,
];

const colors = {
  male: {
    skin: [0.84, 0.58, 0.38, 1],
    hair: [0.12, 0.09, 0.08, 1],
    shirt: [0.18, 0.44, 0.78, 1],
    pants: [0.12, 0.18, 0.28, 1],
    shoes: [0.08, 0.08, 0.1, 1],
  },
  female: {
    skin: [0.9, 0.64, 0.46, 1],
    hair: [0.23, 0.12, 0.08, 1],
    shirt: [0.72, 0.22, 0.52, 1],
    pants: [0.2, 0.16, 0.34, 1],
    shoes: [0.12, 0.08, 0.12, 1],
  },
};

function align4(value) {
  return (value + 3) & ~3;
}

function floats(values) {
  return Buffer.from(new Float32Array(values).buffer);
}

function ushorts(values) {
  return Buffer.from(new Uint16Array(values).buffer);
}

function quatY(angle) {
  return [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
}

function makePart(name, mesh, translation, scale) {
  return { name, mesh, translation, scale };
}

function avatarParts(type) {
  const female = type === 'female';
  return [
    makePart('Head', 0, [0, 2.42, 0], [0.54, 0.6, 0.48]),
    makePart('Hair', 1, [0, female ? 2.75 : 2.74, female ? -0.05 : -0.02], [0.62, female ? 0.22 : 0.16, female ? 0.58 : 0.5]),
    makePart('Torso', 2, [0, 1.55, 0], [female ? 0.76 : 0.82, 1.05, 0.42]),
    makePart('Hips', 3, [0, 0.9, 0], [female ? 0.82 : 0.72, 0.3, 0.42]),
    makePart('LeftArm', 0, [-0.67, 1.55, 0], [0.22, 0.95, 0.24]),
    makePart('RightArm', 0, [0.67, 1.55, 0], [0.22, 0.95, 0.24]),
    makePart('LeftLeg', 3, [-0.24, 0.2, 0], [0.26, 1.0, 0.28]),
    makePart('RightLeg', 3, [0.24, 0.2, 0], [0.26, 1.0, 0.28]),
    makePart('LeftShoe', 4, [-0.24, -0.38, 0.08], [0.32, 0.16, 0.42]),
    makePart('RightShoe', 4, [0.24, -0.38, 0.08], [0.32, 0.16, 0.42]),
  ];
}

function createGlb(type) {
  const chunks = [
    { name: 'POSITION', buffer: floats(cubePositions), target: TARGET.ARRAY_BUFFER },
    { name: 'NORMAL', buffer: floats(cubeNormals), target: TARGET.ARRAY_BUFFER },
    { name: 'INDICES', buffer: ushorts(cubeIndices), target: TARGET.ELEMENT_ARRAY_BUFFER },
    { name: 'TIME', buffer: floats([0, 1.5, 3]), target: TARGET.ARRAY_BUFFER },
    {
      name: 'ROTATION',
      buffer: floats([...quatY(-0.08), ...quatY(0.08), ...quatY(-0.08)]),
      target: TARGET.ARRAY_BUFFER,
    },
  ];

  let byteOffset = 0;
  const bufferViews = chunks.map((chunk) => {
    const view = {
      buffer: 0,
      byteOffset,
      byteLength: chunk.buffer.length,
      target: chunk.target,
    };
    byteOffset = align4(byteOffset + chunk.buffer.length);
    return view;
  });

  const bin = Buffer.alloc(byteOffset);
  chunks.forEach((chunk, index) => chunk.buffer.copy(bin, bufferViews[index].byteOffset));

  const palette = colors[type];
  const materials = [
    ['Skin', palette.skin],
    ['Hair', palette.hair],
    ['Shirt', palette.shirt],
    ['Pants', palette.pants],
    ['Shoes', palette.shoes],
  ].map(([name, baseColorFactor]) => ({
    name,
    pbrMetallicRoughness: { baseColorFactor, metallicFactor: 0, roughnessFactor: 0.85 },
  }));

  const meshes = materials.map((material, index) => ({
    name: `${material.name}Cube`,
    primitives: [{
      attributes: { POSITION: 0, NORMAL: 1 },
      indices: 2,
      material: index,
    }],
  }));

  const parts = avatarParts(type);
  const nodes = [
    { name: 'AvatarRoot', children: parts.map((_, index) => index + 1) },
    ...parts,
  ];

  const json = {
    asset: { version: '2.0', generator: 'vida-em-equilibrio-avatar-generator' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes,
    meshes,
    materials,
    animations: [{
      name: 'Idle',
      samplers: [{ input: 3, output: 4, interpolation: 'LINEAR' }],
      channels: [{ sampler: 0, target: { node: 0, path: 'rotation' } }],
    }],
    buffers: [{ byteLength: bin.length }],
    bufferViews,
    accessors: [
      {
        bufferView: 0,
        componentType: COMPONENT_TYPE.FLOAT,
        count: 24,
        type: 'VEC3',
        min: [-0.5, -0.5, -0.5],
        max: [0.5, 0.5, 0.5],
      },
      { bufferView: 1, componentType: COMPONENT_TYPE.FLOAT, count: 24, type: 'VEC3' },
      { bufferView: 2, componentType: COMPONENT_TYPE.UNSIGNED_SHORT, count: 36, type: 'SCALAR' },
      {
        bufferView: 3,
        componentType: COMPONENT_TYPE.FLOAT,
        count: 3,
        type: 'SCALAR',
        min: [0],
        max: [3],
      },
      { bufferView: 4, componentType: COMPONENT_TYPE.FLOAT, count: 3, type: 'VEC4' },
    ],
  };

  const jsonBuffer = Buffer.from(JSON.stringify(json));
  const paddedJsonLength = align4(jsonBuffer.length);
  const paddedBinLength = align4(bin.length);
  const totalLength = 12 + 8 + paddedJsonLength + 8 + paddedBinLength;
  const glb = Buffer.alloc(totalLength);

  let offset = 0;
  glb.writeUInt32LE(0x46546c67, offset);
  offset += 4;
  glb.writeUInt32LE(2, offset);
  offset += 4;
  glb.writeUInt32LE(totalLength, offset);
  offset += 4;
  glb.writeUInt32LE(paddedJsonLength, offset);
  offset += 4;
  glb.writeUInt32LE(0x4e4f534a, offset);
  offset += 4;
  jsonBuffer.copy(glb, offset);
  glb.fill(0x20, offset + jsonBuffer.length, offset + paddedJsonLength);
  offset += paddedJsonLength;
  glb.writeUInt32LE(paddedBinLength, offset);
  offset += 4;
  glb.writeUInt32LE(0x004e4942, offset);
  offset += 4;
  bin.copy(glb, offset);

  return glb;
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'male.glb'), createGlb('male'));
writeFileSync(join(outputDir, 'female.glb'), createGlb('female'));
