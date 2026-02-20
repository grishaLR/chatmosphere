(function () {
  var t = localStorage.getItem('protoimsg:theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
})();
