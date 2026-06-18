(function () {
  const site = window.SEAH_SITE;
  const mapEl = document.getElementById("location-map");

  if (!mapEl || !site?.naverMapKeyId) return;

  window.navermap_authFailure = function () {
    mapEl.classList.add("location-map--error");
    mapEl.textContent = "지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  };

  window.initSeahLocationMap = function () {
    const center = new naver.maps.LatLng(site.mapCenter.lat, site.mapCenter.lng);
    const map = new naver.maps.Map(mapEl, {
      center,
      zoom: site.mapZoom || 16,
    });

    new naver.maps.Marker({
      position: center,
      map,
      title: site.name,
    });
  };

  const script = document.createElement("script");
  script.src =
    "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=" +
    encodeURIComponent(site.naverMapKeyId) +
    "&callback=initSeahLocationMap";
  script.async = true;
  document.head.appendChild(script);
})();
