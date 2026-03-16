/* ============================================================
   Charts — SVG Chart Generators
   All functions return SVG or HTML strings.
   ============================================================ */

// Central chart color constants — sourced from Software DS tokens.
// SVG attributes don't support var(), so these hex values must match the token definitions.
window.ChartColors = {
  success:        '#7A9A01', /* --sds-status-success-strong */
  warning:        '#C4AA25', /* --sds-status-warning-strong */
  error:          '#CF6253', /* --sds-color-red-450 */
  errorStrong:    '#BF5547', /* --sds-status-error-strong / --sds-color-red-500 */
  primary:        '#013D5B', /* --sds-interactive-primary */
  bgSubtle:       '#F4F1EB', /* --sds-bg-subtle */
  disabled:       '#D0CBC3', /* --sds-color-warm-gray-200 */
  info:           '#77B2C7', /* --sds-color-blue-300 */
};

window.Charts = {

  // ---- Gauge (arc gauge 0-100) ----
  gauge: function(score, size) {
    size = size || 160;
    var cx = size / 2;
    var cy = size / 2;
    var r = (size / 2) - 12;
    var startAngle = 135;
    var endAngle = 405;
    var totalArc = endAngle - startAngle;

    // Color zones: 0-25 green, 26-50 yellow, 51-75 orange, 76-100 red
    var color;
    if (score <= 25) color = ChartColors.success;
    else if (score <= 50) color = ChartColors.warning;
    else if (score <= 75) color = ChartColors.error;
    else color = ChartColors.errorStrong;

    var bgColor = ChartColors.bgSubtle;

    function polarToCartesian(cx, cy, r, angleDeg) {
      var rad = (angleDeg - 90) * Math.PI / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    function describeArc(cx, cy, r, startDeg, endDeg) {
      var start = polarToCartesian(cx, cy, r, endDeg);
      var end = polarToCartesian(cx, cy, r, startDeg);
      var largeArc = (endDeg - startDeg > 180) ? 1 : 0;
      return 'M ' + start.x + ' ' + start.y + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 0 ' + end.x + ' ' + end.y;
    }

    var scoreAngle = startAngle + (score / 100) * totalArc;
    var bgPath = describeArc(cx, cy, r, startAngle, endAngle);
    var fillPath = describeArc(cx, cy, r, startAngle, scoreAngle);

    var html = '<div class="gauge-container">';
    html += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
    html += '<path d="' + bgPath + '" fill="none" stroke="' + bgColor + '" stroke-width="10" stroke-linecap="round"/>';
    if (score > 0) {
      html += '<path d="' + fillPath + '" fill="none" stroke="' + color + '" stroke-width="10" stroke-linecap="round"/>';
    }
    html += '</svg>';
    // Gauge label uses the same color variable as the SVG arc
    var labelColorMap = {};
    labelColorMap[ChartColors.success] = 'var(--sds-status-success-strong)';
    labelColorMap[ChartColors.warning] = 'var(--sds-status-warning-strong)';
    labelColorMap[ChartColors.error] = 'var(--sds-status-error-strong)';
    labelColorMap[ChartColors.errorStrong] = 'var(--sds-status-error-strong)';
    html += '<div class="gauge-label" style="color:' + (labelColorMap[color] || color) + ';">' + score + '</div>';
    html += '<div class="gauge-sublabel">Risk Score</div>';
    html += '</div>';
    return html;
  },

  // ---- Donut Chart ----
  donut: function(segments, size) {
    size = size || 140;
    var cx = size / 2;
    var cy = size / 2;
    var r = (size / 2) - 10;
    var strokeWidth = 16;
    var circumference = 2 * Math.PI * r;

    var total = 0;
    for (var i = 0; i < segments.length; i++) {
      total += segments[i].value;
    }

    var html = '<div class="donut-container">';
    html += '<div class="donut-chart">';
    html += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';

    var offset = 0;
    for (var j = 0; j < segments.length; j++) {
      var seg = segments[j];
      var pct = total > 0 ? seg.value / total : 0;
      var dashLen = pct * circumference;
      var dashGap = circumference - dashLen;
      var rotation = (offset * 360 / total) - 90;

      html += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + seg.color + '" stroke-width="' + strokeWidth + '"';
      html += ' stroke-dasharray="' + dashLen + ' ' + dashGap + '"';
      html += ' transform="rotate(' + rotation + ' ' + cx + ' ' + cy + ')"';
      html += ' style="transition:stroke-dasharray 0.3s"/>';

      offset += seg.value;
    }

    html += '</svg>';

    // Center label
    if (segments.length > 0) {
      var topPct = total > 0 ? Math.round((segments[0].value / total) * 100) : 0;
      html += '<div class="donut-center"><div class="donut-center-value">' + topPct + '%</div><div class="donut-center-label">' + segments[0].label + '</div></div>';
    }

    html += '</div>';

    // Legend
    html += '<div class="donut-legend">';
    for (var k = 0; k < segments.length; k++) {
      var s = segments[k];
      var sPct = total > 0 ? Math.round((s.value / total) * 100) : 0;
      html += '<div class="donut-legend-item">';
      html += '<span class="donut-legend-swatch" style="background:' + s.color + '"></span>';
      html += '<span>' + s.label + '</span>';
      html += '<span class="donut-legend-value">' + sPct + '%</span>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';

    return html;
  },

  // ---- Sparkline ----
  sparkline: function(data, width, height) {
    width = width || 100;
    height = height || 32;
    if (!data || data.length < 2) return '';

    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    var range = max - min || 1;
    var padding = 2;
    var plotW = width - padding * 2;
    var plotH = height - padding * 2;

    var points = [];
    for (var i = 0; i < data.length; i++) {
      var x = padding + (i / (data.length - 1)) * plotW;
      var y = padding + plotH - ((data[i] - min) / range) * plotH;
      points.push(x.toFixed(1) + ',' + y.toFixed(1));
    }

    return '<svg class="sparkline" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '"><polyline points="' + points.join(' ') + '"/></svg>';
  },

  // ---- Heatmap ----
  heatmap: function(config) {
    var rows = config.rows || [];
    var cols = config.cols || [];
    var cells = config.cells || [];

    var html = '<div style="display:grid;grid-template-columns:100px repeat(' + cols.length + ', 1fr);gap:2px;align-items:center;">';

    // Header row
    html += '<div></div>';
    for (var c = 0; c < cols.length; c++) {
      html += '<div class="heatmap-col-label">' + cols[c].label + '</div>';
    }

    // Data rows
    for (var r = 0; r < rows.length; r++) {
      html += '<div class="heatmap-row-label">' + rows[r].label + '</div>';
      for (var cc = 0; cc < cols.length; cc++) {
        var val = cells[r] && cells[r][cc] !== undefined ? cells[r][cc] : 0;
        var cellClass = 'heatmap-cell';
        if (val === 0) cellClass += ' heatmap-cell--none';
        else if (val <= 3) cellClass += ' heatmap-cell--low';
        else if (val <= 7) cellClass += ' heatmap-cell--medium';
        else cellClass += ' heatmap-cell--high';
        html += '<div class="' + cellClass + '">' + (val > 0 ? val : '') + '</div>';
      }
    }

    html += '</div>';
    return html;
  },

  // ---- Progress Ring ----
  progressRing: function(percent, size, color) {
    size = size || 60;
    color = color || ChartColors.primary;
    var r = (size / 2) - 4;
    var circumference = 2 * Math.PI * r;
    var offset = circumference - (percent / 100) * circumference;

    var html = '<div class="progress-ring-container" style="width:' + size + 'px;height:' + size + 'px;">';
    html += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
    html += '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + ChartColors.bgSubtle + '" stroke-width="4"/>';
    html += '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4"';
    html += ' stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '"';
    html += ' transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"';
    html += ' stroke-linecap="round" style="transition:stroke-dashoffset 0.3s"/>';
    html += '</svg>';
    html += '<div class="progress-ring-label">' + percent + '%</div>';
    html += '</div>';
    return html;
  },

  // ---- Bar Chart (horizontal) ----
  barChart: function(data, width, height) {
    width = width || 400;
    var barHeight = 24;
    var gap = 8;

    if (!data || data.length === 0) return '';

    var maxVal = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].value > maxVal) maxVal = data[i].value;
    }
    if (maxVal === 0) maxVal = 1;

    var html = '<div style="width:' + width + 'px;">';
    for (var j = 0; j < data.length; j++) {
      var item = data[j];
      var pct = (item.value / maxVal) * 100;
      var color = item.color || 'var(--sds-interactive-primary)';

      html += '<div class="bar-chart-row">';
      html += '<div class="bar-chart-label" title="' + item.label + '">' + item.label + '</div>';
      html += '<div class="bar-chart-track"><div class="bar-chart-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>';
      html += '<div class="bar-chart-value">' + item.value + '</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
};
