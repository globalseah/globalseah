window.navermap_authFailure = function () {
  var mapEl = document.getElementById("location-map");
  if (mapEl) {
    mapEl.classList.add("location-map--error");
    mapEl.innerHTML =
      '지도를 불러오지 못했습니다.<br><a href="https://map.naver.com/p/search/%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EB%B6%80%EC%B2%9C%EC%8B%9C%20%EC%83%81%EB%8F%99%20547-1" target="_blank" rel="noopener" style="color:#145a2e;text-decoration:underline;">네이버 지도에서 보기</a>';
  }
  console.error("[SeahMap] 네이버 지도 인증 실패 — ncpKeyId 또는 도메인 불일치");
  console.error("[SeahMap] 현재 도메인:", location.hostname);
  console.error("[SeahMap] Referer:", document.referrer);
};

window.initSeahLocationMap = function () {
  if (typeof naver === "undefined" || !naver.maps) {
    console.error("[SeahMap] naver 객체 미생성 — 인증 실패 가능성");
    window.navermap_authFailure();
    return;
  }

  var site = window.SEAH_SITE;
  var mapEl = document.getElementById("location-map");
  if (!mapEl || !site) return;

  var center = new naver.maps.LatLng(site.mapCenter.lat, site.mapCenter.lng);
  var map = new naver.maps.Map(mapEl, {
    center: center,
    zoom: site.mapZoom || 16,
  });

  new naver.maps.Marker({
    position: center,
    map: map,
    title: site.name,
  });
};
