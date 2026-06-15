(function () {
  const portfolio = window.SEAH_PORTFOLIO;
  const homeGrid = document.getElementById("home-portfolio-grid");

  if (portfolio && homeGrid) {
    homeGrid.innerHTML = portfolio.items
      .slice(0, 4)
      .map((item) => portfolio.cardHtml(item, "", "portfolio/index.html"))
      .join("");
  }

  const heroSlides = document.querySelectorAll(".home-hero-b-slide");
  if (heroSlides.length > 1) {
    let activeIndex = 0;

    window.setInterval(function () {
      heroSlides[activeIndex].classList.remove("is-active");
      activeIndex = (activeIndex + 1) % heroSlides.length;
      heroSlides[activeIndex].classList.add("is-active");
    }, 5000);
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
