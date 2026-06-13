(function () {
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
