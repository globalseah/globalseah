window.navermap_authFailure = function () {
  var mapEl = document.getElementById("location-map");
  if (mapEl) {
    mapEl.classList.add("location-map--error");
    mapEl.textContent = "지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }
  console.error("[SeahMap] 네이버 지도 인증 실패");
};

window.initSeahLocationMap = function () {
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
