<template>
  <div class="chart-container">
    <EchartsComponent
      ref="chartRef"
      :echartsType="currentType"
      :options="customOptions"
      @optionChange="handleOptionChange"
      @onInit="handleChartInit"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import EchartsComponent from "@/components/EchartsComponents.vue";

const chartRef = ref(null);

const currentType = ref("line-smooth");
const customOptions = ref({});
let originalOption = null;

// 处理配置变化
const handleOptionChange = ({ type, option }) => {
  originalOption = option;
  console.log("获取到原始配置:", option);
  
  // 这里可以获取图表实例和配置
  const instance = chartRef.value?.chartInstance();
  const options = chartRef.value?.finalOptions;
  
  console.log("当前图表实例:", instance);
  console.log("当前配置:", options);

  customOptions.value = {
    ...option,
    title: {
      text: "自定义标题飒飒",
      left: "center",
    },
    
  };
};

// 处理图表初始化
const handleChartInit = ({ instance, option }) => {
  console.log("图表实例:", instance);
  console.log("初始配置:", option);

  instance.on("click", (params) => {
    // 也可以在这里获取最新的实例和配置
    const currentInstance = chartRef.value?.chartInstance();
    const currentOptions = chartRef.value?.finalOptions;
    console.log("点击事件:", params);
    console.log("当前配置:", currentOptions);
  });
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 500px;
}
</style>
