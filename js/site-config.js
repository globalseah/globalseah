/** 글로벌세아 사이트 공통 설정 */
window.SEAH_SITE = {
  name: "글로벌세아",
  nameEn: "GLOBAL SEAH",
  tagline: "신뢰로 완성하는 통합 시설·인력 관리 파트너",
  email: "seah0905@naver.com",
  phone: "070-8671-2108",
  fax: "070-8224-2108",
  address: "경기도 부천시 상동 547-1, (코오롱파크뷰 306호)",
  /** 네이버 지도 API (Web Dynamic Map) — NCP Client ID = ncpKeyId */
  naverMapKeyId: "fhhsg8469q",
  mapCenter: { lat: 37.504385, lng: 126.74887 },
  mapZoom: 16,
  ceo: "임수현",
  bizRegNo: "866-88-03083",
  businessHours: "09:00 ~ 18:00",
  kakaoHours: "24시간 문의 가능",
  kakaoUrl: "", // 카카오톡 채널 URL 확정 후 입력

  /** false: 항상 PC 1280 고정 | true: 디바이스 분기
   *  - 터치 + 너비 < mobileBreakpoint → 모바일(햄버거 GNB)
   *  - 그 외(마우스 PC·iPad 가로 등) → PC 1280 고정
   *  모바일 작업·검수 시 로컬 true, 배포 전 false 로 되돌림 */
  responsive: false,
  desktopViewportWidth: 1280,
  /** 모바일 레이아웃 전환 기준(px). iPad 가로(1024~)는 PC로 처리 */
  mobileBreakpoint: 1024,

  nav: [
    {
      label: "회사소개",
      href: "company/greeting.html",
      children: [
        { label: "인사말", href: "company/greeting.html" },
        { label: "경영방침", href: "company/philosophy.html" },
        { label: "조직도", href: "company/organization.html" },
        { label: "인증현황", href: "company/certification.html" },
        { label: "찾아오시는길", href: "company/location.html" },
      ],
    },
    {
      label: "사업부문",
      href: "business/facility.html",
      children: [
        { label: "시설관리", href: "business/facility.html" },
        { label: "미화·방역 관리", href: "business/cleaning.html" },
        { label: "보안·주차관리", href: "business/security.html" },
        { label: "호텔관리", href: "business/hotel.html" },
        { label: "인재파견", href: "business/staffing.html" },
      ],
    },
    {
      label: "실적현황",
      href: "portfolio/index.html",
    },
    {
      label: "공지 및 채용현황",
      href: "notice/index.html",
      children: [
        { label: "공지사항", href: "notice/index.html" },
        { label: "채용현황", href: "notice/recruit.html" },
      ],
    },
    {
      label: "견적 및 상담문의",
      href: "contact/index.html",
    },
  ],
};
