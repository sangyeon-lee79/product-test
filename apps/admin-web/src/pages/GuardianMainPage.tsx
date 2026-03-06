export default function GuardianMainPage() {
  return (
    <div className="public-page" style={{ paddingTop: 24 }}>
      <section className="public-section">
        <h2>Guardian Main Page</h2>
        <p className="text-muted">로그인 역할이 guardian인 계정의 기본 진입 화면입니다.</p>
        <div className="feed-grid" style={{ marginTop: 12 }}>
          <article className="feed-card">
            <h3>My Pets</h3>
            <p>반려동물 등록/수정 및 질병 연결 관리</p>
          </article>
          <article className="feed-card">
            <h3>Health Timeline</h3>
            <p>질병 기록과 지표 로그 타임라인 조회</p>
          </article>
          <article className="feed-card">
            <h3>SNS Feed</h3>
            <p>완료 사진 공유 및 커뮤니티 피드 상호작용</p>
          </article>
        </div>
      </section>
    </div>
  );
}
