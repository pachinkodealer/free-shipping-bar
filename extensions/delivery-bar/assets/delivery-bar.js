(function () {
  'use strict';

  var root = document.getElementById('fsb-root');
  if (!root) return;

  var threshold = parseInt(root.dataset.threshold, 10); // cents
  var msgBelow  = root.dataset.msgBelow;
  var msgAbove  = root.dataset.msgAbove;
  var position  = root.dataset.position;

  var msgEl   = document.getElementById('fsb-msg');
  var truckEl = document.getElementById('fsb-truck');
  var roadEl  = document.getElementById('fsb-road');

  // Position the bar before showing it
  placeBar(position);
  root.style.display = 'block';

  // Initial render
  fetchCart().then(render);

  // Event-based updates (Dawn and other themes that emit these)
  document.addEventListener('cart:refresh', function () { fetchCart().then(render); });
  document.addEventListener('cart:updated', function () { fetchCart().then(render); });

  // Polling fallback for themes that don't emit cart events
  var lastTotal = null;
  setInterval(function () {
    fetchCart().then(function (cart) {
      if (!cart) return;
      if (cart.total_price !== lastTotal) {
        lastTotal = cart.total_price;
        render(cart);
      }
    });
  }, 2000);

  function fetchCart() {
    return fetch('/cart.js', { headers: { 'Content-Type': 'application/json' } })
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }

  function render(cart) {
    if (!cart) return;
    var total     = cart.total_price; // cents
    var remaining = threshold - total;
    var pct       = Math.min(100, Math.round((total / threshold) * 100));

    // Update road fill via CSS custom property
    root.style.setProperty('--fsb-pct', pct + '%');

    // Move truck: stops at ~85% so it doesn't overlap the house
    var truckPct = pct * 0.85;
    truckEl.style.left = truckPct + '%';

    // ARIA
    roadEl.setAttribute('aria-valuenow', pct);

    if (remaining <= 0) {
      msgEl.textContent = msgAbove;
      root.classList.add('fsb--done');
      root.classList.remove('fsb--progress');
      truckEl.style.left = '85%'; // parked at door
    } else {
      var fmt = formatMoney(remaining);
      msgEl.textContent = msgBelow.replace('{amount}', fmt);
      root.classList.add('fsb--progress');
      root.classList.remove('fsb--done');
    }
  }

  function formatMoney(cents) {
    var amount = (cents / 100).toFixed(2);
    if (window.Shopify && window.Shopify.money_format) {
      return window.Shopify.money_format
        .replace('{{amount}}', amount)
        .replace('{{ amount }}', amount)
        .replace('{{amount_no_decimals}}', Math.round(cents / 100))
        .replace('{{ amount_no_decimals }}', Math.round(cents / 100));
    }
    return '$' + amount;
  }

  function placeBar(pos) {
    if (pos === 'bottom') {
      document.body.appendChild(root);
    } else {
      document.body.insertBefore(root, document.body.firstChild);
    }
  }
})();
