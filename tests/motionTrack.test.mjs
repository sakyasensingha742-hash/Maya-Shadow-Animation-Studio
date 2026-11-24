import test from 'node:test';
import assert from 'node:assert/strict';
import {interpolateMotion,motionFromTrack} from '../src/animation/motionTrack.ts';

const key=(frame,x,easing)=>({frame,transform:{x,y:0,rotation:0,scale:1},easing});
const pair=(easing)=>[key(0,0,easing),key(10,100,'linear')];

test('linear easing interpolates transform values proportionally',()=>{
  assert.equal(interpolateMotion(pair('linear'),5).x,50);
});

test('ease-in accelerates from the starting key',()=>{
  assert.equal(interpolateMotion(pair('ease-in'),5).x,25);
});

test('ease-out decelerates toward the ending key',()=>{
  assert.equal(interpolateMotion(pair('ease-out'),5).x,75);
});

test('ease-in-out uses a symmetric smooth curve',()=>{
  assert.equal(interpolateMotion(pair('ease-in-out'),2.5).x,15.625);
  assert.equal(interpolateMotion(pair('ease-in-out'),5).x,50);
});

test('legacy keys without easing retain the previous smoothstep interpolation',()=>{
  const keys=[key(0,0,undefined),key(10,100,'linear')];
  assert.equal(interpolateMotion(keys,2.5).x,15.625);
});

test('motionFromTrack preserves per-key easing metadata',()=>{
  const keys=motionFromTrack([{frame:1,value:{x:2,y:3,rotation:4,scale:1.5},easing:'ease-out'}]);
  assert.equal(keys[0].easing,'ease-out');
  assert.deepEqual(keys[0].transform,{x:2,y:3,rotation:4,scale:1.5});
});

test('interpolation clamps before the first and after the last key',()=>{
  const keys=pair('linear');
  assert.equal(interpolateMotion(keys,-5).x,0);
  assert.equal(interpolateMotion(keys,20).x,100);
});
