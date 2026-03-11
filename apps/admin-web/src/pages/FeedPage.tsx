import { useEffect, useState, useCallback } from 'react';
import { api, type FeedType, type FeedManufacturer, type FeedBrand, type FeedRegistrationRequest } from '../lib/api';
import { useI18n, useT } from '../lib/i18n';
import { itemLabel } from '../lib/catalogUtils';
import { CatalogCol, CatalogStatusBadge, CatalogModelDetail, CatalogListThumb, type ModelDetailField } from '../components/CatalogGrid';
import { CatalogStatsBar } from '../components/CatalogStatsBar';
import { CatalogEditModal } from '../components/CatalogEditModal';
import { NutritionPanel } from '../components/NutritionPanel';
import { useCatalogPage } from '../hooks/useCatalogPage';

const FEED_PLACEHOLDER = '/assets/images/placeholder_feed.svg';
const I18N = {
  type: 'admin.feed.type', manufacturer: 'admin.feed.manufacturer', brand: 'admin.feed.brand',
  types: 'admin.feed.types', manufacturers: 'admin.feed.manufacturers', brands: 'admin.feed.brands', models: 'admin.feed.models',
};

type FeedPageTab = 'catalog' | 'requests';

export default function FeedPage() {
  const h = useCatalogPage({ catalogApi: api.feedCatalog as Parameters<typeof useCatalogPage>[0]['catalogApi'], imageSubdir: 'feed' });
  const { t } = h;
  const { lang } = useI18n();

  const [pageTab, setPageTab] = useState<FeedPageTab>('catalog');

  // ── Request Management State ──
  const [requests, setRequests] = useState<FeedRegistrationRequest[]>([]);
  const [requestFilter, setRequestFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<FeedRegistrationRequest | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [requestProcessing, setRequestProcessing] = useState(false);

  type ReviewDecision = 'ok' | 'existing';
  const [reviewMfr, setReviewMfr] = useState<{ decision: ReviewDecision; existingId: string }>({ decision: 'ok', existingId: '' });
  const [reviewBrand, setReviewBrand] = useState<{ decision: ReviewDecision; existingId: string }>({ decision: 'ok', existingId: '' });
  const [reviewFeedType, setReviewFeedType] = useState('');
  const [reqMfrs, setReqMfrs] = useState<FeedManufacturer[]>([]);
  const [reqBrands, setReqBrands] = useState<FeedBrand[]>([]);
  const [reqFeedTypes, setReqFeedTypes] = useState<FeedType[]>([]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const loadRequests = useCallback(async (status?: string) => {
    try { setRequests(await api.feedRequests.admin.list(status ? { status } : undefined)); } catch (e) { h.setError(String(e)); }
  }, []);

  useEffect(() => {
    if (pageTab === 'requests') {
      void loadRequests(requestFilter || undefined);
      void (async () => {
        try { setReqMfrs(await api.feedCatalog.public.manufacturers()); } catch { /* ignore */ }
        try { setReqBrands(await api.feedCatalog.public.brands()); } catch { /* ignore */ }
        try { setReqFeedTypes(await api.feedCatalog.public.types(lang)); } catch { /* ignore */ }
      })();
    }
  }, [pageTab, requestFilter, loadRequests, lang]);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await api.feedRequests.admin.list({ status: 'pending' });
        setRequests(prev => prev.length ? prev : rows);
      } catch { /* ignore */ }
    })();
  }, []);

  function resetReviewState() {
    setReviewMfr({ decision: 'ok', existingId: '' });
    setReviewBrand({ decision: 'ok', existingId: '' });
    setReviewFeedType('');
    setShowRejectForm(false);
    setRejectNote('');
  }

  async function handleApprove(id: string) {
    if (!confirm(t('admin.feed.approve_confirm', 'Register this feed to the catalog?'))) return;
    setRequestProcessing(true);
    try {
      const overrides: { manufacturer_id?: string; brand_id?: string; feed_type_item_id?: string } = {};
      if (reviewMfr.decision === 'existing' && reviewMfr.existingId) overrides.manufacturer_id = reviewMfr.existingId;
      if (reviewBrand.decision === 'existing' && reviewBrand.existingId) overrides.brand_id = reviewBrand.existingId;
      if (reviewFeedType) overrides.feed_type_item_id = reviewFeedType;
      await api.feedRequests.admin.approve(id, Object.keys(overrides).length ? overrides : undefined);
      h.flash(t('admin.feed.approved_success', 'Approved and registered to catalog.'));
      void loadRequests(requestFilter || undefined);
      setSelectedRequest(null);
      resetReviewState();
    } catch (e) { h.setError(String(e)); } finally { setRequestProcessing(false); }
  }

  async function handleReject(id: string) {
    setRequestProcessing(true);
    try {
      await api.feedRequests.admin.reject(id, { review_note: rejectNote });
      h.flash(t('admin.feed.rejected_success', 'Request rejected.'));
      setRejectNote(''); setShowRejectForm(false);
      void loadRequests(requestFilter || undefined);
      setSelectedRequest(null);
    } catch (e) { h.setError(String(e)); } finally { setRequestProcessing(false); }
  }

  const filteredRequests = requestFilter ? requests.filter(r => r.status === requestFilter) : requests;
  const addLabel = t('admin.master.btn_add');
  function SBadge({ status }: { status: string }) { return <CatalogStatusBadge status={status} t={t} />; }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('admin.feed.title')}</div>
      </div>
      <div className="content">
        {h.error && <div className="alert alert-error">{h.error}</div>}
        {h.success && <div className="alert alert-success">{h.success}</div>}

        <CatalogStatsBar loading={h.statsLoading} cards={[
          { label: t('admin.catalog.stats.total_models', 'Total'), value: h.stats?.total_models ?? 0, desc: t('admin.catalog.stats.total_models_desc', 'Registered'), active: h.statsFilter === 'total', onClick: () => h.setStatsFilter(h.statsFilter === 'total' ? null : 'total') },
          { label: t('admin.catalog.stats.active', 'Active'), value: h.stats?.active_models ?? 0, desc: t('admin.catalog.stats.active_desc', 'Active'), active: h.statsFilter === 'active', onClick: () => h.setStatsFilter(h.statsFilter === 'active' ? null : 'active') },
          { label: t('admin.catalog.stats.user_registered', 'Registered'), value: h.stats?.user_registered ?? 0, desc: t('admin.catalog.stats.user_registered_feed_desc', 'Feed registered'), active: h.statsFilter === 'registered', onClick: () => h.setStatsFilter(h.statsFilter === 'registered' ? null : 'registered') },
          { label: t('admin.catalog.stats.actual_usage', 'Usage'), value: h.stats?.actual_usage ?? 0, desc: t('admin.catalog.stats.actual_usage_feed_desc', 'Last 30d'), active: h.statsFilter === 'usage', onClick: () => h.setStatsFilter(h.statsFilter === 'usage' ? null : 'usage') },
        ]} />

        {/* ── Tab Bar ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
          <button
            style={{ padding: '8px 16px', fontWeight: pageTab === 'catalog' ? 700 : 400, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: pageTab === 'catalog' ? 'var(--primary)' : 'transparent', cursor: 'pointer', fontSize: 14 }}
            onClick={() => setPageTab('catalog')}
          >
            {t('admin.feed.catalog_tab', 'Feed Catalog')}
          </button>
          <button
            style={{ padding: '8px 16px', fontWeight: pageTab === 'requests' ? 700 : 400, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: pageTab === 'requests' ? 'var(--primary)' : 'transparent', cursor: 'pointer', fontSize: 14, position: 'relative' }}
            onClick={() => setPageTab('requests')}
          >
            {t('admin.feed.requests_tab', 'Requests')}
            {pendingCount > 0 && (
              <span style={{ position: 'absolute', top: 2, right: -2, background: '#e53935', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{pendingCount}</span>
            )}
          </button>
        </div>

        {/* ── Requests Tab ── */}
        {pageTab === 'requests' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {['', 'pending', 'approved', 'rejected'].map(s => (
                <button key={s} className={`btn btn-sm ${requestFilter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRequestFilter(s)}>
                  {s === '' ? t('common.all', 'All') : s === 'pending' ? t('guardian.feed.request_status_pending', 'Pending') : s === 'approved' ? t('guardian.feed.request_status_approved', 'Approved') : t('guardian.feed.request_status_rejected', 'Rejected')}
                </button>
              ))}
            </div>
            {filteredRequests.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>{t('admin.feed.no_requests', 'No registration requests.')}</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: selectedRequest ? '1fr 1fr' : '1fr', gap: 16 }}>
              {filteredRequests.length > 0 && (
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 6px' }}>{t('admin.feed.requester', 'Requester')}</th>
                        <th style={{ padding: '8px 6px' }}>{t('guardian.feed.request_name', 'Feed Name')}</th>
                        <th style={{ padding: '8px 6px' }}>{t('guardian.feed.request_manufacturer', 'Manufacturer')}</th>
                        <th style={{ padding: '8px 6px' }}>{t('admin.feed.request_date', 'Request Date')}</th>
                        <th style={{ padding: '8px 6px' }}>{t('common.status', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map(r => (
                        <tr key={r.id} onClick={() => { setSelectedRequest(r); resetReviewState(); }} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selectedRequest?.id === r.id ? 'var(--primary-light, #fffbeb)' : 'transparent' }}>
                          <td style={{ padding: '8px 6px' }}>{r.requester_email || r.requester_user_id.slice(0, 8)}</td>
                          <td style={{ padding: '8px 6px', fontWeight: 600 }}>{r.feed_name}</td>
                          <td style={{ padding: '8px 6px' }}>{r.manufacturer_name || '\u2014'}</td>
                          <td style={{ padding: '8px 6px' }}>{r.created_at?.slice(0, 10)}</td>
                          <td style={{ padding: '8px 6px' }}>
                            <span style={{
                              fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                              background: r.status === 'approved' ? '#e8f5e9' : r.status === 'rejected' ? '#ffebee' : '#fff8e1',
                              color: r.status === 'approved' ? '#2e7d32' : r.status === 'rejected' ? '#c62828' : '#f57f17',
                            }}>
                              {r.status === 'approved' ? t('guardian.feed.request_status_approved', 'Approved') : r.status === 'rejected' ? t('guardian.feed.request_status_rejected', 'Rejected') : t('guardian.feed.request_status_pending', 'Pending')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedRequest && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 16 }}>{selectedRequest.feed_name}</h4>
                  <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><strong>{t('admin.feed.requester', 'Requester')}:</strong> {selectedRequest.requester_email || selectedRequest.requester_user_id.slice(0, 8)}</div>
                    <div><strong>{t('admin.feed.request_date', 'Date')}:</strong> {selectedRequest.created_at?.slice(0, 10)}</div>
                  </div>

                  {selectedRequest.status === 'pending' ? (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                      {/* Manufacturer review */}
                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('guardian.feed.request_manufacturer', 'Manufacturer')}</div>
                        <div style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>{selectedRequest.manufacturer_name || '\u2014'}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="radio" name="review-mfr" checked={reviewMfr.decision === 'ok'} onChange={() => setReviewMfr({ decision: 'ok', existingId: '' })} />
                            {t('admin.feed.review_ok', 'OK (create new)')}
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="radio" name="review-mfr" checked={reviewMfr.decision === 'existing'} onChange={() => setReviewMfr({ decision: 'existing', existingId: '' })} />
                            {t('admin.feed.review_use_existing', 'Use existing')}
                          </label>
                        </div>
                        {reviewMfr.decision === 'existing' && (
                          <select className="form-select" style={{ marginTop: 6, fontSize: 12 }} value={reviewMfr.existingId} onChange={e => setReviewMfr(p => ({ ...p, existingId: e.target.value }))}>
                            <option value="">{t('common.select', 'Select')}</option>
                            {reqMfrs.filter(m => m.status === 'active').map(m => <option key={m.id} value={m.id}>{itemLabel(m)}</option>)}
                          </select>
                        )}
                      </div>

                      {/* Brand review */}
                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('guardian.feed.request_brand', 'Brand')}</div>
                        <div style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>{selectedRequest.brand_name || '\u2014'}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="radio" name="review-brand" checked={reviewBrand.decision === 'ok'} onChange={() => setReviewBrand({ decision: 'ok', existingId: '' })} />
                            {t('admin.feed.review_ok', 'OK (create new)')}
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="radio" name="review-brand" checked={reviewBrand.decision === 'existing'} onChange={() => setReviewBrand({ decision: 'existing', existingId: '' })} />
                            {t('admin.feed.review_use_existing', 'Use existing')}
                          </label>
                        </div>
                        {reviewBrand.decision === 'existing' && (
                          <select className="form-select" style={{ marginTop: 6, fontSize: 12 }} value={reviewBrand.existingId} onChange={e => setReviewBrand(p => ({ ...p, existingId: e.target.value }))}>
                            <option value="">{t('common.select', 'Select')}</option>
                            {reqBrands.filter(b => b.status === 'active').map(b => <option key={b.id} value={b.id}>{b.name_ko || b.name_en || b.id}</option>)}
                          </select>
                        )}
                      </div>

                      {/* Feed Type review */}
                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('guardian.feed.request_type', 'Feed Type')}</div>
                        <div style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>
                          {selectedRequest.feed_type_item_id ? reqFeedTypes.find(ft => ft.id === selectedRequest.feed_type_item_id)?.display_label || selectedRequest.feed_type_item_id : '\u2014'}
                        </div>
                        <select className="form-select" style={{ fontSize: 12 }} value={reviewFeedType} onChange={e => setReviewFeedType(e.target.value)}>
                          <option value="">{t('admin.feed.review_keep_original', 'Keep original')}</option>
                          {reqFeedTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.display_label || ft.key}</option>)}
                        </select>
                      </div>

                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('guardian.feed.request_name', 'Feed Name')}</div>
                        <div>{selectedRequest.feed_name}</div>
                      </div>

                      {/* Nutrition info */}
                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{t('nutrition.title', 'Nutrition Info')}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {selectedRequest.calories_per_100g != null && <span>{t('nutrition.calories', 'Calories')}: {selectedRequest.calories_per_100g} kcal</span>}
                          {selectedRequest.protein_pct != null && <span>{t('nutrition.protein', 'Protein')}: {selectedRequest.protein_pct}%</span>}
                          {selectedRequest.fat_pct != null && <span>{t('nutrition.fat', 'Fat')}: {selectedRequest.fat_pct}%</span>}
                          {selectedRequest.fiber_pct != null && <span>{t('nutrition.fiber', 'Fiber')}: {selectedRequest.fiber_pct}%</span>}
                          {selectedRequest.moisture_pct != null && <span>{t('nutrition.moisture', 'Moisture')}: {selectedRequest.moisture_pct}%</span>}
                          {selectedRequest.ash_pct != null && <span>{t('nutrition.ash', 'Ash')}: {selectedRequest.ash_pct}%</span>}
                          {selectedRequest.calcium_pct != null && <span>{t('nutrition.calcium', 'Calcium')}: {selectedRequest.calcium_pct}%</span>}
                          {selectedRequest.phosphorus_pct != null && <span>{t('nutrition.phosphorus', 'Phosphorus')}: {selectedRequest.phosphorus_pct}%</span>}
                          {selectedRequest.omega3_pct != null && <span>{t('nutrition.omega3', 'Omega-3')}: {selectedRequest.omega3_pct}%</span>}
                          {selectedRequest.omega6_pct != null && <span>{t('nutrition.omega6', 'Omega-6')}: {selectedRequest.omega6_pct}%</span>}
                          {selectedRequest.carbohydrate_pct != null && <span>{t('nutrition.carbohydrate', 'Carbohydrate')}: {selectedRequest.carbohydrate_pct}%</span>}
                          {selectedRequest.serving_size_g != null && <span>{t('nutrition.serving_size', 'Serving Size')}: {selectedRequest.serving_size_g}g</span>}
                        </div>
                        {selectedRequest.ingredients_text && (
                          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                            <span style={{ fontWeight: 600 }}>{t('nutrition.ingredients', 'Ingredients')}: </span>{selectedRequest.ingredients_text}
                          </div>
                        )}
                      </div>

                      {selectedRequest.reference_url && (
                        <div style={{ fontSize: 13 }}>
                          <strong>{t('guardian.feed.request_url', 'URL')}:</strong>{' '}
                          <a href={selectedRequest.reference_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{selectedRequest.reference_url}</a>
                        </div>
                      )}
                      {selectedRequest.memo && (
                        <div style={{ fontSize: 13 }}><strong>{t('guardian.feed.request_memo', 'Memo')}:</strong> {selectedRequest.memo}</div>
                      )}

                      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-sm" disabled={requestProcessing} onClick={() => void handleApprove(selectedRequest.id)}>
                          {t('admin.feed.final_approve', 'Final Approve')}
                        </button>
                        {!showRejectForm ? (
                          <button className="btn btn-danger btn-sm" onClick={() => setShowRejectForm(true)}>{t('admin.feed.reject', 'Reject')}</button>
                        ) : (
                          <div style={{ flex: '1 1 100%' }}>
                            <textarea className="form-input" rows={2} placeholder={t('admin.feed.reject_reason', 'Rejection Reason')} value={rejectNote} onChange={e => setRejectNote(e.target.value)} style={{ marginBottom: 8, fontSize: 13 }} />
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-danger btn-sm" disabled={requestProcessing} onClick={() => void handleReject(selectedRequest.id)}>{t('admin.feed.reject', 'Reject')}</button>
                              <button className="btn btn-sm" onClick={() => { setShowRejectForm(false); setRejectNote(''); }}>{t('common.cancel', 'Cancel')}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {selectedRequest.manufacturer_name && <div><strong>{t('guardian.feed.request_manufacturer', 'Manufacturer')}:</strong> {selectedRequest.manufacturer_name}</div>}
                      {selectedRequest.brand_name && <div><strong>{t('guardian.feed.request_brand', 'Brand')}:</strong> {selectedRequest.brand_name}</div>}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {selectedRequest.calories_per_100g != null && <span>{t('nutrition.calories', 'Calories')}: {selectedRequest.calories_per_100g} kcal</span>}
                        {selectedRequest.protein_pct != null && <span>{t('nutrition.protein', 'Protein')}: {selectedRequest.protein_pct}%</span>}
                        {selectedRequest.fat_pct != null && <span>{t('nutrition.fat', 'Fat')}: {selectedRequest.fat_pct}%</span>}
                        {selectedRequest.fiber_pct != null && <span>{t('nutrition.fiber', 'Fiber')}: {selectedRequest.fiber_pct}%</span>}
                        {selectedRequest.moisture_pct != null && <span>{t('nutrition.moisture', 'Moisture')}: {selectedRequest.moisture_pct}%</span>}
                        {selectedRequest.ash_pct != null && <span>{t('nutrition.ash', 'Ash')}: {selectedRequest.ash_pct}%</span>}
                        {selectedRequest.calcium_pct != null && <span>{t('nutrition.calcium', 'Calcium')}: {selectedRequest.calcium_pct}%</span>}
                        {selectedRequest.phosphorus_pct != null && <span>{t('nutrition.phosphorus', 'Phosphorus')}: {selectedRequest.phosphorus_pct}%</span>}
                        {selectedRequest.omega3_pct != null && <span>{t('nutrition.omega3', 'Omega-3')}: {selectedRequest.omega3_pct}%</span>}
                        {selectedRequest.omega6_pct != null && <span>{t('nutrition.omega6', 'Omega-6')}: {selectedRequest.omega6_pct}%</span>}
                        {selectedRequest.carbohydrate_pct != null && <span>{t('nutrition.carbohydrate', 'Carbohydrate')}: {selectedRequest.carbohydrate_pct}%</span>}
                        {selectedRequest.serving_size_g != null && <span>{t('nutrition.serving_size', 'Serving Size')}: {selectedRequest.serving_size_g}g</span>}
                      </div>
                      {selectedRequest.ingredients_text && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          <span style={{ fontWeight: 600 }}>{t('nutrition.ingredients', 'Ingredients')}: </span>{selectedRequest.ingredients_text}
                        </div>
                      )}
                      {selectedRequest.reference_url && (
                        <div style={{ marginTop: 4 }}>
                          <strong>{t('guardian.feed.request_url', 'URL')}:</strong>{' '}
                          <a href={selectedRequest.reference_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{selectedRequest.reference_url}</a>
                        </div>
                      )}
                      {selectedRequest.memo && <div style={{ marginTop: 4 }}><strong>{t('guardian.feed.request_memo', 'Memo')}:</strong> {selectedRequest.memo}</div>}
                      {selectedRequest.review_note && (
                        <div style={{ marginTop: 4, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          <strong>{t('admin.feed.reject_reason', 'Rejection Reason')}:</strong> {selectedRequest.review_note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Catalog Tab ── */}
        {pageTab === 'catalog' && <>
          <div className="alert" style={{ marginBottom: 12 }}>{t('admin.feed.guide')}</div>

          <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
            <CatalogCol title={t(I18N.types)} sortMode={h.typeSort} onSortChange={h.setTypeSort}>
              {h.types.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
              {h.types.map(item => (
                <button key={item.id} className={`master-row-btn ${h.selectedType?.id === item.id ? 'active' : ''}`} onClick={() => h.setSelectedType(item)}>
                  <div>
                    <div className="master-row-title">{itemLabel(item)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.key}</div>
                  </div>
                  <SBadge status={item.status} />
                </button>
              ))}
            </CatalogCol>

            <CatalogCol title={t(I18N.manufacturers)} onAdd={h.openCreateMfr} addLabel={addLabel} sortMode={h.mfrSort} onSortChange={h.setMfrSort}>
              {h.manufacturers.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
              {h.manufacturers.map(item => (
                <button key={item.id} className={`master-row-btn ${h.selectedMfr?.id === item.id ? 'active' : ''}`} onClick={() => { h.setSelectedMfr(item); h.setSelectedBrand(null); h.setSelectedModel(null); }}>
                  <div>
                    <div className="master-row-title">{itemLabel(item)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.country ?? ''}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <SBadge status={item.status} />
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={e => { e.stopPropagation(); h.openEditMfr(item); }}>&#9998;</button>
                  </div>
                </button>
              ))}
            </CatalogCol>

            <CatalogCol title={t(I18N.brands)} onAdd={h.openCreateBrand} addLabel={addLabel} sortMode={h.brandSort} onSortChange={h.setBrandSort}>
              {!h.selectedMfr && <div className="master-empty">{t('admin.feed.select_manufacturer')}</div>}
              {h.selectedMfr && h.brands.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
              {h.selectedMfr && h.brands.map(item => (
                <button key={item.id} className={`master-row-btn ${h.selectedBrand?.id === item.id ? 'active' : ''}`} onClick={() => { h.setSelectedBrand(item); h.setSelectedModel(null); }}>
                  <div>
                    <div className="master-row-title">{itemLabel(item)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.name_ko}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <SBadge status={item.status} />
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={e => { e.stopPropagation(); h.openEditBrand(item); }}>&#9998;</button>
                  </div>
                </button>
              ))}
            </CatalogCol>

            <CatalogCol title={t(I18N.models)} onAdd={h.openCreateModel} addLabel={addLabel}>
              {!h.selectedType && <div className="master-empty">{t('admin.feed.select_type')}</div>}
              {h.selectedType && h.models.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
              {h.selectedType && h.models.map(item => (
                <button key={item.id} className={`master-row-btn ${h.selectedModel?.id === item.id ? 'active' : ''}`} onClick={() => h.setSelectedModel(item)}>
                  <CatalogListThumb src={item.image_url} fallbackSrc={FEED_PLACEHOLDER} alt={item.model_name} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="master-row-title">{item.model_display_label || item.model_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.model_code ?? ''} {item.mfr_display_label ?? item.mfr_name_en ?? ''}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <SBadge status={item.status} />
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={e => { e.stopPropagation(); h.openEditModel(item); }}>&#9998;</button>
                  </div>
                </button>
              ))}
            </CatalogCol>
          </div>

          {h.selectedModel && (
            <CatalogModelDetail
              title={h.selectedModel.model_display_label || h.selectedModel.model_name}
              onEdit={() => h.openEditModel(h.selectedModel!)}
              onDelete={() => void h.handleDelete('model', h.selectedModel!.id)}
              editLabel="&#9998;" deleteLabel="&#128465;"
              imageUrl={h.selectedModel.image_url}
              fallbackImageSrc={FEED_PLACEHOLDER}
              onImageUpload={file => void h.handleModelImageUpload(file)}
              onImageRemove={() => void h.handleModelImageRemove()}
              onImageUrlChange={url => void h.handleModelImageUrlChange(url)}
              t={t}
              fields={[
                { label: t('admin.feed.type'), value: h.selectedModel.type_display_label || h.selectedModel.type_name_en || h.selectedModel.type_name_ko || '\u2014' },
                { label: t('admin.feed.manufacturer'), value: h.selectedModel.mfr_display_label || h.selectedModel.mfr_name_en || h.selectedModel.mfr_name_ko || '\u2014' },
                { label: t('admin.feed.brand'), value: h.selectedModel.brand_display_label || h.selectedModel.brand_name_en || h.selectedModel.brand_name_ko || '\u2014' },
                ...(h.selectedModel.model_code ? [{ label: t('admin.feed.model_code'), value: h.selectedModel.model_code } satisfies ModelDetailField] : []),
                ...(h.selectedModel.description ? [{ label: t('admin.feed.description'), value: h.selectedModel.description } satisfies ModelDetailField] : []),
              ]}
            />
          )}

          {h.selectedModel && (
            <NutritionPanel
              nutritionForm={h.nutritionForm} setNutritionForm={h.setNutritionForm}
              nutritionSaving={h.nutritionSaving} onSave={() => void h.handleSaveNutrition()} t={t}
            />
          )}
        </>}
      </div>

      {h.modal && (
        <CatalogEditModal
          modal={h.modal} onClose={() => h.setModal(null)} onSave={() => void h.handleSave()} onDelete={h.handleDelete}
          saving={h.saving} translating={h.translating} error={h.error} t={t}
          i18n={{ type: t(I18N.type), manufacturer: t(I18N.manufacturer), brand: t(I18N.brand), manufacturers: t(I18N.manufacturers), brands: t(I18N.brands), models: t(I18N.models) }}
          types={h.types} manufacturers={h.manufacturers} brands={h.brands}
          mfrForm={h.mfrForm} setMfrForm={h.setMfrForm} mfrTrans={h.mfrTrans} setMfrTrans={h.setMfrTrans} mfrParentTypeIds={h.mfrParentTypeIds} setMfrParentTypeIds={h.setMfrParentTypeIds}
          brandForm={h.brandForm} setBrandForm={h.setBrandForm} brandTrans={h.brandTrans} setBrandTrans={h.setBrandTrans} brandParentTypeIds={h.brandParentTypeIds} setBrandParentTypeIds={h.setBrandParentTypeIds} brandParentMfrIds={h.brandParentMfrIds} setBrandParentMfrIds={h.setBrandParentMfrIds}
          modelForm={h.modelForm} setModelForm={h.setModelForm} modelTrans={h.modelTrans} setModelTrans={h.setModelTrans} modelParentTypeIds={h.modelParentTypeIds} setModelParentTypeIds={h.setModelParentTypeIds} modelParentMfrId={h.modelParentMfrId} setModelParentMfrId={h.setModelParentMfrId} modelParentBrandIds={h.modelParentBrandIds} setModelParentBrandIds={h.setModelParentBrandIds}
          selectedType={h.selectedType} loadBrands={h.loadBrands} setTranslating={h.setTranslating} setError={h.setError}
        />
      )}
    </>
  );
}
