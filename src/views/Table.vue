<template>
  <div class="table-page">
    <h1>Table 滚动 插件</h1>
    <div class="controls">
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column prop="date" label="日期" width="180" />
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="address" label="地址" />
    </el-table-scroll>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ElTableScroll from "@/components/ElTableScroll.vue";

const isAutoScroll = ref(false); // 控制是否自动滚动
const isPageMode = ref(false);  // 控制滚动模式

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

const handleSelectionChange = (val) => {
  console.log("选中的行:", val);
};
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
