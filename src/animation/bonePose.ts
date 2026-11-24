import { CharacterRig, RigBone } from '../rigging/rigEngine';
import { createOpenBoneRigInstance, applyMayaShadowPoseToOpenBone } from './openBoneBridge';

export type BonePose = { rotation: number };
export type PosedBone = RigBone & { px: number; py: number; worldRotation: number };

const rad = (deg: number) => deg * Math.PI / 180;

/**
 * Resolve the character through the MIT OpenBone skeletal runtime.
 * Maya Shadow stores screen-space Y-down radians; the bridge converts to
 * OpenBone's Y-up degrees and back, preserving the existing editor contract.
 */
export function poseRig(rig: CharacterRig, poses: Record<string, BonePose> = {}): PosedBone[] {
  const instance = createOpenBoneRigInstance(rig);
  applyMayaShadowPoseToOpenBone(instance, rig, poses);
  return rig.bones.map((source) => {
    const bone = instance.skeleton.findBone(source.id);
    if (!bone) {
      return { ...source, px: source.x, py: source.y, worldRotation: source.rotation };
    }
    const px = bone.world.x + 50;
    const py = 50 - bone.world.y;
    const x = px + bone.world.a * bone.data.length;
    const y = py - bone.world.b * bone.data.length;
    const worldRotation = Math.atan2(-bone.world.b, bone.world.a);
    return { ...source, px, py, x, y, rotation: worldRotation, worldRotation };
  });
}

export function degrees(r: number) { return Math.round((r * 180) / Math.PI * 10) / 10; }
export function normalizeAngle(r: number) { while (r > Math.PI) r -= Math.PI * 2; while (r < -Math.PI) r += Math.PI * 2; return r; }
export function angleTo(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.atan2(b.y - a.y, b.x - a.x); }
export function rotateLocalFromWorld(parentWorld: number, world: number) { return normalizeAngle(world - parentWorld); }
export function percentToRadians(v: number, range = 45) { return rad(Math.max(-100, Math.min(100, v)) * range / 100); }
