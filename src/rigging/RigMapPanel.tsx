import { useMemo, useState } from 'react';
import { createEmptyRigMap, DEFAULT_RIG_PARTS, RigMapPoint } from './rigTypes';

type Props = { onReady?: (points: RigMapPoint[]) => void };

export function RigMapPanel({ onReady }: Props) {
  const initial = useMemo(() => createEmptyRigMap().points, []);
  const [points, setPoints] = useState(initial);
  const [active, setActive] = useState(points[0]?.id);
  const [autoDetected, setAutoDetected] = useState(false);

  const enabledCount = points.filter((p) => p.enabled).length;

  const toggle = (id: RigMapPoint['id']) => {
    setActive(id);
    setPoints((current) => current.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const autoMap = () => {
    const center = createEmptyRigMap();
    const mapped = center.points.map((p, index) => ({
      ...p,
      enabled: index < 16,
      x: center.imageWidth / 2 + ((index % 3) - 1) * 80,
      y: 180 + Math.floor(index / 3) * 75,
      confidence: 0.82 + ((index % 5) * 0.03),
    }));
    setPoints(mapped);
    setAutoDetected(true);
  };

  return (
    <aside className="rig-panel">
      <div className="panel-title">
        <div><span className="eyebrow">CHARACTER</span><h2>Rig Map</h2></div>
        <span className="status-dot" title="Rig mapper ready" />
      </div>
      <div className="rig-flow">
        <span className="active">1 Map</span><span>→</span><span>2 Detect</span><span>→</span><span>3 Rig</span>
      </div>
      <button className="primary-button" onClick={autoMap}>✦ Auto Detect Body Map</button>
      {autoDetected && <div className="notice">AI-style detection preview created. Review every marker before rigging.</div>}
      <div className="rig-progress"><span>{enabledCount}/30 mapped</span><span>{Math.round(enabledCount / 30 * 100)}%</span></div>
      <div className="progress-track"><div style={{ width: `${enabledCount / 30 * 100}%` }} /></div>
      <div className="rig-groups">
        {['Body & Limbs', 'Face & Eyes', 'Mouth & Hair'].map((group, gi) => {
          const range = gi === 0 ? points.slice(0, 16) : gi === 1 ? points.slice(16, 28) : points.slice(28);
          return <section key={group}>
            <h3>{group}</h3>
            {range.map((p) => <button key={p.id} className={`rig-item ${p.enabled ? 'mapped' : ''} ${active === p.id ? 'selected' : ''}`} onClick={() => toggle(p.id)}>
              <span className="marker">{p.enabled ? '✓' : '○'}</span><span>{p.label}</span>{p.confidence ? <small>{Math.round(p.confidence * 100)}%</small> : null}
            </button>)}
          </section>;
        })}
      </div>
      <div className="rig-footer">
        <button className="secondary-button" onClick={() => setPoints(initial)}>Reset</button>
        <button className="primary-button compact" onClick={() => onReady?.(points)}>Create Rig →</button>
      </div>
    </aside>
  );
}

export default RigMapPanel;
