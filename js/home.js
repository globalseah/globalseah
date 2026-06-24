(function () {
  const client = window.SEAH_POSTS_CLIENT;
  if (!client) return;

  const HOME_INFO_LIMIT = 5;
  const HOME_PORTFOLIO_LIMIT = 15;

  Promise.all([
    client.loadPortfolio(),
    client.loadNotice(),
    client.loadRecruit(),
  ])
    .then(function (results) {
      const portfolio = results[0];
      const notice = results[1];
      const recruit = results[2];
      renderPortfolio(portfolio);
      renderNotice(notice);
      renderRecruit(recruit);
    })
    .catch(function () {
      /* 개별 섹션은 비워 둠 */
    });

  function renderPortfolio(portfolio) {
    const homeGrid = document.getElementById("home-portfolio-grid");
    if (!portfolio || !homeGrid) return;

    const recentItems = portfolio.displayItems().slice(0, HOME_PORTFOLIO_LIMIT);
    const cards = recentItems
      .map(function (item) {
        return portfolio.cardHtml(item, "", "portfolio/index.html");
      })
      .join("");
    homeGrid.innerHTML = cards + cards;
  }

  function renderNotice(notice) {
    const homeNoticeList = document.getElementById("home-notice-list");
    if (!notice || !homeNoticeList) return;

    homeNoticeList.innerHTML = notice
      .displayItems()
      .slice(0, HOME_INFO_LIMIT)
      .map(function (item) {
        return (
          '<li><a href="notice/view.html?id=' +
          encodeURIComponent(item.id) +
          '">' +
          item.title +
          "</a></li>"
        );
      })
      .join("");
  }

  function renderRecruit(recruit) {
    const homeRecruitList = document.getElementById("home-recruit-list");
    if (!recruit || !homeRecruitList) return;

    homeRecruitList.innerHTML = recruit
      .displayItems()
      .slice(0, HOME_INFO_LIMIT)
      .map(function (item) {
        return (
          '<li><a href="notice/recruit/view.html?id=' +
          encodeURIComponent(item.id) +
          '">' +
          recruit.listTitle(item) +
          "</a></li>"
        );
      })
      .join("");
  }

  const heroSlides = document.querySelectorAll(".home-hero-b-slide");
  if (heroSlides.length > 1) {
    let activeIndex = 0;

    window.setInterval(function () {
      heroSlides[activeIndex].classList.remove("is-active");
      activeIndex = (activeIndex + 1) % heroSlides.length;
      heroSlides[activeIndex].classList.add("is-active");
    }, 7000);
  }

  const kakaoBtn = document.getElementById("kakao-inquiry");
  if (!kakaoBtn) return;

  const url =
    (window.SEAH_SITE && window.SEAH_SITE.kakaoUrl) || kakaoBtn.dataset.kakaoUrl || "";

  if (url) {
    kakaoBtn.href = url;
    kakaoBtn.removeAttribute("aria-disabled");
    kakaoBtn.removeAttribute("title");
    kakaoBtn.classList.remove("is-pending");
    kakaoBtn.target = "_blank";
    kakaoBtn.rel = "noopener noreferrer";
  } else {
    kakaoBtn.addEventListener("click", function (e) {
      e.preventDefault();
    });
  }
})();
