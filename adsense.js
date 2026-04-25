(function () {
  const config = window.__PBR_SITE_CONFIG__ || {};
  const publisherId = String(config.adsensePublisherId || "").trim();

  if (!/^ca-pub-\d+$/.test(publisherId)) {
    return;
  }

  if (document.querySelector('script[data-adsense-loader="true"]')) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  script.crossOrigin = "anonymous";
  script.dataset.adsenseLoader = "true";
  document.head.appendChild(script);
})();
