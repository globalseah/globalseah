/** 글로벌세아 사이트 공통 설정 */
window.SEAH_SITE = {
  name: "글로벌세아",
  nameEn: "GLOBAL SEAH",
  tagline: "신뢰로 완성하는 통합 시설·인력 관리 파트너",
  email: "seah0905@naver.com",
  phone: "070-8671-2108",
  fax: "070-8224-2108",
  address: "경기도 부천시 상동 547-1, (코오롱파크뷰 306호)",
  ceo: "임수현",
  bizRegNo: "866-88-03083",
  businessHours: "09:00 ~ 18:00",
  kakaoHours: "24시간 문의 가능",
  kakaoUrl: "", // 카카오톡 채널 URL 확정 후 입력

  /** false: PC 레이아웃 고정(클라이언트 미리보기) | true: 모바일 반응형 */
  responsive: false,
  desktopViewportWidth: 1280,

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
        { label: "미화관리", href: "business/cleaning.html" },
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
