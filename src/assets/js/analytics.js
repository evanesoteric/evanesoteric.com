// Dynamically load the Google Tag Manager script
(function() {
  var gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-KL87BD932P';
  document.head.appendChild(gtagScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { dataLayer.push(arguments); }
  gtag('js', new Date());

  gtag('config', 'G-KL87BD932P');
})();
