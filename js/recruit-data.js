/** 채용현황 데이터 — 메인·채용 목록 공통 (2차: Supabase 연동) */
(function () {
  const ITEMS = [
    {
      id: 1,
      title: "[채용] 시설관리 기사 모집",
      date: "2026-06-10",
      href: "recruit.html",
    },
    {
      id: 2,
      title: "[채용] 미화·위생 관리원 모집",
      date: "2026-05-15",
      href: "recruit.html",
    },
    {
      id: 3,
      title: "[채용] 보안·주차 관리원 모집",
      date: "2026-04-22",
      href: "recruit.html",
    },
  ];

  function displayItems() {
    return ITEMS.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
  }

  window.SEAH_RECRUIT = {
    items: ITEMS,
    displayItems: displayItems,
  };
})();
