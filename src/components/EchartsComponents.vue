<template>
  <div :id="chartId" class="chart-container"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { onMounted, onUnmounted, watch, ref } from "vue";
import { getEchartsOption } from "@/Api/common";

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  echartsType: {
    type: String,
    required: true,
  },
  chartData: {
    type: Object,
    default: () => ({}),
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

// 定义要触发的事件
const emit = defineEmits(['optionChange', 'onInit']);

const chartId = `chart-${props.id || Math.random().toString(36).substr(2, 9)}`;
let chartInstance = null;
const chartOptions = ref(null);
const finalOptions = ref(null);

// 修改获取配置的函数，获取后触发事件
const fetchEchartsOption = async (type) => {
  const option = await getEchartsOption(type);
  if (option) {
    // 将获取到的原始配置发送给父组件
    emit('optionChange', { type, option: JSON.parse(JSON.stringify(option)) });
  }
  return option;
};

// 初始化图表
const initChart = async () => {
  if (chartInstance) {
    chartInstance.dispose();
  }

  const chartContainer = document.getElementById(chartId);
  if (!chartContainer) {
    console.error("Chart container not found");
    return;
  }

  try {
    chartInstance = echarts.init(chartContainer);

    // 获取官方示例配置
    const defaultOption = await fetchEchartsOption(props.echartsType);
    if (defaultOption) {
      chartOptions.value = defaultOption;
      // 初始化完成后触发事件
      emit('onInit', {
        instance: chartInstance,
        option: JSON.parse(JSON.stringify(defaultOption))
      });
    }
    setChartOptions();
  } catch (error) {
    console.error("Failed to initialize chart:", error);
  }

  const debouncedResize = debounce(handleResize, 300);
  window.addEventListener("resize", debouncedResize);
};

// 设置图表配置
const setChartOptions = () => {
  if (!chartInstance) return;

  finalOptions.value = {
    ...(chartOptions.value || {}),
    ...props.chartData,
    ...props.options,
  };

  try {
    chartInstance.setOption(finalOptions.value, true);
  } catch (error) {
    console.error("Failed to set chart options:", error);
  }
};

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 处理窗口大小改变
const handleResize = () => {
  if (chartInstance) {
    try {
      chartInstance.resize();
    } catch (error) {
      console.error("Failed to resize chart:", error);
    }
  }
};

// 监听类型变化
watch(
  () => props.echartsType,
  async () => {
    try {
      // 当类型改变时，重新获取配置
      const newOption = await fetchEchartsOption(props.echartsType);
      console.log('类型变化，新配置:', newOption);
      if (newOption) {
        chartOptions.value = newOption;
        setChartOptions();
      }
    } catch (error) {
      console.error("Failed to update chart type:", error);
    }
  }
);

// 监听数据和配置变化
watch(
  [() => props.chartData, () => props.options],
  () => {
    setChartOptions();
  },
  { deep: true }
);

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  if (chartInstance) {
    try {
      chartInstance.dispose();
      chartInstance = null;
    } catch (error) {
      console.error("Failed to dispose chart:", error);
    }
  }
  window.removeEventListener("resize", handleResize);
});

// 暴露实例和配置
defineExpose({
  chartInstance: () => chartInstance,
  finalOptions,
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
