import { Link } from 'react-router-dom';

const FEED = [
  {
    title: '오늘의 건강 기록',
    body: '방울이의 혈당 기록이 안정 구간으로 유지되고 있어요. 식이/운동 로그를 함께 확인해보세요.',
    tag: 'Health Feed',
  },
  {
    title: '미용 완료 사진 공유',
    body: '공급자가 등록한 완료 사진을 보호자가 1-click으로 피드에 공유할 수 있습니다.',
    tag: 'Viral Loop',
  },
  {
    title: '예약 상태 실시간 확인',
    body: '예약 요청부터 완료까지 진행 상태를 보호자와 공급자가 함께 확인합니다.',
    tag: 'Booking',
  },
];

export default function PublicHome() {
  return (
    <div className="public-page">
      <header className="public-hero">
        <div>
          <p className="hero-eyebrow">Pet Lifecycle SNS Platform</p>
          <h1>반려동물의 삶을 기록하고, 연결하고, 성장시키는 SNS</h1>
          <p className="hero-desc">
            서비스 소개, 피드형 콘텐츠, 역할별 진입점을 하나의 시작 화면에서 제공합니다.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/signup" className="btn btn-secondary">Signup</Link>
            <Link to="/admin/login" className="btn btn-secondary">Admin Login</Link>
          </div>
        </div>
      </header>

      <section className="public-section">
        <h2>Live Feed</h2>
        <div className="feed-grid">
          {FEED.map(item => (
            <article key={item.title} className="feed-card">
              <div className="badge badge-blue">{item.tag}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section">
        <h2>Entry Points</h2>
        <div className="entry-grid">
          <div className="entry-card">
            <h3>Guardian</h3>
            <p>프로필, 펫 등록, 질병 기록, 피드 참여</p>
            <Link to="/login" className="btn btn-primary btn-sm">Guardian 시작</Link>
          </div>
          <div className="entry-card">
            <h3>Supplier</h3>
            <p>매장/서비스 운영, 예약 처리, 완료 사진 공유</p>
            <Link to="/login" className="btn btn-primary btn-sm">Supplier 시작</Link>
          </div>
          <div className="entry-card">
            <h3>General User</h3>
            <p>서비스 둘러보기 후 Guardian로 가입 가능</p>
            <Link to="/signup" className="btn btn-secondary btn-sm">가입하기</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
