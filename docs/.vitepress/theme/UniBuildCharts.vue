<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ locale?: 'zh' | 'en' }>()

const copy = computed(() => props.locale === 'en'
  ? {
      title: 'Uni runtime telemetry',
      subtitle: 'Final phase · 82m 37s · successful build',
      cpu: 'CPU',
      memory: 'Available RAM',
      swap: 'Swap-out',
      wait: 'I/O wait',
      average: '96.2% avg',
      minimum: '5.7 GiB min',
      total: '20.1 GiB total',
      elapsed: 'Elapsed time',
      caption: 'Sampled from the final phase of a successful Uni build on 2026-09-14. CPU, MemAvailable, swap-out and I/O wait are plotted from telemetry fields.',
      description: 'A telemetry chart showing CPU, available memory, cumulative swap-out and I/O wait across the final 82 minutes and 37 seconds of a successful Uni build.'
    }
  : {
      title: 'Uni 运行时遥测',
      subtitle: '最终阶段 · 82 分 37 秒 · 构建成功',
      cpu: 'CPU',
      memory: '可用内存',
      swap: 'swap-out',
      wait: 'I/O wait',
      average: '平均 96.2%',
      minimum: '最低 5.7 GiB',
      total: '累计 20.1 GiB',
      elapsed: '阶段时间',
      caption: '采样自 2026-09-14 一次成功 Uni 构建的最终阶段。CPU、MemAvailable、swap-out 和 I/O wait 均来自日志 telemetry 字段。',
      description: '展示一次成功 Uni 构建最终 82 分 37 秒内 CPU、可用内存、累计 swap-out 与 I/O wait 的遥测图表。'
    })
</script>

<template>
  <figure class="uni-build-charts">
    <svg
      viewBox="0 0 1040 760"
      role="img"
      aria-labelledby="uni-chart-title uni-chart-desc"
    >
      <title id="uni-chart-title">{{ copy.title }}</title>
      <desc id="uni-chart-desc">{{ copy.description }}</desc>

      <defs>
        <linearGradient id="swap-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="var(--uni-chart-swap)" stop-opacity=".24" />
          <stop offset="1" stop-color="var(--uni-chart-swap)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <rect class="chart-card" x="8" y="8" width="1024" height="744" rx="24" />

      <g class="chart-heading">
        <text x="54" y="58">{{ copy.title }}</text>
        <text class="chart-subtitle" x="54" y="86">{{ copy.subtitle }}</text>
      </g>

      <g class="legend" transform="translate(54 116)">
        <g>
          <circle class="cpu-dot" cx="6" cy="-5" r="5" />
          <text x="18" y="0">{{ copy.cpu }} · {{ copy.average }}</text>
        </g>
        <g transform="translate(220 0)">
          <circle class="memory-dot" cx="6" cy="-5" r="5" />
          <text x="18" y="0">{{ copy.memory }} · {{ copy.minimum }}</text>
        </g>
        <g transform="translate(496 0)">
          <circle class="swap-dot" cx="6" cy="-5" r="5" />
          <text x="18" y="0">{{ copy.swap }} · {{ copy.total }}</text>
        </g>
        <g transform="translate(732 0)">
          <circle class="wait-dot" cx="6" cy="-5" r="5" />
          <text x="18" y="0">{{ copy.wait }}</text>
        </g>
      </g>

      <g class="chart-panel" transform="translate(42 146)">
        <rect x="0" y="0" width="956" height="258" rx="18" />
        <text class="panel-title" x="28" y="36">{{ copy.cpu }} / {{ copy.memory }}</text>

        <g class="plot" transform="translate(86 58)">
          <g class="grid">
            <line x1="0" y1="0" x2="824" y2="0" />
            <line x1="0" y1="61" x2="824" y2="61" />
            <line x1="0" y1="122" x2="824" y2="122" />
            <line x1="0" y1="182" x2="824" y2="182" />
            <line x1="0" y1="0" x2="0" y2="182" />
            <line x1="201" y1="0" x2="201" y2="182" />
            <line x1="402" y1="0" x2="402" y2="182" />
            <line x1="603" y1="0" x2="603" y2="182" />
            <line x1="824" y1="0" x2="824" y2="182" />
          </g>
          <g class="axis-labels" text-anchor="end">
            <text x="-12" y="5">100%</text>
            <text x="-12" y="66">66%</text>
            <text x="-12" y="127">33%</text>
            <text x="-12" y="187">0%</text>
          </g>
          <g class="axis-labels right-labels">
            <text x="836" y="5">30 GiB</text>
            <text x="836" y="66">20 GiB</text>
            <text x="836" y="127">10 GiB</text>
            <text x="836" y="187">0 GiB</text>
          </g>
          <polyline class="line cpu-line" points="0,182 50,5 100,1 151,1 201,1 251,0 302,0 352,26 402,2 452,2 502,0 553,0 603,0 653,1 703,0 754,0 824,173" />
          <polyline class="line memory-line" points="0,18 50,97 100,114 151,79 201,97 251,96 302,81 352,85 402,103 452,78 502,132 553,141 603,121 653,70 703,99 754,69 824,15" />
          <circle class="endpoint cpu-dot" cx="824" cy="173" r="5" />
          <circle class="endpoint memory-dot" cx="824" cy="15" r="5" />
          <g class="time-labels" text-anchor="middle">
            <text x="0" y="211">0m</text>
            <text x="201" y="211">20m</text>
            <text x="402" y="211">40m</text>
            <text x="603" y="211">60m</text>
            <text x="824" y="211">82m</text>
          </g>
        </g>
      </g>

      <g class="chart-panel" transform="translate(42 426)">
        <rect x="0" y="0" width="956" height="258" rx="18" />
        <text class="panel-title" x="28" y="36">{{ copy.swap }} / {{ copy.wait }}</text>

        <g class="plot" transform="translate(86 58)">
          <g class="grid">
            <line x1="0" y1="0" x2="824" y2="0" />
            <line x1="0" y1="61" x2="824" y2="61" />
            <line x1="0" y1="122" x2="824" y2="122" />
            <line x1="0" y1="182" x2="824" y2="182" />
            <line x1="0" y1="0" x2="0" y2="182" />
            <line x1="201" y1="0" x2="201" y2="182" />
            <line x1="402" y1="0" x2="402" y2="182" />
            <line x1="603" y1="0" x2="603" y2="182" />
            <line x1="824" y1="0" x2="824" y2="182" />
          </g>
          <g class="axis-labels" text-anchor="end">
            <text x="-12" y="5">22 GiB</text>
            <text x="-12" y="66">15 GiB</text>
            <text x="-12" y="127">7 GiB</text>
            <text x="-12" y="187">0 GiB</text>
          </g>
          <g class="axis-labels right-labels">
            <text x="836" y="5">50%</text>
            <text x="836" y="66">33%</text>
            <text x="836" y="127">16%</text>
            <text x="836" y="187">0%</text>
          </g>
          <path class="swap-area" d="M0 182 L50 94 L100 94 L151 94 L201 94 L251 94 L302 64 L352 55 L402 47 L452 42 L502 38 L553 38 L603 38 L653 38 L703 38 L754 38 L824 16 L824 182 Z" />
          <polyline class="line swap-line" points="0,182 50,94 100,94 151,94 201,94 251,94 302,64 352,55 402,47 452,42 502,38 553,38 603,38 653,38 703,38 754,38 824,16" />
          <polyline class="line wait-line" points="0,19 50,177 100,182 151,182 201,181 251,182 302,182 352,161 402,182 452,182 502,182 553,182 603,182 653,182 703,182 754,182 824,58" />
          <circle class="endpoint swap-dot" cx="824" cy="16" r="5" />
          <circle class="endpoint wait-dot" cx="824" cy="58" r="5" />
          <g class="time-labels" text-anchor="middle">
            <text x="0" y="211">0m</text>
            <text x="201" y="211">20m</text>
            <text x="402" y="211">40m</text>
            <text x="603" y="211">60m</text>
            <text x="824" y="211">82m</text>
          </g>
        </g>
      </g>

      <text class="axis-title" x="956" y="720" text-anchor="end">{{ copy.elapsed }}</text>
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
}

.chart-heading text {
  fill: var(--vp-c-text-1);
  font-size: 26px;
  font-weight: 700;
}

.chart-heading .chart-subtitle,
.legend,
.axis-labels,
.time-labels,
.axis-title {
  fill: var(--vp-c-text-2);
  font-size: 13px;
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
  stroke-dasharray: 2 7;
  stroke-linecap: round;
}

.line {
  fill: none;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cpu-line {
  stroke: var(--uni-chart-cpu);
}

.cpu-dot {
  fill: var(--uni-chart-cpu);
}

.memory-line {
  stroke: var(--uni-chart-memory);
}

.memory-dot {
  fill: var(--uni-chart-memory);
}

.swap-line {
  stroke: var(--uni-chart-swap);
}

.swap-dot {
  fill: var(--uni-chart-swap);
}

.wait-line {
  stroke: var(--uni-chart-wait);
}

.wait-dot {
  fill: var(--uni-chart-wait);
}

.swap-area {
  fill: url(#swap-area);
  stroke: none;
}

.endpoint {
  stroke: var(--uni-chart-panel);
  stroke-width: 3;
}

.uni-build-charts figcaption {
  margin-top: .75rem;
  color: var(--vp-c-text-2);
  font-size: .86rem;
}
</style>
