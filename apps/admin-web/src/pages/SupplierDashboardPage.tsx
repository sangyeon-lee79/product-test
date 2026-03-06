export default function SupplierDashboardPage() {
  return (
    <div className="guardian-page">
      <section className="guardian-top">
        <div className="guardian-hero card">
          <div className="card-body">
            <p className="hero-eyebrow">Petfolio | 펫폴리오</p>
            <h2>Petfolio</h2>
            <p className="text-muted">Your pet's life portfolio</p>
          </div>
        </div>
      </section>
      <section className="guardian-layout">
        <main className="guardian-main-feed">
          <div className="card">
            <div className="card-header"><div className="card-title">Supplier Dashboard</div></div>
            <div className="card-body">
              <p className="text-muted">로그인 역할이 supplier/provider인 계정의 기본 진입 화면입니다.</p>
            </div>
          </div>
        </main>
        <aside className="guardian-side">
          <div className="card"><div className="card-body"><h3>Store & Services</h3><p className="text-muted">매장/서비스 등록 및 운영 설정</p></div></div>
          <div className="card"><div className="card-body"><h3>Bookings</h3><p className="text-muted">요청 접수, 확정, 완료 처리</p></div></div>
          <div className="card"><div className="card-body"><h3>Completion Share</h3><p className="text-muted">완료 사진 업로드 후 보호자 피드 공유 유도</p></div></div>
        </aside>
      </section>
    </div>
  );
}
