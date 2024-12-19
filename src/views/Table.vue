<template>
  <div class="table-page">
    <h1>Table 滚动 插件</h1>
    <div class="controls">
      <el-button @click="handleClearSelection">清除选中</el-button>
      <el-switch
        v-model="isAutoScroll"
        active-text="自动滚动"
        inactive-text="停止滚动"
      />
      <el-switch
        v-model="isPageMode"
        active-text="分页模式"
        inactive-text="连续模式"
        style="margin-left: 20px"
      />
    </div>
    <el-table-scroll
      ref="tableScrollRef"
      :data="tableData"
      :height="400"
      :auto-scroll="isAutoScroll"
      :page-mode="isPageMode"
      :scroll-speed="50"
      :step="3"
      :page-interval="1000"
      style="width: 100%"
      @methods-ready="handleMethodsReady"
      @selection-change="handleSelectionChange"
      @startScroll="startScroll"
      @stopScroll="handleStopScroll"
    >
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column type="selection" width="55" />
      <el-table-column prop="date" label="日期" width="180" />
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="address" label="地址" />
    </el-table-scroll>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ElTableScroll from "@/components/ElTableScroll.vue";

const isAutoScroll = ref(false); // 控制是否自动滚动
const isPageMode = ref(false);  // 控制滚动模式
const tableScrollRef = ref(null);
const tableMethods = ref({});

// 示例数据
const tableData = ref(
  Array.from({ length: 20 }, (_, index) => {
    const date = new Date(2016, 4, Math.floor(Math.random() * 30) + 1);
    const dateStr = `2016-05-${date.getDate().toString().padStart(2, "0")}`;
    const names = [
      "张三",
      "李四",
      "王五",
      "赵六",
      "钱七",
      "孙八",
      "周九",
      "吴十",
    ];
    const cities = [
      "北京市朝阳区",
      "上海市浦东新区",
      "广州市天河区",
      "深圳市南山区",
      "杭州市西湖区",
    ];
    const streets = ["明珠路", "阳光街", "幸福大道", "和平路", "繁华街"];

    return {
      date: dateStr,
      name: names[Math.floor(Math.random() * names.length)],
      address: `${cities[Math.floor(Math.random() * cities.length)]}${
        streets[Math.floor(Math.random() * streets.length)]
      }`,
    };
  })
);

// 接收子组件传递的方法
const handleMethodsReady = (methods) => {
  console.log('收到表格方法:', Object.keys(methods));
  tableMethods.value = methods;
};

// 使用方法的示例
const handleClearSelection = () => {
  if (tableMethods.value.clearSelection) {
    tableMethods.value.clearSelection();
  }
};

const getSelectedRows = () => {
  return tableScrollRef.value?.getSelectionRows();
};

// 可以使用任何 el-table 的方法
const doLayout = () => {
  tableScrollRef.value?.doLayout();
};

const scrollToTop = () => {
  tableScrollRef.value?.setScrollTop(0);
};

const toggleRowSelection = (row) => {
  tableScrollRef.value.toggleRowSelection(row);
};
const startScroll = () => {
  console.log("开始滚动");
};

const handleStopScroll = () => {
  console.log("停止滚动");
};

const handleSelectionChange = (val) => {
  console.log("选中的行:", val);
};

onMounted(() => {
  // 打印所有可用的方法
  console.log('表格组件方法:', tableScrollRef.value);
  // 测试方法
  if (tableScrollRef.value?.clearSelection) {
    tableScrollRef.value.clearSelection();
  }
});
</script>

<style scoped>
.table-page {
  padding: 20px;
  height: calc(100vh - 40px);
}

.controls {
  margin-bottom: 20px;
}

.el-table-scroll {
  height: calc(100% - 100px);
}
</style>
