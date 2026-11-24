/**
 * OpenBone interoperability bridge.
 *
 * OpenBone is MIT-licensed: https://github.com/UXCentury/open-bone
 * This adapter keeps Maya Shadow's project model intact while allowing its
 * character rigs to be evaluated by the OpenBone runtime.
 */
import { createDocument, type OpenBoneDocument } from '@openbone/core';
import { OpenBoneInstance } from '@openbone/runtime';
import type { CharacterRig } from '../rigging/rigEngine';
import type { RigPose } from './poseTrack';

const RAD_TO_DEG = 180 / Math.PI;
const wrapRadians = (value: number) => {
  let angle = value;
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
};

/**
 * Convert Maya Shadow's screen-space (Y-down, radians) rig into OpenBone's
 * skeleton-space (Y-up, degrees) document. Bone IDs and hierarchy are kept.
 */
export function characterRigToOpenBoneDocument(rig: CharacterRig): OpenBoneDocument {
  const doc = createDocument('Maya Shadow Character Rig');
  doc.width = 100;
  doc.height = 100;
  doc.originX = 50;
  doc.originY = 50;

  const byId = new Map(rig.bones.map((bone) => [bone.id, bone]));
  doc.skeleton.bones = rig.bones.map((bone) => {
    const parent = bone.parentId ? byId.get(bone.parentId) : undefined;
    const parentScreenRotation = parent?.rotation ?? 0;
    const localScreenRotation = wrapRadians(bone.rotation - parentScreenRotation);
    const isRoot = !parent;
    return {
      id: bone.id,
      name: bone.id,
      parent: parent?.id ?? null,
      length: Math.max(0, bone.length),
      x: isRoot ? bone.x - 50 : 0,
      y: isRoot ? 50 - bone.y : 0,
      rotation: -localScreenRotation * RAD_TO_DEG,
      scaleX: 1,
      scaleY: 1,
      shearX: 0,
      shearY: 0,
      inherit: 'normal' as const,
    };
  });
  return doc;
}

/** Create the MIT OpenBone runtime instance for a Maya Shadow character rig. */
export function createOpenBoneRigInstance(rig: CharacterRig): OpenBoneInstance {
  return new OpenBoneInstance(characterRigToOpenBoneDocument(rig));
}

/**
 * Apply a Maya Shadow pose (absolute screen-space radians) to an OpenBone
 * instance, converting it to local Y-up degrees before updating world bones.
 */
export function applyMayaShadowPoseToOpenBone(
  instance: OpenBoneInstance,
  rig: CharacterRig,
  pose: RigPose,
): void {
  const byId = new Map(rig.bones.map((bone) => [bone.id, bone]));
  for (const source of rig.bones) {
    const bone = instance.skeleton.findBone(source.id);
    if (!bone) continue;
    const parent = source.parentId ? byId.get(source.parentId) : undefined;
    const parentRotation = parent ? (pose[parent.id]?.rotation ?? parent.rotation) : 0;
    const worldRotation = pose[source.id]?.rotation ?? source.rotation;
    bone.rotation = -wrapRadians(worldRotation - parentRotation) * RAD_TO_DEG;
  }
  instance.skeleton.updateWorldTransform();
}
