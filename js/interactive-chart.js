/* Reusable dual-axis scrubbable line chart. No dependencies. */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var VB_W = 1000;
  var VB_H = 380;
  var MARGIN = { top: 24, right: 54, bottom: 34, left: 60 };

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    if (attrs) {
      for (var k in attrs) { node.setAttribute(k, attrs[k]); }
    }
    return node;
  }

  function niceMax(rawMax, steps) {
    if (rawMax <= 0) { return { max: 1, step: 1 / steps }; }
    var rough = rawMax / steps;
    var pow10 = Math.pow(10, Math.floor(Math.log10(rough)));
    var candidates = [1, 2, 2.5, 5, 10];
    var step = pow10 * 10;
    for (var i = 0; i < candidates.length; i++) {
      if (rough <= candidates[i] * pow10) { step = candidates[i] * pow10; break; }
    }
    var max = step * steps;
    while (max < rawMax) { max += step; }
    return { max: max, step: step };
  }

  function catmullRomToBezier(points) {
    if (points.length < 3) {
      return points.length === 2
        ? 'M ' + points[0][0] + ' ' + points[0][1] + ' L ' + points[1][0] + ' ' + points[1][1]
        : '';
    }
    var d = 'M ' + points[0][0] + ' ' + points[0][1] + ' ';
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i === 0 ? 0 : i - 1];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2 < points.length ? i + 2 : i + 1];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6;
      var c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6;
      var c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C ' + c1x + ' ' + c1y + ', ' + c2x + ' ' + c2y + ', ' + p2[0] + ' ' + p2[1] + ' ';
    }
    return d;
  }

  function formatMonthYear(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function renderLineChart(container, cfg) {
    var data = cfg.data;
    var series = cfg.series;
    var n = data.length;

    container.innerHTML = '';
    container.classList.add('dt-ichart');

    var svg = el('svg', {
      viewBox: '0 0 ' + VB_W + ' ' + VB_H,
      class: 'dt-ichart-svg',
      role: 'img',
      'aria-label': cfg.ariaLabel || 'Interactive chart'
    });

    var plotW = VB_W - MARGIN.left - MARGIN.right;
    var plotH = VB_H - MARGIN.top - MARGIN.bottom;

    var leftSeries = series.filter(function (s) { return s.axis === 'left'; })[0];
    var rightSeries = series.filter(function (s) { return s.axis === 'right'; })[0];

    var leftRawMax = Math.max.apply(null, data.map(function (d) { return d[leftSeries.key]; }));
    var rightRawMax = rightSeries ? Math.max.apply(null, data.map(function (d) { return d[rightSeries.key]; })) : 0;
    var leftNice = niceMax(leftRawMax, 4);
    var rightNice = rightSeries ? niceMax(rightRawMax, 4) : null;

    function xAt(i) { return MARGIN.left + (i / (n - 1)) * plotW; }
    function yLeft(v) { return MARGIN.top + plotH - (v / leftNice.max) * plotH; }
    function yRight(v) { return MARGIN.top + plotH - (v / rightNice.max) * plotH; }

    // Grid lines + left/right axis labels
    var gridGroup = el('g', { class: 'dt-ichart-grid' });
    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var val = (leftNice.max / ticks) * t;
      var y = yLeft(val);
      gridGroup.appendChild(el('line', { x1: MARGIN.left, x2: VB_W - MARGIN.right, y1: y, y2: y, class: 'dt-ichart-gridline' }));
      var leftLabel = el('text', { x: MARGIN.left - 10, y: y + 4, class: 'dt-ichart-axislabel', 'text-anchor': 'end' });
      leftLabel.textContent = leftSeries.formatAxis(val);
      gridGroup.appendChild(leftLabel);
      if (rightSeries) {
        var rVal = (rightNice.max / ticks) * t;
        var rLabel = el('text', { x: VB_W - MARGIN.right + 10, y: y + 4, class: 'dt-ichart-axislabel dt-ichart-axislabel--right', 'text-anchor': 'start' });
        rLabel.textContent = rightSeries.formatAxis(rVal);
        gridGroup.appendChild(rLabel);
      }
    }
    svg.appendChild(gridGroup);

    // X-axis tick labels (sparse)
    var xTickGroup = el('g', { class: 'dt-ichart-xticks' });
    var everyN = cfg.xTickEvery || 12;
    for (var i = 0; i < n; i += everyN) {
      var lbl = el('text', { x: xAt(i), y: VB_H - 10, class: 'dt-ichart-xlabel', 'text-anchor': 'middle' });
      lbl.textContent = cfg.xLabel(data[i].date);
      xTickGroup.appendChild(lbl);
    }
    svg.appendChild(xTickGroup);

    // Lines
    var seriesGroup = el('g', { class: 'dt-ichart-series' });
    var linePaths = {};
    series.forEach(function (s) {
      var yFn = s.axis === 'left' ? yLeft : yRight;
      var pts = data.map(function (d, i) { return [xAt(i), yFn(d[s.key])]; });
      var path = el('path', {
        d: catmullRomToBezier(pts),
        class: 'dt-ichart-line',
        stroke: s.color,
        fill: 'none'
      });
      seriesGroup.appendChild(path);
      linePaths[s.key] = path;
    });
    svg.appendChild(seriesGroup);

    // Hover guide
    var guideLine = el('line', { class: 'dt-ichart-guide', y1: MARGIN.top, y2: VB_H - MARGIN.bottom, x1: 0, x2: 0 });
    svg.appendChild(guideLine);

    var dots = {};
    series.forEach(function (s) {
      var dot = el('circle', { class: 'dt-ichart-dot', r: 4.5, fill: s.color, cx: 0, cy: 0 });
      svg.appendChild(dot);
      dots[s.key] = dot;
    });

    var activePill = el('g', { class: 'dt-ichart-pill' });
    var pillRect = el('rect', { rx: 10, ry: 10, height: 22 });
    var pillText = el('text', { class: 'dt-ichart-pilltext', 'text-anchor': 'middle', y: VB_H - 10 + 5 });
    activePill.appendChild(pillRect);
    activePill.appendChild(pillText);
    svg.appendChild(activePill);

    container.appendChild(svg);

    var tooltip = document.createElement('div');
    tooltip.className = 'dt-ichart-tooltip';
    container.appendChild(tooltip);

    function setActive(i) {
      var x = xAt(i);
      guideLine.setAttribute('x1', x);
      guideLine.setAttribute('x2', x);
      guideLine.style.opacity = 1;

      var rows = '';
      series.forEach(function (s) {
        var yFn = s.axis === 'left' ? yLeft : yRight;
        var val = data[i][s.key];
        dots[s.key].setAttribute('cx', x);
        dots[s.key].setAttribute('cy', yFn(val));
        dots[s.key].style.opacity = 1;
        rows += '<div class="dt-ichart-tooltip-row">' +
          '<span class="dt-ichart-tooltip-dot" style="background:' + s.color + '"></span>' +
          '<span class="dt-ichart-tooltip-label">' + s.label + '</span>' +
          '<span class="dt-ichart-tooltip-value">' + s.formatTooltip(val) + '</span>' +
          '</div>';
      });
      tooltip.innerHTML = '<div class="dt-ichart-tooltip-date">' + formatMonthYear(data[i].date) + '</div>' + rows;
      tooltip.style.opacity = 1;

      var pxPct = x / VB_W;
      var leftPct = pxPct * 100;
      tooltip.style.left = leftPct + '%';
      tooltip.style.transform = 'translateX(' + (pxPct < 0.5 ? '10px' : 'calc(-100% - 10px)') + ')';

      pillText.textContent = formatMonthYear(data[i].date);
      activePill.style.opacity = 1;
      requestAnimationFrame(function () {
        var bbox = pillText.getBBox();
        var padX = 10;
        pillRect.setAttribute('width', bbox.width + padX * 2);
        pillRect.setAttribute('x', x - bbox.width / 2 - padX);
        pillRect.setAttribute('y', VB_H - 10 - 16);
        pillText.setAttribute('x', x);
      });
    }

    function clearActive() {
      guideLine.style.opacity = 0;
      series.forEach(function (s) { dots[s.key].style.opacity = 0; });
      tooltip.style.opacity = 0;
      activePill.style.opacity = 0;
    }

    function indexFromClientX(clientX) {
      var rect = svg.getBoundingClientRect();
      var relX = (clientX - rect.left) / rect.width * VB_W;
      var pct = (relX - MARGIN.left) / plotW;
      var idx = Math.round(pct * (n - 1));
      return Math.max(0, Math.min(n - 1, idx));
    }

    svg.addEventListener('mousemove', function (e) { setActive(indexFromClientX(e.clientX)); });
    svg.addEventListener('mouseleave', clearActive);
    svg.addEventListener('touchstart', function (e) { setActive(indexFromClientX(e.touches[0].clientX)); }, { passive: true });
    svg.addEventListener('touchmove', function (e) { setActive(indexFromClientX(e.touches[0].clientX)); }, { passive: true });
    svg.addEventListener('touchend', clearActive);

    clearActive();

    // Draw-in animation once visible
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && 'IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          series.forEach(function (s) {
            var path = linePaths[s.key];
            var len = path.getTotalLength();
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = len;
            path.getBoundingClientRect();
            path.style.transition = 'stroke-dashoffset 1100ms cubic-bezier(0.22, 1, 0.36, 1)';
            path.style.strokeDashoffset = 0;
          });
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.4 });
      seen.observe(container);
    }
  }

  global.BBChart = { renderLineChart: renderLineChart };
})(window);
