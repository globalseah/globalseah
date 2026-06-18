(function () {
  const site = window.SEAH_SITE;
  const mapEl = document.getElementById("location-map");

  if (!mapEl || !site?.naverMapKeyId) return;

  window.navermap_authFailure = function () {
    console.error("[SeahMap] 네이버 지도 인증 실패 — ncpKeyId:", site.naverMapKeyId);
    mapEl.classList.add("location-map--error");
    mapEl.textContent = "지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  };

  window.initSeahLocationMap = function () {
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

  var script = document.createElement("script");
  script.src =
    "https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=" +
    encodeURIComponent(site.naverMapKeyId) +
    "&callback=initSeahLocationMap";
  script.async = true;
  script.onerror = function () {
    console.error("[SeahMap] 지도 스크립트 로드 실패");
    mapEl.classList.add("location-map--error");
    mapEl.textContent = "지도를 불러오지 못했습니다.";
  };
  document.head.appendChild(script);
})();
