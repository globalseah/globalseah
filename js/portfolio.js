(function () {
  const PER_PAGE = 6;

  /** 2차: Supabase 연동 시 API로 교체 — 예시 6건 */
  const PORTFOLIO_ITEMS = [
    {
      title: "잠실 롯데월드몰",
      usage: "판매시설",
      location: "서울시 송파구",
      image: "../assets/images/portfolio/01.jpg",
    },
    {
      title: "○○ 오피스타워",
      usage: "업무시설",
      location: "경기도 부천시",
      image: "../assets/images/portfolio/02.jpg",
    },
    {
      title: "○○ 아파트 단지",
      usage: "공동주택",
      location: "경기도 고양시",
      image: "../assets/images/portfolio/03.jpg",
    },
    {
      title: "○○ 물류센터",
      usage: "물류시설",
      location: "인천시 중구",
      image: "../assets/images/portfolio/04.jpg",
    },
    {
      title: "○○ 공공청사",
      usage: "공공시설",
      location: "서울시 영등포구",
      image: "../assets/images/portfolio/05.jpg",
    },
    {
      title: "○○ 복합문화시설",
      usage: "문화·집회시설",
      location: "서울시 마포구",
      image: "../assets/images/portfolio/06.jpg",
    },
  ];

  const gridEl = document.getElementById("portfolio-grid");
  const paginationEl = document.getElementById("portfolio-pagination");
  if (!gridEl || !paginationEl) return;

  function renderGrid() {
    gridEl.innerHTML = PORTFOLIO_ITEMS.map(
      (item) => `
        <article class="portfolio-item">
          <a href="#" class="portfolio-card" tabindex="0">
            <img src="${item.image}" alt="${item.title}" loading="lazy" width="800" height="600" />
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
        </article>`
    ).join("");
  }

  paginationEl.innerHTML = "";
  paginationEl.hidden = true;
  renderGrid();
})();
