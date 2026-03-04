// S3: 질병 연결 매핑 관리 — Tree-view UI (PRD ADM-02, PLAN §3 예외 허용)
import { useState, useEffect, useCallback } from 'react';
import { api, type MasterItem, type DiseaseTree } from '../lib/api';

export default function DiseaseMapsPage() {
  const [diseases, setDiseases] = useState<MasterItem[]>([]);
  const [symptoms, setSymptoms] = useState<MasterItem[]>([]);
  const [metrics, setMetrics] = useState<MasterItem[]>([]);
  const [units, setUnits] = useState<MasterItem[]>([]);
  const [logtypes, setLogtypes] = useState<MasterItem[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<MasterItem | null>(null);
  const [tree, setTree] = useState<DiseaseTree | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.master.items.list('disease').then(setDiseases).catch(() => {});
    api.master.items.list('symptom').then(setSymptoms).catch(() => {});
    api.master.items.list('metric').then(setMetrics).catch(() => {});
    api.master.items.list('unit').then(setUnits).catch(() => {});
    api.master.items.list('log_type').then(setLogtypes).catch(() => {});
  }, []);

  const loadTree = useCallback(async (disease: MasterItem) => {
    setLoading(true);
    setMsg('');
    try {
      const t = await api.diseaseMaps.tree(disease.id);
      setTree(t);
      setSelectedDisease(disease);
    } catch {
      setMsg('매핑 데이터 없음 (아직 연결 없음)');
      setTree({ disease: { id: disease.id, key: disease.key }, symptoms: [] });
      setSelectedDisease(disease);
    } finally {
      setLoading(false);
    }
  }, []);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const addSymptom = async (symptomId: string) => {
    if (!selectedDisease) return;
    try {
      await api.diseaseMaps.addSymptom({ disease_id: selectedDisease.id, symptom_id: symptomId });
      await loadTree(selectedDisease);
      flash('증상 연결 완료');
    } catch (e: unknown) { flash((e as Error).message); }
  };

  const removeSymptom = async (mapId: string) => {
    if (!selectedDisease) return;
    try {
      await api.diseaseMaps.removeSymptom(mapId);
      await loadTree(selectedDisease);
      flash('증상 연결 해제');
    } catch (e: unknown) { flash((e as Error).message); }
  };

  const addMetric = async (symptomId: string, metricId: string) => {
    if (!selectedDisease) return;
    try {
      await api.diseaseMaps.addMetric({ symptom_id: symptomId, metric_id: metricId });
      await loadTree(selectedDisease);
      flash('수치 연결 완료');
    } catch (e: unknown) { flash((e as Error).message); }
  };

  const removeMetric = async (mapId: string) => {
    if (!selectedDisease) return;
    try {
      await api.diseaseMaps.removeMetric(mapId);
      await loadTree(selectedDisease);
      flash('수치 연결 해제');
    } catch (e: unknown) { flash((e as Error).message); }
  };

  const addUnit = async (metricId: string, unitId: string) => {
    if (!selectedDisease) return;
    try {
      await api.diseaseMaps.addUnit({ metric_id: metricId, unit_id: unitId });
      await loadTree(selectedDisease);
      flash('단위 연결 완료');
    } catch (e: unknown) { flash((e as Error).message); }
  };

  const removeUnit = async (mapId: string) => {
    if (!selectedDisease) return;
    try {
      await api.diseaseMaps.removeUnit(mapId);
      await loadTree(selectedDisease);
      flash('단위 연결 해제');
    } catch (e: unknown) { flash((e as Error).message); }
  };

  const addLogtype = async (metricId: string, logtypeId: string) => {
    if (!selectedDisease) return;
    try {
      await api.diseaseMaps.addLogtype({ metric_id: metricId, logtype_id: logtypeId });
      await loadTree(selectedDisease);
      flash('기록유형 연결 완료');
    } catch (e: unknown) { flash((e as Error).message); }
  };

  const removeLogtype = async (mapId: string) => {
    if (!selectedDisease) return;
    try {
      await api.diseaseMaps.removeLogtype(mapId);
      await loadTree(selectedDisease);
      flash('기록유형 연결 해제');
    } catch (e: unknown) { flash((e as Error).message); }
  };

  const linkedSymptomIds = new Set(tree?.symptoms.map(s => s.id) ?? []);

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* 왼쪽: 질병 목록 */}
      <div style={{ width: 200, flexShrink: 0 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#aaa' }}>질병 선택</h3>
        {diseases.length === 0 && <p style={{ color: '#666', fontSize: 13 }}>질병 없음</p>}
        {diseases.map(d => (
          <div
            key={d.id}
            onClick={() => loadTree(d)}
            style={{
              padding: '8px 12px', marginBottom: 4, borderRadius: 6, cursor: 'pointer',
              background: selectedDisease?.id === d.id ? '#1565c0' : '#1e1e2e',
              color: selectedDisease?.id === d.id ? '#fff' : '#ccc',
              fontSize: 13,
            }}
          >
            {d.key}
          </div>
        ))}
      </div>

      {/* 오른쪽: 트리 */}
      <div style={{ flex: 1 }}>
        {msg && <div style={{ padding: '8px 12px', background: '#1a3a1a', color: '#4caf50', borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

        {!selectedDisease && <p style={{ color: '#666' }}>왼쪽에서 질병을 선택하세요</p>}

        {selectedDisease && loading && <p style={{ color: '#aaa' }}>로딩 중...</p>}

        {selectedDisease && !loading && tree && (
          <>
            <h2 style={{ margin: '0 0 16px', fontSize: 16 }}>
              {selectedDisease.key} 매핑
            </h2>

            {/* 증상 연결 추가 */}
            <AddRow
              label="+ 증상 연결"
              items={symptoms.filter(s => !linkedSymptomIds.has(s.id))}
              onAdd={addSymptom}
            />

            {/* 트리 */}
            {tree.symptoms.map(symptom => (
              <div key={symptom.id} style={{ marginBottom: 16, background: '#1e1e2e', borderRadius: 8, padding: 12 }}>
                {/* 증상 행 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#90caf9', fontWeight: 600 }}>▸ 증상: {symptom.key}</span>
                  {symptom.is_required && <Badge label="필수" color="#ff9800" />}
                  <button onClick={() => removeSymptom(symptom.map_id)} style={btnStyle('#c62828')}>연결해제</button>
                </div>

                {/* 수치 추가 */}
                <div style={{ marginLeft: 16 }}>
                  <AddRow
                    label="+ 수치 연결"
                    items={metrics.filter(m => !symptom.metrics.some(sm => sm.id === m.id))}
                    onAdd={(metricId) => addMetric(symptom.id, metricId)}
                  />

                  {symptom.metrics.map(metric => (
                    <div key={metric.id} style={{ marginBottom: 8, background: '#12121e', borderRadius: 6, padding: 10 }}>
                      {/* 수치 행 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#ce93d8' }}>▸ 수치: {metric.key}</span>
                        <button onClick={() => removeMetric(metric.map_id)} style={btnStyle('#c62828')}>연결해제</button>
                      </div>

                      {/* 단위 + 기록유형 */}
                      <div style={{ marginLeft: 16, display: 'flex', gap: 24 }}>
                        {/* 단위 */}
                        <div>
                          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>단위</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                            {metric.units.map(u => (
                              <span key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1a2744', padding: '3px 8px', borderRadius: 12, fontSize: 12, color: '#90caf9' }}>
                                {u.key}{u.is_default && <Badge label="기본" color="#4caf50" />}
                                <button onClick={() => removeUnit(u.map_id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: 12, padding: 0 }}>✕</button>
                              </span>
                            ))}
                          </div>
                          <InlineAdd items={units.filter(u => !metric.units.some(mu => mu.id === u.id))} onAdd={(id) => addUnit(metric.id, id)} placeholder="단위 추가" />
                        </div>

                        {/* 기록유형 */}
                        <div>
                          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>기록유형</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                            {metric.log_types.map(l => (
                              <span key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1a2a1a', padding: '3px 8px', borderRadius: 12, fontSize: 12, color: '#a5d6a7' }}>
                                {l.key}{l.is_default && <Badge label="기본" color="#4caf50" />}
                                <button onClick={() => removeLogtype(l.map_id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: 12, padding: 0 }}>✕</button>
                              </span>
                            ))}
                          </div>
                          <InlineAdd items={logtypes.filter(l => !metric.log_types.some(ml => ml.id === l.id))} onAdd={(id) => addLogtype(metric.id, id)} placeholder="기록유형 추가" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: 10, background: color, color: '#fff', padding: '1px 6px', borderRadius: 8 }}>{label}</span>;
}

function AddRow({ label, items, onAdd }: { label: string; items: MasterItem[]; onAdd: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} style={btnStyle('#1565c0')}>{label}</button>;
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
      <select onChange={e => { if (e.target.value) { onAdd(e.target.value); setOpen(false); } }} defaultValue="" style={selectStyle}>
        <option value="">선택...</option>
        {items.map(i => <option key={i.id} value={i.id}>{i.key}</option>)}
      </select>
      <button onClick={() => setOpen(false)} style={btnStyle('#555')}>취소</button>
    </div>
  );
}

function InlineAdd({ items, onAdd, placeholder }: { items: MasterItem[]; onAdd: (id: string) => void; placeholder: string }) {
  return (
    <select onChange={e => { if (e.target.value) { onAdd(e.target.value); e.target.value = ''; } }} defaultValue="" style={{ ...selectStyle, fontSize: 11, padding: '2px 6px' }}>
      <option value="">+ {placeholder}</option>
      {items.map(i => <option key={i.id} value={i.id}>{i.key}</option>)}
    </select>
  );
}

const btnStyle = (bg: string): React.CSSProperties => ({
  background: bg, border: 'none', color: '#fff', padding: '4px 10px',
  borderRadius: 4, cursor: 'pointer', fontSize: 12,
});

const selectStyle: React.CSSProperties = {
  background: '#1e1e2e', border: '1px solid #333', color: '#fff',
  padding: '4px 8px', borderRadius: 4, fontSize: 12,
};
