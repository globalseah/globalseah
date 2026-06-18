/** 공지사항 데이터 — 목록·상세·메인 공통 (2차: Supabase 연동) */
(function () {
  const ITEMS = [
    {
      id: 1,
      title: "[인사공지] 2026년 최저임금 안내 (시간당 10,320원)",
      date: "2025-12-22",
      images: ["01.jpg"],
    },
    {
      id: 2,
      title: "[안전공지] 폭염 대비 6대 행동요령 안내",
      date: "2026-04-19",
      images: ["02.jpg"],
    },
    {
      id: 3,
      title: "[안전공지] 사업장 비상상황 발생 시 대응 요령 안내",
      date: "2026-02-24",
      images: ["03.jpg"],
    },
    {
      id: 4,
      title: "[안전공지] 제조업 끼임사고 예방 핵심 안전 가이드",
      date: "2026-03-19",
      images: ["04.jpg", "05.jpg", "06.jpg", "07.jpg"],
    },
    {
      id: 5,
      title: "[안전공지] 이동식 사다리 안전작업지침 준수 요청",
      date: "2026-05-28",
      images: ["08.png"],
    },
    {
      id: 6,
      title: "[안전공지] 화재 발생 시 행동요령 안내",
      date: "2025-11-08",
      images: ["09.png"],
    },
  ];

  function imageSrc(filename, base) {
    return base + "assets/images/notice/" + filename;
  }

  /** 화면 표시용 — 최신 등록일이 맨 앞 */
  function displayItems() {
    return ITEMS.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
  }

  function getById(id) {
    return ITEMS.find(function (item) {
      return item.id === id;
    });
  }

  /** 이전글(과거) · 다음글(최신) — 목록 최신순 기준 */
  function getAdjacent(id) {
    const sorted = displayItems();
    const index = sorted.findIndex(function (item) {
      return item.id === id;
    });
    if (index === -1) return { newer: null, older: null };
    return {
      newer: index > 0 ? sorted[index - 1] : null,
      older: index < sorted.length - 1 ? sorted[index + 1] : null,
    };
  }

  window.SEAH_NOTICE = {
    items: ITEMS,
    displayItems: displayItems,
    getById: getById,
    getAdjacent: getAdjacent,
    imageSrc: imageSrc,
  };
})();
