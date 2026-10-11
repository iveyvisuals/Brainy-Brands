/* Reusable dual-axis scrubbable line chart. No dependencies. */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var COMPACT_BELOW = 600;

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

  function renderLineChart(container, cfg, opts) {
    opts = opts || {};
    var data = cfg.data;
    var series = cfg.series;
    var n = data.length;

    // On narrow screens the chart is drawn at the container's real pixel width
    // so axis text stays readable, instead of scaling a 1000-wide canvas down.
    var measured = container.clientWidth || 1000;
    var compact = measured < COMPACT_BELOW;
    var VB_W = compact ? Math.round(measured) : 1000;
    var VB_H = compact ? 300 : 380;
    var MARGIN = compact
      ? { top: 16, right: 42, bottom: 30, left: 48 }
      : { top: 24, right: 54, bottom: 34, left: 60 };

    container.innerHTML = '';
    container.classList.add('dt-ichart');
    container.classList.toggle('dt-ichart--compact', compact);
    container.__bbCfg = cfg;
    container.__bbWidth = measured;

    var svg = el('svg', {
      viewBox: '0 0 ' + VB_W + ' ' + VB_H,
      class: 'dt-ichart-svg',
      role: 'img',
      'aria-label': cfg.ariaLabel || 'Interactive chart'
    });

    var plotW = VB_W - MARGIN.left - MARGIN.right;
    var plotH = VB_H - MARGIN.top - MARGIN.bottom;

    var leftList = series.filter(function (s) { return s.axis === 'left'; });
    var rightList = series.filter(function (s) { return s.axis === 'right'; });
    var leftSeries = leftList[0];
    var rightSeries = rightList[0];

    function axisMax(list) {
      return Math.max.apply(null, list.map(function (s) {
        return Math.max.apply(null, data.map(function (d) { return d[s.key]; }));
      }));
    }
    var leftRawMax = axisMax(leftList);
    var rightRawMax = rightSeries ? axisMax(rightList) : 0;
    var leftNice = niceMax(leftRawMax, 4);
    var rightNice = rightSeries ? niceMax(rightRawMax, 4) : null;

    function xAt(i) { return MARGIN.left + (i / (n - 1)) * plotW; }
    function yLeft(v) { return MARGIN.top + plotH - (v / leftNice.max) * plotH; }
    function yRight(v) { return MARGIN.top + plotH - (v / rightNice.max) * plotH; }

    // Grid lines + left/right axis labels
    var gridGroup = el('g', { class: 'dt-ichart-grid' });
    var leftAxisLabelEls = [];
    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var val = (leftNice.max / ticks) * t;
      var y = yLeft(val);
      gridGroup.appendChild(el('line', { x1: MARGIN.left, x2: VB_W - MARGIN.right, y1: y, y2: y, class: 'dt-ichart-gridline' }));
      var leftLabel = el('text', { x: MARGIN.left - 10, y: y + 4, class: 'dt-ichart-axislabel', 'text-anchor': 'end' });
      leftLabel.textContent = leftSeries.formatAxis(val);
      gridGroup.appendChild(leftLabel);
      leftAxisLabelEls.push(leftLabel);
      if (rightSeries) {
        var rVal = (rightNice.max / ticks) * t;
        var rLabel = el('text', { x: VB_W - MARGIN.right + 10, y: y + 4, class: 'dt-ichart-axislabel dt-ichart-axislabel--right', 'text-anchor': 'start' });
        rLabel.textContent = rightSeries.formatAxis(rVal);
        gridGroup.appendChild(rLabel);
      }
    }
    svg.appendChild(gridGroup);

    // X-axis tick labels (sparse), always including the last month
    var xTickGroup = el('g', { class: 'dt-ichart-xticks' });
    var everyN = cfg.xTickEvery || 12;
    if (compact) {
      var maxLabels = Math.max(3, Math.floor(plotW / 62));
      everyN = Math.max(everyN, Math.ceil((n - 1) / (maxLabels - 1)));
    }
    var xTickIdxs = [];
    for (var i = 0; i < n; i += everyN) { xTickIdxs.push(i); }
    var lastIdx = xTickIdxs.length - 1;
    if (xTickIdxs[lastIdx] !== n - 1) {
      if (n - 1 - xTickIdxs[lastIdx] < everyN / 2) {
        xTickIdxs[lastIdx] = n - 1;
      } else {
        xTickIdxs.push(n - 1);
      }
    }
    xTickIdxs.forEach(function (idx) {
      var lbl = el('text', { x: xAt(idx), y: VB_H - 10, class: 'dt-ichart-xlabel', 'text-anchor': 'middle' });
      lbl.textContent = cfg.xLabel(data[idx].date);
      xTickGroup.appendChild(lbl);
    });
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
      if (s.dashed) { path.setAttribute('stroke-dasharray', '7 6'); }
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

    var PILL_H = 22;
    var PILL_CENTER_Y = VB_H - 14;
    var activePill = el('g', { class: 'dt-ichart-pill' });
    var pillRect = el('rect', { rx: 10, ry: 10, height: PILL_H, y: PILL_CENTER_Y - PILL_H / 2 });
    var pillText = el('text', {
      class: 'dt-ichart-pilltext', 'text-anchor': 'middle',
      'dominant-baseline': 'central', 'alignment-baseline': 'central',
      y: PILL_CENTER_Y
    });
    activePill.appendChild(pillRect);
    activePill.appendChild(pillText);
    svg.appendChild(activePill);

    container.appendChild(svg);

    var statsEl = container.previousElementSibling;
    if (statsEl && statsEl.classList.contains('dt-ichart-stats')) {
      requestAnimationFrame(function () {
        var minLeft = Math.min.apply(null, leftAxisLabelEls.map(function (l) { return l.getBoundingClientRect().left; }));
        var statsLeft = statsEl.getBoundingClientRect().left;
        statsEl.style.paddingLeft = Math.max(0, minLeft - statsLeft) + 'px';
      });
    }

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
      pillText.setAttribute('x', x);
      activePill.style.opacity = 1;
      requestAnimationFrame(function () {
        var bbox = pillText.getBBox();
        var padX = 10;
        pillRect.setAttribute('width', bbox.width + padX * 2);
        pillRect.setAttribute('x', x - bbox.width / 2 - padX);
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
    if (!reduced && !opts.noAnim && 'IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          series.forEach(function (s) {
            if (s.dashed) { return; }
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

  function watchResize(container) {
    if (container.__bbWatching) { return; }
    container.__bbWatching = true;
    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var w = container.clientWidth;
        if (!w || !container.__bbCfg) { return; }
        var wasCompact = container.__bbWidth < COMPACT_BELOW;
        var isCompact = w < COMPACT_BELOW;
        if (wasCompact !== isCompact || (isCompact && Math.abs(w - container.__bbWidth) > 24)) {
          renderLineChart(container, container.__bbCfg, { noAnim: true });
        }
      }, 200);
    });
  }

  global.BBChart = {
    renderLineChart: function (container, cfg) {
      renderLineChart(container, cfg);
      watchResize(container);
    }
  };
})(window);
