<template>
  <el-table
    v-bind="$attrs"
    ref="tableRef"
    class="el-table-scroll"
    :max-height="height"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>
  </el-table>
</template>

<script setup>
import { ref, nextTick, onUnmounted, watch } from "vue";
import { ElTable } from "element-plus";

const tableRef = ref(null);
const isScrolling = ref(false);

const props = defineProps({
  height: {
    type: [String, Number],
    default: 400,
  },
  autoScroll: {
    type: Boolean,
    default: false,
  },
  scrollSpeed: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
});

let scrollTimer = null;
let isHovered = false;

// 开始自动滚动
const startScroll = () => {
  if (isHovered || !props.autoScroll) return;

  stopScroll();

  nextTick(() => {
    const demo =
      tableRef.value.$refs.bodyWrapper.getElementsByClassName(
        "el-scrollbar__wrap"
      )[0];
    const tableScroll = ref(true);
    
    demo.addEventListener("mouseover", () => {
      tableScroll.value = false;
    });
    demo.addEventListener("mouseout", () => {
      tableScroll.value = true;
    });

    // 使用 scrollTimer 存储定时器
    scrollTimer = setInterval(() => {
      if (tableScroll.value) {
        const currentPosition = demo.scrollTop;
        const maxScroll = demo.scrollHeight - demo.clientHeight;

        // 如果已经到底部或即将到底部
        if (currentPosition >= maxScroll - props.step) {
          tableScroll.value = false; // 暂停滚动
          demo.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          // 等待回到顶部的动画完成后再继续
          setTimeout(() => {
            tableScroll.value = true;
          }, 800);
        } else {
          demo.scrollTo({
            top: currentPosition + props.step,
            behavior: "smooth",
            // 时间
            duration: 1000,
          });
        }
      }
    }, props.scrollSpeed);
  });
};

// 停止滚动
const stopScroll = () => {
  if (scrollTimer) {
    clearInterval(scrollTimer);
    scrollTimer = null;
  }
  isScrolling.value = false;
};

// 鼠标移入时暂停滚动
const handleMouseOver = () => {
  isHovered = true;
  stopScroll();
};

// 鼠标移出时恢复滚动
const handleMouseLeave = () => {
  isHovered = false;
  if (props.autoScroll) {
    startScroll();
  }
};

// 监听 autoScroll 变化
watch(
  () => props.autoScroll,
  (newVal) => {
    if (newVal) {
      startScroll();
    } else {
      stopScroll();
    }
  },
  { immediate: true }
);

// 组件卸载时清理
onUnmounted(() => {
  stopScroll();
});

defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (...args) => tableRef.value?.toggleRowSelection(...args),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  toggleRowExpansion: (...args) => tableRef.value?.toggleRowExpansion(...args),
  setCurrentRow: (row) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: (columnKeys) => tableRef.value?.clearFilter(columnKeys),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (...args) => tableRef.value?.sort(...args),
  getTable: () => tableRef.value,
  startScroll,
  stopScroll,
  isScrolling,
});
</script>

<style scoped>
.el-table-scroll {
  width: 100%;
  overflow: hidden;
}

/* 自定义滚动条样式 */
.el-table-scroll :deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.el-table-scroll :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  border-radius: 3px;
  background: #ddd;
}

.el-table-scroll :deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  border-radius: 3px;
  background: #f5f5f5;
}

/* 确保表格内容可以滚动，并启用平滑滚动 */
.el-table-scroll :deep(.el-table__body-wrapper) {
  overflow-y: auto !important;
  height: auto !important;
  scroll-behavior: smooth; /* 添加平滑滚动 */
}
</style>
