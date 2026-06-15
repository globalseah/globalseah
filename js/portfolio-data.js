/** 실적 데이터 — 메인·실적현황 페이지 공통 (2차: Supabase 연동) */
(function () {
  const ITEMS = [
    {
      title: "잠실 롯데월드몰",
      usage: "판매시설",
      location: "서울시 송파구",
      image: "01.jpg",
    },
    {
      title: "○○ 오피스타워",
      usage: "업무시설",
      location: "경기도 부천시",
      image: "02.jpg",
    },
    {
      title: "○○ 아파트 단지",
      usage: "공동주택",
      location: "경기도 고양시",
      image: "03.jpg",
    },
    {
      title: "○○ 물류센터",
      usage: "물류시설",
      location: "인천시 중구",
      image: "04.jpg",
    },
    {
      title: "○○ 공공청사",
      usage: "공공시설",
      location: "서울시 영등포구",
      image: "05.jpg",
    },
    {
      title: "○○ 복합문화시설",
      usage: "문화·집회시설",
      location: "서울시 마포구",
      image: "06.jpg",
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

  window.SEAH_PORTFOLIO = {
    items: ITEMS,
    cardHtml,
  };
})();
