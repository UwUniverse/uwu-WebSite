<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ locale?: 'zh' | 'en' }>()

const copy = computed(() => props.locale === 'en'
  ? {
      title: 'uwuAOSP build performance',
      subtitle: 'Same host · lower build time is better',
      timeTitle: 'Clean build time',
      timeNote: 'Measured elapsed time',
      timeReduction: '35.5% less elapsed time',
      throughputTitle: 'Relative throughput',
      throughputNote: 'Derived index · Make = 100',
      throughputGain: '1.55× effective throughput',
      caption: 'The throughput panel is calculated as',
      captionSuffix: '; it is not a third benchmark.'
    }
  : {
      title: 'uwuAOSP 构建性能',
      subtitle: '同一主机 · 构建耗时越低越好',
      timeTitle: 'Clean build 用时',
      timeNote: '实测耗时',
      timeReduction: '耗时减少 35.5%',
      throughputTitle: '相对吞吐',
      throughputNote: '派生指标 · Make = 100',
      throughputGain: '有效吞吐 1.55×',
      caption: '吞吐图按以下公式计算',
      captionSuffix: '；不代表额外的一次构建。'
    })
</script>

<template>
  <figure class="uni-build-charts">
    <svg
      viewBox="0 0 1040 760"
      role="img"
      aria-labelledby="uni-chart-title uni-chart-desc"
    >
      <title id="uni-chart-title">uwuAOSP clean build time and throughput</title>
      <desc id="uni-chart-desc">
        Make completed in 5 hours 19 minutes 4 seconds. Uni completed in 3 hours 25 minutes 43 seconds.
        The derived throughput index rises from 100 to 155.1.
      </desc>

      <defs>
        <linearGradient id="uni-time-line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="var(--uni-chart-warm)" />
          <stop offset="1" stop-color="var(--uni-chart-primary)" />
        </linearGradient>
        <linearGradient id="uni-time-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="var(--uni-chart-primary)" stop-opacity=".22" />
          <stop offset="1" stop-color="var(--uni-chart-primary)" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="uni-throughput-line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="var(--uni-chart-secondary)" />
          <stop offset="1" stop-color="var(--uni-chart-primary)" />
        </linearGradient>
        <linearGradient id="uni-throughput-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="var(--uni-chart-secondary)" stop-opacity=".2" />
          <stop offset="1" stop-color="var(--uni-chart-secondary)" stop-opacity="0" />
        </linearGradient>
        <filter id="uni-chart-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="var(--uni-chart-shadow)" />
        </filter>
      </defs>

      <rect class="chart-card" x="8" y="8" width="1024" height="744" rx="30" />

      <g class="chart-heading">
        <text x="54" y="58">{{ copy.title }}</text>
        <text class="chart-subtitle" x="54" y="88">{{ copy.subtitle }}</text>
      </g>

      <g class="chart-panel" transform="translate(42 118)">
        <rect x="0" y="0" width="956" height="276" rx="22" />
        <text class="panel-title" x="28" y="38">{{ copy.timeTitle }}</text>
        <text class="panel-note" x="28" y="63">{{ copy.timeNote }}</text>

        <g class="grid" transform="translate(86 84)">
          <line x1="0" y1="0" x2="824" y2="0" />
          <line x1="0" y1="48" x2="824" y2="48" />
          <line x1="0" y1="96" x2="824" y2="96" />
          <line x1="0" y1="144" x2="824" y2="144" />
          <line x1="0" y1="192" x2="824" y2="192" />
          <line x1="0" y1="240" x2="824" y2="240" />
          <g class="axis-labels">
            <text x="-14" y="5">6h</text>
            <text x="-14" y="53">5h</text>
            <text x="-14" y="101">4h</text>
            <text x="-14" y="149">3h</text>
            <text x="-14" y="197">2h</text>
            <text x="-14" y="245">0h</text>
          </g>
          <path class="area area-time" d="M94 33 C290 58 500 94 730 115 L730 240 L94 240 Z" />
          <path class="line line-time" d="M94 33 C290 58 500 94 730 115" />
          <line class="guide" x1="94" y1="33" x2="94" y2="240" />
          <line class="guide" x1="730" y1="115" x2="730" y2="240" />
          <circle class="point point-make" cx="94" cy="33" r="9" />
          <circle class="point point-uni" cx="730" cy="115" r="9" />
          <g class="value" text-anchor="middle">
            <text x="94" y="17">5:19:04</text>
            <text x="730" y="99">3:25:43</text>
            <text class="category" x="94" y="265">Make</text>
            <text class="category" x="730" y="265">Uni</text>
          </g>
        </g>
        <g class="callout" transform="translate(676 22)">
          <rect width="244" height="46" rx="14" />
          <text x="122" y="29" text-anchor="middle">{{ copy.timeReduction }}</text>
        </g>
      </g>

      <g class="chart-panel" transform="translate(42 420)">
        <rect x="0" y="0" width="956" height="276" rx="22" />
        <text class="panel-title" x="28" y="38">{{ copy.throughputTitle }}</text>
        <text class="panel-note" x="28" y="63">{{ copy.throughputNote }}</text>

        <g class="grid" transform="translate(86 84)">
          <line x1="0" y1="0" x2="824" y2="0" />
          <line x1="0" y1="52" x2="824" y2="52" />
          <line x1="0" y1="104" x2="824" y2="104" />
          <line x1="0" y1="156" x2="824" y2="156" />
          <line x1="0" y1="208" x2="824" y2="208" />
          <g class="axis-labels">
            <text x="-14" y="5">180</text>
            <text x="-14" y="57">160</text>
            <text x="-14" y="109">140</text>
            <text x="-14" y="161">120</text>
            <text x="-14" y="213">100</text>
          </g>
          <path class="area area-throughput" d="M94 208 C290 186 500 111 730 63 L730 208 L94 208 Z" />
          <path class="line line-throughput" d="M94 208 C290 186 500 111 730 63" />
          <line class="guide" x1="94" y1="208" x2="94" y2="208" />
          <line class="guide" x1="730" y1="63" x2="730" y2="208" />
          <circle class="point point-make" cx="94" cy="208" r="9" />
          <circle class="point point-uni" cx="730" cy="63" r="9" />
          <g class="value" text-anchor="middle">
            <text x="94" y="192">100</text>
            <text x="730" y="47">155.1</text>
            <text class="category" x="94" y="233">Make</text>
            <text class="category" x="730" y="233">Uni</text>
          </g>
        </g>
        <g class="callout callout-secondary" transform="translate(676 22)">
          <rect width="244" height="46" rx="14" />
          <text x="122" y="29" text-anchor="middle">{{ copy.throughputGain }}</text>
        </g>
      </g>
    </svg>
    <figcaption>
      {{ copy.caption }} <code>Make time / Uni time × 100</code>{{ copy.captionSuffix }}
    </figcaption>
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
.axis-labels {
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
  stroke: none;
}

.area-time {
  fill: url(#uni-time-fill);
}

.area-throughput {
  fill: url(#uni-throughput-fill);
}

.line {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.line-time {
  stroke: url(#uni-time-line);
}

.line-throughput {
  stroke: url(#uni-throughput-line);
}

.point {
  stroke: var(--uni-chart-panel);
  stroke-width: 5;
  filter: url(#uni-chart-shadow);
}

.point-make {
  fill: var(--uni-chart-warm);
}

.point-uni {
  fill: var(--uni-chart-primary);
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

.callout-secondary rect {
  fill: var(--uni-chart-callout-secondary);
}

.uni-build-charts figcaption,
figcaption {
  margin-top: .75rem;
  color: var(--vp-c-text-2);
  font-size: .86rem;
}

code {
  color: var(--vp-c-brand-1);
}
</style>
