<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ locale?: 'zh' | 'en' }>()

const copy = computed(() => props.locale === 'en'
  ? {
      title: 'Uni runtime telemetry',
      subtitle: 'Final phase | 82m 37s',
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
      subtitle: '最终阶段 | 82 分 37 秒',
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

        <g class="plot" transform="translate(104 58)">
          <g class="grid">
            <line x1="0" y1="0" x2="780" y2="0" />
            <line x1="0" y1="61" x2="780" y2="61" />
            <line x1="0" y1="122" x2="780" y2="122" />
            <line x1="0" y1="182" x2="780" y2="182" />
            <line x1="0" y1="0" x2="0" y2="182" />
            <line x1="190" y1="0" x2="190" y2="182" />
            <line x1="381" y1="0" x2="381" y2="182" />
            <line x1="570" y1="0" x2="570" y2="182" />
            <line x1="780" y1="0" x2="780" y2="182" />
          </g>
          <g class="axis-labels" text-anchor="end">
            <text x="-12" y="5">100%</text>
            <text x="-12" y="66">66%</text>
            <text x="-12" y="127">33%</text>
            <text x="-12" y="187">0%</text>
          </g>
          <g class="axis-labels right-labels">
            <text x="804" y="5">30 GiB</text>
            <text x="804" y="66">20 GiB</text>
            <text x="804" y="127">10 GiB</text>
            <text x="804" y="187">0 GiB</text>
          </g>
          <polyline class="line cpu-line" points="0,182 47,5 95,1 143,1 190,1 238,0 286,0 333,26 381,2 428,2 475,0 523,0 570,0 618,1 665,0 714,0 780,173" />
          <polyline class="line memory-line" points="0,18 47,97 95,114 143,79 190,97 238,96 286,81 333,85 381,103 428,78 475,132 523,141 570,121 618,70 665,99 714,69 780,15" />
          <circle class="endpoint cpu-dot" cx="780" cy="173" r="5" />
          <circle class="endpoint memory-dot" cx="780" cy="15" r="5" />
          <g class="time-labels" text-anchor="middle">
            <text x="0" y="211">0m</text>
            <text x="190" y="211">20m</text>
            <text x="381" y="211">40m</text>
            <text x="570" y="211">60m</text>
            <text x="780" y="211">82m</text>
          </g>
        </g>
      </g>

      <g class="chart-panel" transform="translate(42 426)">
        <rect x="0" y="0" width="956" height="258" rx="18" />
        <text class="panel-title" x="28" y="36">{{ copy.swap }} / {{ copy.wait }}</text>

        <g class="plot" transform="translate(104 58)">
          <g class="grid">
            <line x1="0" y1="0" x2="780" y2="0" />
            <line x1="0" y1="61" x2="780" y2="61" />
            <line x1="0" y1="122" x2="780" y2="122" />
            <line x1="0" y1="182" x2="780" y2="182" />
            <line x1="0" y1="0" x2="0" y2="182" />
            <line x1="190" y1="0" x2="190" y2="182" />
            <line x1="381" y1="0" x2="381" y2="182" />
            <line x1="570" y1="0" x2="570" y2="182" />
            <line x1="780" y1="0" x2="780" y2="182" />
          </g>
          <g class="axis-labels" text-anchor="end">
            <text x="-12" y="5">22 GiB</text>
            <text x="-12" y="66">15 GiB</text>
            <text x="-12" y="127">7 GiB</text>
            <text x="-12" y="187">0 GiB</text>
          </g>
          <g class="axis-labels right-labels">
            <text x="804" y="5">50%</text>
            <text x="804" y="66">33%</text>
            <text x="804" y="127">16%</text>
            <text x="804" y="187">0%</text>
          </g>
          <path class="swap-area" d="M0 182 L47 94 L95 94 L143 94 L190 94 L238 94 L286 64 L333 55 L381 47 L428 42 L475 38 L523 38 L570 38 L618 38 L665 38 L714 38 L780 16 L780 182 Z" />
          <polyline class="line swap-line" points="0,182 47,94 95,94 143,94 190,94 238,94 286,64 333,55 381,47 428,42 475,38 523,38 570,38 618,38 665,38 714,38 780,16" />
          <polyline class="line wait-line" points="0,19 47,177 95,182 143,182 190,181 238,182 286,182 333,161 381,182 428,182 475,182 523,182 570,182 618,182 665,182 714,182 780,58" />
          <circle class="endpoint swap-dot" cx="780" cy="16" r="5" />
          <circle class="endpoint wait-dot" cx="780" cy="58" r="5" />
          <g class="time-labels" text-anchor="middle">
            <text x="0" y="211">0m</text>
            <text x="190" y="211">20m</text>
            <text x="381" y="211">40m</text>
            <text x="570" y="211">60m</text>
            <text x="780" y="211">82m</text>
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
