(function () {
  const portfolio = window.SEAH_PORTFOLIO;
  const homeGrid = document.getElementById("home-portfolio-grid");

  if (portfolio && homeGrid) {
    const HOME_LIMIT = 15;
    const recentItems = portfolio.displayItems().slice(0, HOME_LIMIT);
    const cards = recentItems
      .map((item) => portfolio.cardHtml(item, "", "portfolio/index.html"))
      .join("");
    // 무한 루프를 위해 동일한 세트를 한 번 복제한다 (translateX(-50%)로 이음매 없이 순환)
    homeGrid.innerHTML = cards + cards;
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

  const url = (window.SEAH_SITE && window.SEAH_SITE.kakaoUrl) || kakaoBtn.dataset.kakaoUrl || "";

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
