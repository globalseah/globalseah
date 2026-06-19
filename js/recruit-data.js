/** 채용현황 데이터 — 목록·상세·메인 공통 (2차: Supabase 연동) */
(function () {
  const ITEMS = [
    {
      id: 1,
      title: "[인선서구] 청라병원 미화원 채용건",
      date: "2026-06-18",
      status: "open",
      contact: { role: "담당부장", phone: "010-9364-8016" },
      body:
        "급여조건 : 210만원(세전)\n" +
        "근무시간 : 아침05:30 ~ 오후 13:30(8시간 상주 / 6.5시간 근무 / 1.5시간휴게)\n" +
        "근무조건 : 주6일근무(스케줄에 따른 근무 및 주말근무가능자)\n" +
        "기타조건 : 아침+점심제공(필요 시 저녁제공)\n" +
        "복리후생 : 병원 정직원과 동일한 혜택제공",
    },
    {
      id: 2,
      title: "[부천원미구] 춘의동 단순작업 채용건",
      date: "2026-06-16",
      status: "open",
      contact: { role: "담당주임", phone: "010-2490-3132" },
      body:
        "조립 /검수/ 좌식/ 각 테이블 근무\n" +
        "- 근무시간 9:00-18:00\n" +
        "잔업 가능자 평균 2.5시간\n" +
        "-시급:10,320",
    },
    {
      id: 3,
      title: "[군포부곡동] 제조사옥 미화원 채용건",
      date: "2026-06-15",
      status: "open",
      contact: { role: "담당팀장", phone: "010-8232-1163" },
      body:
        "상주미화\n" +
        "근무지 : 군포첨단산업단지\n" +
        "근무시간 : 09:00 ~ 18:00\n" +
        "급여 : 2,556,880\n" +
        "중식제공 주차가능 - 자동차등록증 제출필수",
    },
    {
      id: 4,
      title: "[인천부평] 청천공단내 단순작업 채용건",
      date: "2026-06-13",
      status: "open",
      contact: { role: "담당주임", phone: "010-2490-3132" },
      body:
        "입생로랑제품\n" +
        "- 근무시간 9:00-18:00 정시퇴근\n" +
        "- 입식근무\n" +
        "- 머리망/캡모자착용가능 작업복x\n" +
        "- 슬리퍼 착용\n" +
        "- 시급 : 10,500",
    },
    {
      id: 5,
      title: "[남양주수동면] 개인카페 미화원 채용건",
      date: "2026-06-12",
      status: "open",
      contact: { role: "담당부장", phone: "010-9364-8016" },
      body:
        "- 담당업무: 건물청소\n" +
        "근무기간: 1년이상\n" +
        "근무위치: 경기도 남양주시 남양주 수동면 입석리 433-3(레드브릭 카페)\n" +
        "급       여: 50만원(세전)\n" +
        "근무요일: 주3일(월, 수, 토)\n" +
        "근무시간: 06:00~09:00\n" +
        "복리후생: 고용보험, 산재보험, 주차 가능",
    },
    {
      id: 6,
      title: "[천안동남구] 물류센터내 미화원 채용건",
      date: "2026-06-10",
      status: "open",
      contact: { role: "담당팀장", phone: "010-8232-1163" },
      body:
        "근무지 : 대흥리\n" +
        "담당업무 : 물류센터내 미화작업\n" +
        "근무시간 : 06:00 ~ 10:00\n" +
        "주5일근무\n" +
        "시급13,000원",
    },
    {
      id: 7,
      title: "[부천내동] 내동사거리 단순작업 채용건",
      date: "2026-06-09",
      status: "open",
      contact: { role: "담당주임", phone: "010-2490-3132" },
      body:
        "근무지 내동사거리인근\n\n" +
        "용기 라벨부착업무\n\n" +
        "자율복장 좌식근무\n\n" +
        "근무시간 09:00 ~ 18:00\n" +
        "잔업없음",
    },
    {
      id: 8,
      title: "[김포] 학운5산업단지 단순작업 채용건",
      date: "2026-06-07",
      status: "open",
      contact: { role: "담당팀장", phone: "010-8232-1163" },
      body:
        "근무지 학운 5산단 2공장\n" +
        "현대,기아 차량배터리 단순작업\n" +
        "근무시간 : 08:30 ~ 17:30\n" +
        "잔업 1시간연장 19:00\n" +
        "오후는 간식제공\n" +
        "시급 11,000원\n\n" +
        "6개월이상 근무시 시급 11500원 으로 인상\n" +
        "1년이상 근무시 시급 12000원 으로 인상",
    },
    {
      id: 9,
      title: "[인천검단] 검단블루텍 단순작업 채용건",
      date: "2026-06-06",
      status: "open",
      contact: { role: "담당팀장", phone: "010-8232-1163" },
      body:
        "검단지구 블루텍 본사\n" +
        "현대,기아 차량배터리 단순작업\n" +
        "근무시간 : 08:30 ~ 17:30\n" +
        "잔업 1시간연장 19:00\n" +
        "오후는 간식제공\n" +
        "시급 11,000원\n\n" +
        "6개월이상 근무시 시급 11500원 으로 인상\n" +
        "1년이상 근무시 시급 12000원 으로 인상",
    },
    {
      id: 10,
      title: "[부천도당동] 대우테크노파크 단순작업 채용건",
      date: "2026-06-04",
      status: "open",
      contact: { role: "담당주임", phone: "010-2490-3132" },
      body:
        "도당동 대우테크노파크\n" +
        "화장품용기 조립\n\n" +
        "근무시간 09:00 ~ 17:40 (점심시간 40분)\n" +
        "잔특없음 / 좌식근무",
    },
    {
      id: 11,
      title: "[부천오정구] 오정산업단지 제조사옥 미화원 채용건",
      date: "2026-06-03",
      status: "open",
      contact: { role: "담당팀장", phone: "010-8232-1163" },
      body:
        "오정산업단지 119센터인근\n" +
        "제조사옥 미화원\n" +
        "근무시간 08:30 ~ 17:30\n" +
        "급여 250만원\n" +
        "점심제공",
    },
    {
      id: 12,
      title: "[용인처인구] 한화리조트인근 단순작업 채용건",
      date: "2026-06-01",
      status: "open",
      contact: { role: "담당대리", phone: "010-4867-3343" },
      body:
        "- 제품 검수 포장/페달 장착/\n" +
        "- 근무시간 9:00~18:00\n" +
        "- 자율복장/ 중식제공\n" +
        "- 일급: 12만원",
    },
    {
      id: 13,
      title: "[이천마장면] 프리미엄아울렛인근 단순작업 채용건",
      date: "2026-05-31",
      status: "open",
      contact: { role: "담당대리", phone: "010-4867-3343" },
      body:
        "모집2 야간조 18:00- 03:00≪잔업시 잔업수당 별도\n" +
        "시간: 18:00 ~ 03:00\n" +
        "급여: 120,000원",
    },
    {
      id: 14,
      title: "[화성동탄] GS25 물류센터 단순작업 채용건",
      date: "2026-05-29",
      status: "open",
      contact: { role: "담당대리", phone: "010-4867-3343" },
      body:
        "- 제품 검수 포장 피킹 근무환경 좋음\n" +
        "- 근무시간 10:00-19:00\n" +
        "- 자율복장\n" +
        "- 중식제공\n" +
        "- 일급:100,000",
    },
    {
      id: 15,
      title: "[김포통진읍] 율마로부근 미화원 채용건",
      date: "2026-05-28",
      status: "closed",
      contact: { role: "담당팀장", phone: "010-8232-1163" },
      body: "마감",
    },
    {
      id: 16,
      title: "[인천계양구] 서운산업단지 제조사옥 미화원 채용건",
      date: "2026-05-26",
      status: "open",
      contact: { role: "담당팀장", phone: "010-8232-1163" },
      body:
        "서운 산업단지내\n" +
        "제조사옥 상주 미화원\n" +
        "근무시간 08:00 ~ 17:00\n" +
        "급여 255만원",
    },
  ];

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

  function listTitle(item) {
    if (item.status === "closed") {
      return item.title + " [마감]";
    }
    return item.title;
  }

  window.SEAH_RECRUIT = {
    items: ITEMS,
    displayItems: displayItems,
    getById: getById,
    getAdjacent: getAdjacent,
    listTitle: listTitle,
  };
})();
