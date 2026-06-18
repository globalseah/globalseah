/** 실적 데이터 — 메인·실적현황 페이지 공통 (2차: Supabase 연동) */
(function () {
  const ITEMS = [
    {
      title: "금오전자",
      usage: "제조업",
      location: "경기도 부천시",
      image: "01.png",
    },
    {
      title: "동우실리콘",
      usage: "제조업",
      location: "경기도 광명시",
      image: "02.png",
    },
    {
      title: "로지션",
      usage: "제조업",
      location: "경기도 화성시",
      image: "03.png",
    },
    {
      title: "서광하이테크",
      usage: "제조업",
      location: "경기도 성남시",
      image: "04.png",
    },
    {
      title: "서진프로텍",
      usage: "제조업",
      location: "경기도 부천시",
      image: "05.png",
    },
    {
      title: "선경테크",
      usage: "제조업",
      location: "인천시 남동구",
      image: "06.png",
    },
    {
      title: "성진전자",
      usage: "제조업",
      location: "경기도 부천시",
      image: "07.png",
    },
    {
      title: "신우테크",
      usage: "제조업",
      location: "경기도 부천시",
      image: "08.png",
    },
    {
      title: "신화특수금속",
      usage: "제조업",
      location: "경기도 부천시",
      image: "09.png",
    },
    {
      title: "쟈마트",
      usage: "제조업",
      location: "인천시 서구",
      image: "10.png",
    },
    {
      title: "논현로얄팰리스",
      usage: "주상복합",
      location: "서울시 강남구",
      image: "11.png",
    },
    {
      title: "금천구청물놀이장",
      usage: "물놀이장",
      location: "서울시 금천구",
      image: "12.png",
    },
    {
      title: "역곡유림빌딩",
      usage: "상가빌딩",
      location: "경기도 부천시",
      image: "13.png",
    },
    {
      title: "메리골드호텔",
      usage: "호텔",
      location: "서울시 마포구",
      image: "14.png",
    },
    {
      title: "파맥스 빌딩",
      usage: "빌딩",
      location: "서울시 서초구",
      image: "15.png",
    },
    {
      title: "대진 빌딩",
      usage: "빌딩",
      location: "경기도 성남시",
      image: "16.png",
    },
    {
      title: "동대문아트프라자",
      usage: "쇼핑몰",
      location: "서울시 동대문구",
      image: "17.png",
    },
    {
      title: "연당빌딩",
      usage: "빌딩",
      location: "서울시 강남구",
      image: "18.png",
    },
    {
      title: "타워팰리스 3차",
      usage: "주상복합",
      location: "서울시 강남구",
      image: "19.png",
    },
    {
      title: "목동 하이페리오2차",
      usage: "주상복합",
      location: "서울시 양천구",
      image: "20.png",
    },
    {
      title: "타워팰리스 1차",
      usage: "주상복합",
      location: "서울시 강남구",
      image: "21.png",
    },
    {
      title: "더삽스타시티",
      usage: "주상복합",
      location: "서울시 광진구",
      image: "22.png",
    },
    {
      title: "동탄 메타폴리스",
      usage: "주상복합",
      location: "경기도 화성시",
      image: "23.png",
    },
    {
      title: "용상시티파트2단지",
      usage: "주상복합",
      location: "서울시 용산구",
      image: "24.png",
    },
    {
      title: "대치동부샌트레빌",
      usage: "아파트",
      location: "서울시 강남구",
      image: "25.png",
    },
    {
      title: "목동현대하이페리온1차",
      usage: "아파트",
      location: "서울시 양천구",
      image: "26.png",
    },
    {
      title: "대치포스코더샵",
      usage: "아파트",
      location: "서울시 강남구",
      image: "27.png",
    },
    {
      title: "대치아이파크",
      usage: "아파트",
      location: "서울시 강남구",
      image: "28.png",
    },
    {
      title: "광교호반베르디움",
      usage: "아파트",
      location: "경기도 수원시",
      image: "29.png",
    },
    {
      title: "백궁파라곤",
      usage: "아파트",
      location: "경기도 성남시",
      image: "30.png",
    },
    {
      title: "코업시티호텔",
      usage: "호텔",
      location: "서울시 구로구",
      image: "31.png",
    },
    {
      title: "더리버사이트호텔",
      usage: "호텔",
      location: "서울시 서초구",
      image: "32.png",
    },
    {
      title: "고양원흥도래울2단지",
      usage: "아파트",
      location: "경기도 고양시",
      image: "33.png",
    },
    {
      title: "미에로 빌딩",
      usage: "빌딩",
      location: "서울시 강남구",
      image: "34.png",
    },
    {
      title: "삼성동힐스테이트1단지",
      usage: "아파트",
      location: "서울시 강남구",
      image: "35.png",
    },
    {
      title: "수서까치마을아파트",
      usage: "아파트",
      location: "서울시 강남구",
      image: "36.png",
    },
    {
      title: "LG개포자이",
      usage: "아파트",
      location: "서울시 강남구",
      image: "37.png",
    },
    {
      title: "LG마포자이",
      usage: "아파트",
      location: "서울시 마포구",
      image: "38.png",
    },
    {
      title: "양주우미린",
      usage: "아파트",
      location: "경기도 양주시",
      image: "39.png",
    },
    {
      title: "한신한강아파트",
      usage: "아파트",
      location: "서울시 서초구",
      image: "40.png",
    },
    {
      title: "자양한양아파트",
      usage: "아파트",
      location: "서울시 광진구",
      image: "41.png",
    },
    {
      title: "서초현대아파트",
      usage: "아파트",
      location: "서울시 서초구",
      image: "42.png",
    },
    {
      title: "라마다앙코르호텔",
      usage: "호텔",
      location: "제주도 서귀포시",
      image: "43.png",
    },
    {
      title: "파크호텔",
      usage: "호텔",
      location: "서울시 영등포구",
      image: "45.png",
    },
    {
      title: "송도스카이파크",
      usage: "호텔",
      location: "인천시 연수구",
      image: "46.png",
    },
  ];

  function imageSrc(item, base) {
    return `${base}assets/images/portfolio/${item.image}`;
  }

  function cardHtml(item, base, href) {
    const src = imageSrc(item, base);
    return `
        <article class="portfolio-item">
          <a href="${href}" class="portfolio-card" tabindex="0">
            <img src="${src}" alt="${item.title}" loading="lazy" width="800" height="600" />
            <div class="portfolio-overlay">
              <h2 class="portfolio-card-title">${item.title}</h2>
              <dl class="portfolio-meta">
                <div class="portfolio-meta-row">
                  <dt>용도</dt>
                  <dd>${item.usage}</dd>
                </div>
                <div class="portfolio-meta-row">
                  <dt>위치</dt>
                  <dd>${item.location}</dd>
                </div>
              </dl>
            </div>
          </a>
        </article>`;
  }

  /** 화면 표시용 — 배열 끝(최신)이 맨 앞 */
  function displayItems() {
    return ITEMS.slice().reverse();
  }

  window.SEAH_PORTFOLIO = {
    items: ITEMS,
    displayItems,
    cardHtml,
  };
})();
