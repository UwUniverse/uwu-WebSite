<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ locale?: 'zh' | 'en' }>()

const copy = computed(() => props.locale === 'en'
  ? {
      title: 'Uni log performance trend',
      subtitle: 'Successful Uni debug reports · lower elapsed time is better',
      elapsedTitle: 'Total elapsed time',
      elapsedNote: 'Minutes parsed from the report summary',
      phaseTitle: 'Phase composition',
      phaseNote: 'Stacked minutes · graph analysis / kernel / final',
      improvement: '70.6% lower than the first record',
      total: 'Total',
      graph: 'Graph analysis',
      kernel: 'Kernel',
      final: 'Final',
      caption: 'Source: successful Uni debug reports dated 2026-08-23, 2026-09-14 and 2026-09-19. Records are not mixed with Make benchmarks.',
      description: 'Uni elapsed time decreases from 253.9 minutes to 74.7 minutes across three successful log records. The stacked bars show graph analysis, kernel and final phase minutes.'
    }
  : {
      title: 'Uni 日志性能变化',
      subtitle: '成功的 Uni debug report · 总耗时越低越好',
      elapsedTitle: '总耗时变化',
      elapsedNote: '从日志摘要换算出的分钟数',
      phaseTitle: '阶段耗时构成',
      phaseNote: '堆叠分钟数 · 图分析 / 内核 / 主构建',
      improvement: '相比首条记录下降 70.6%',
      total: '总耗时',
      graph: '图分析',
      kernel: '内核',
      final: '主构建',
      caption: '数据源：2026-08-23、2026-09-14、2026-09-19 的成功 Uni debug report。图表不与 Make 基准混合。',
      description: '三条成功日志中的 Uni 总耗时从 253.9 分钟下降到 74.7 分钟，堆叠柱展示图分析、内核和主构建阶段的分钟数。'
    })
</script>

<template>
  <figure class="uni-build-charts">
    <svg
      viewBox="0 0 1040 820"
      role="img"
      aria-labelledby="uni-chart-title uni-chart-desc"
    >
      <title id="uni-chart-title">{{ copy.title }}</title>
      <desc id="uni-chart-desc">{{ copy.description }}</desc>

      <defs>
        <linearGradient id="uni-trend-line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="var(--uni-chart-warm)" />
          <stop offset=".52" stop-color="var(--uni-chart-primary)" />
          <stop offset="1" stop-color="var(--uni-chart-secondary)" />
        </linearGradient>
        <linearGradient id="uni-trend-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="var(--uni-chart-primary)" stop-opacity=".2" />
          <stop offset="1" stop-color="var(--uni-chart-primary)" stop-opacity="0" />
        </linearGradient>
        <filter id="uni-chart-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="var(--uni-chart-shadow)" />
        </filter>
      </defs>

      <rect class="chart-card" x="8" y="8" width="1024" height="804" rx="30" />

      <g class="chart-heading">
        <text x="54" y="58">{{ copy.title }}</text>
        <text class="chart-subtitle" x="54" y="88">{{ copy.subtitle }}</text>
      </g>

      <g class="chart-panel" transform="translate(42 118)">
        <rect x="0" y="0" width="956" height="300" rx="22" />
        <text class="panel-title" x="28" y="38">{{ copy.elapsedTitle }}</text>
        <text class="panel-note" x="28" y="63">{{ copy.elapsedNote }}</text>

        <g class="grid" transform="translate(86 72)">
          <line x1="0" y1="0" x2="824" y2="0" />
          <line x1="0" y1="48" x2="824" y2="48" />
          <line x1="0" y1="96" x2="824" y2="96" />
          <line x1="0" y1="144" x2="824" y2="144" />
          <line x1="0" y1="192" x2="824" y2="192" />
          <g class="axis-labels">
            <text x="-18" y="5">270</text>
            <text x="-18" y="53">200</text>
            <text x="-18" y="101">130</text>
            <text x="-18" y="149">70</text>
            <text x="-18" y="197">0</text>
          </g>
          <path class="area" d="M112 11 C260 43 374 92 480 128 C628 145 742 152 848 138 L848 192 L112 192 Z" />
          <path class="line" d="M112 11 C260 43 374 92 480 128 C628 145 742 152 848 138" />
          <line class="guide" x1="112" y1="11" x2="112" y2="192" />
          <line class="guide" x1="480" y1="128" x2="480" y2="192" />
          <line class="guide" x1="848" y1="138" x2="848" y2="192" />
          <circle class="point point-first" cx="112" cy="11" r="10" />
          <circle class="point point-second" cx="480" cy="128" r="10" />
          <circle class="point point-third" cx="848" cy="138" r="10" />
          <g class="value" text-anchor="middle">
            <text x="112" y="-6">253.9</text>
            <text x="480" y="111">95.0</text>
            <text x="848" y="121">74.7</text>
            <text class="category" x="112" y="220">08/23</text>
            <text class="category" x="480" y="220">09/14</text>
            <text class="category" x="848" y="220">09/19</text>
          </g>
        </g>
        <g class="callout" transform="translate(672 20)">
          <rect width="248" height="46" rx="14" />
          <text x="124" y="29" text-anchor="middle">{{ copy.improvement }}</text>
        </g>
      </g>

      <g class="chart-panel" transform="translate(42 442)">
        <rect x="0" y="0" width="956" height="320" rx="22" />
        <text class="panel-title" x="28" y="38">{{ copy.phaseTitle }}</text>
        <text class="panel-note" x="28" y="63">{{ copy.phaseNote }}</text>

        <g class="legend" transform="translate(620 24)">
          <rect class="legend-graph" x="0" y="0" width="13" height="13" rx="3" />
          <text x="20" y="12">{{ copy.graph }}</text>
          <rect class="legend-kernel" x="116" y="0" width="13" height="13" rx="3" />
          <text x="136" y="12">{{ copy.kernel }}</text>
          <rect class="legend-final" x="214" y="0" width="13" height="13" rx="3" />
          <text x="234" y="12">{{ copy.final }}</text>
        </g>

        <g class="grid" transform="translate(86 72)">
          <line x1="0" y1="0" x2="824" y2="0" />
          <line x1="0" y1="48" x2="824" y2="48" />
          <line x1="0" y1="96" x2="824" y2="96" />
          <line x1="0" y1="144" x2="824" y2="144" />
          <line x1="0" y1="192" x2="824" y2="192" />
          <g class="axis-labels">
            <text x="-18" y="5">270</text>
            <text x="-18" y="53">200</text>
            <text x="-18" y="101">130</text>
            <text x="-18" y="149">70</text>
            <text x="-18" y="197">0</text>
          </g>

          <g class="bar bar-first">
            <rect class="bar-final" x="68" y="27" width="112" height="165" rx="8" />
            <rect class="bar-kernel" x="68" y="19" width="112" height="8" />
            <rect class="bar-graph" x="68" y="11" width="112" height="8" rx="8" />
          </g>
          <g class="bar bar-second">
            <rect class="bar-final" x="356" y="133" width="112" height="59" rx="8" />
            <rect class="bar-kernel" x="356" y="133" width="112" height="1" />
            <rect class="bar-graph" x="356" y="124" width="112" height="9" rx="8" />
          </g>
          <g class="bar bar-third">
            <rect class="bar-final" x="644" y="149" width="112" height="43" rx="8" />
            <rect class="bar-kernel" x="644" y="149" width="112" height="1" />
            <rect class="bar-graph" x="644" y="140" width="112" height="9" rx="8" />
          </g>

          <g class="value" text-anchor="middle">
            <text x="124" y="4">253.9</text>
            <text x="412" y="117">95.0</text>
            <text x="700" y="133">74.7</text>
            <text class="category" x="124" y="220">08/23</text>
            <text class="category" x="412" y="220">09/14</text>
            <text class="category" x="700" y="220">09/19</text>
          </g>
        </g>
      </g>
    </svg>
    <figcaption>{{ copy.caption }}</figcaption>
  </figure>
</template>

<style scoped>
.uni-build-charts {
  margin: 2rem 0;
}

.uni-build-charts svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-base);
}

.chart-card {
  fill: var(--uni-chart-card);
  stroke: var(--uni-chart-border);
  filter: url(#uni-chart-shadow);
}

.chart-heading text {
  fill: var(--vp-c-text-1);
  font-size: 26px;
  font-weight: 700;
}

.chart-heading .chart-subtitle,
.panel-note,
.axis-labels,
.legend {
  fill: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 500;
}

.chart-panel > rect {
  fill: var(--uni-chart-panel);
  stroke: var(--uni-chart-border);
}

.panel-title {
  fill: var(--vp-c-text-1);
  font-size: 17px;
  font-weight: 700;
}

.grid line {
  stroke: var(--uni-chart-grid);
  stroke-dasharray: 3 8;
  stroke-linecap: round;
}

.guide {
  stroke: var(--uni-chart-guide);
  stroke-dasharray: 2 7;
}

.area {
  fill: url(#uni-trend-fill);
  stroke: none;
}

.line {
  fill: none;
  stroke: url(#uni-trend-line);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.point {
  stroke: var(--uni-chart-panel);
  stroke-width: 5;
  filter: url(#uni-chart-shadow);
}

.point-first {
  fill: var(--uni-chart-warm);
}

.point-second {
  fill: var(--uni-chart-primary);
}

.point-third {
  fill: var(--uni-chart-secondary);
}

.value text {
  fill: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 700;
}

.value .category {
  fill: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 600;
}

.callout rect {
  fill: var(--uni-chart-callout);
}

.callout text {
  fill: var(--uni-chart-callout-ink);
  font-size: 14px;
  font-weight: 700;
}

.legend rect {
  stroke: none;
}

.legend-graph,
.bar-graph {
  fill: var(--uni-chart-secondary);
}

.legend-kernel,
.bar-kernel {
  fill: var(--uni-chart-warm);
}

.legend-final,
.bar-final {
  fill: var(--uni-chart-primary);
}

.uni-build-charts figcaption {
  margin-top: .75rem;
  color: var(--vp-c-text-2);
  font-size: .86rem;
}

.uni-build-charts code {
  color: var(--vp-c-brand-1);
}
</style>
