import React, { useMemo, useState } from 'react';

export type RigPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
  group: 'body' | 'face' | 'mouth' | 'hair';
};

const initialPoints: RigPoint[] = [
  { id: 'head', label: 'Head', x: 50, y: 16, group: 'body' },
  { id: 'neck', label: 'Neck', x: 50, y: 25, group: 'body' },
  { id: 'spine', label: 'Spine', x: 50, y: 43, group: 'body' },
  { id: 'pelvis', label: 'Pelvis', x: 50, y: 60, group: 'body' },
  { id: 'l-shoulder', label: 'L Shoulder', x: 36, y: 30, group: 'body' },
  { id: 'r-shoulder', label: 'R Shoulder', x: 64, y: 30, group: 'body' },
  { id: 'l-elbow', label: 'L Elbow', x: 27, y: 45, group: 'body' },
  { id: 'r-elbow', label: 'R Elbow', x: 73, y: 45, group: 'body' },
  { id: 'l-hand', label: 'L Hand', x: 21, y: 60, group: 'body' },
  { id: 'r-hand', label: 'R Hand', x: 79, y: 60, group: 'body' },
  { id: 'l-knee', label: 'L Knee', x: 43, y: 76, group: 'body' },
  { id: 'r-knee', label: 'R Knee', x: 57, y: 76, group: 'body' },
  { id: 'l-foot', label: 'L Foot', x: 40, y: 94, group: 'body' },
  { id: 'r-foot', label: 'R Foot', x: 60, y: 94, group: 'body' },
  { id: 'l-eye', label: 'L Eye', x: 46, y: 17, group: 'face' },
  { id: 'r-eye', label: 'R Eye', x: 54, y: 17, group: 'face' },
  { id: 'mouth', label: 'Mouth', x: 50, y: 23, group: 'mouth' },
  { id: 'brow-l', label: 'L Brow', x: 46, y: 13, group: 'face' },
  { id: 'brow-r', label: 'R Brow', x: 54, y: 13, group: 'face' },
  { id: 'hair', label: 'Hair', x: 50, y: 8, group: 'hair' },
];

const bones: [string, string][] = [
  ['head', 'neck'], ['neck', 'spine'], ['spine', 'pelvis'],
  ['neck', 'l-shoulder'], ['l-shoulder', 'l-elbow'], ['l-elbow', 'l-hand'],
  ['neck', 'r-shoulder'], ['r-shoulder', 'r-elbow'], ['r-elbow', 'r-hand'],
  ['pelvis', 'l-knee'], ['l-knee', 'l-foot'], ['pelvis', 'r-knee'], ['r-knee', 'r-foot'],
];

export default function RigMapCanvas() {
  const [points, setPoints] = useState(initialPoints);
  const [selected, setSelected] = useState('head');
  const [activeGroup, setActiveGroup] = useState<RigPoint['group'] | 'all'>('all');
  const visible = useMemo(() => activeGroup === 'all' ? points : points.filter(p => p.group === activeGroup), [points, activeGroup]);

  const movePoint = (id: string, e: React.PointerEvent<HTMLButtonElement>) => {
    const canvas = e.currentTarget.parentElement?.parentElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
    setPoints(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
  };

  const pointById = (id: string) => points.find(p => p.id === id)!;

  return (
    <section className="rig-map-panel">
      <header className="rig-map-header">
        <div>
          <span className="eyebrow">RIG MAP / MANUAL CORRECTION</span>
          <h2>Character Rig Map</h2>
          <p>Drag markers directly onto the character to define the skeleton and facial controls.</p>
        </div>
        <div className="rig-map-actions">
          <button onClick={() => setPoints(initialPoints)}>Reset Map</button>
          <button className="primary" onClick={() => alert('Rig generation pipeline is ready for the next module.')}>Create Rig</button>
        </div>
      </header>

      <div className="rig-filter-row">
        {(['all', 'body', 'face', 'mouth', 'hair'] as const).map(group => (
          <button key={group} className={activeGroup === group ? 'active' : ''} onClick={() => setActiveGroup(group)}>
            {group === 'all' ? 'All Points' : group[0].toUpperCase() + group.slice(1)}
          </button>
        ))}
        <span className="map-status">{points.length} controls • {points.filter(p => p.group === 'body').length} body points</span>
      </div>

      <div className="rig-map-stage">
        <div className="character-guide" aria-label="Character placement guide">
          <div className="guide-head" />
          <div className="guide-neck" />
          <div className="guide-torso" />
          <div className="guide-arm left" />
          <div className="guide-arm right" />
          <div className="guide-leg left" />
          <div className="guide-leg right" />
          <div className="guide-eye left" />
          <div className="guide-eye right" />
          <div className="guide-mouth" />
        </div>

        <svg className="rig-bones" viewBox="0 0 100 100" preserveAspectRatio="none">
          {bones.map(([a, b]) => {
            const p1 = pointById(a), p2 = pointById(b);
            return <line key={`${a}-${b}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
          })}
        </svg>

        {visible.map(point => (
          <button
            key={point.id}
            className={`rig-point ${point.group} ${selected === point.id ? 'selected' : ''}`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onPointerDown={e => { setSelected(point.id); e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) movePoint(point.id, e); }}
            title={point.label}
            aria-label={`Rig point ${point.label}`}
          >
            <span />
            <b>{point.label}</b>
          </button>
        ))}

        <div className="stage-hint">IMPORT CHARACTER → PLACE MAP POINTS → CREATE RIG</div>
      </div>

      <footer className="rig-map-footer">
        <div><strong>Selected:</strong> {pointById(selected)?.label}</div>
        <div><strong>Next:</strong> automatic skeleton, IK, mesh deformation & expression rig</div>
      </footer>
    </section>
  );
}
