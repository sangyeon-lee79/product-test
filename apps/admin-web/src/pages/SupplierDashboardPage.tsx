export default function SupplierDashboardPage() {
  return (
    <div className="public-page" style={{ paddingTop: 24 }}>
      <section className="public-section">
        <h2>Supplier Dashboard</h2>
        <p className="text-muted">로그인 역할이 supplier/provider인 계정의 기본 진입 화면입니다.</p>
        <div className="feed-grid" style={{ marginTop: 12 }}>
          <article className="feed-card">
            <h3>Store & Services</h3>
            <p>매장/서비스 등록 및 운영 설정</p>
          </article>
          <article className="feed-card">
            <h3>Bookings</h3>
            <p>요청 접수, 확정, 완료 처리</p>
          </article>
          <article className="feed-card">
            <h3>Completion Share</h3>
            <p>완료 사진 업로드 후 보호자 피드 공유 유도</p>
          </article>
        </div>
      </section>
    </div>
  );
}
