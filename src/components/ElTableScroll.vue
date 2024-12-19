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
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";
import { ElTable } from "element-plus";

const emit = defineEmits(["startScroll", "stopScroll"]);

const tableRef = ref(null);
const isScrolling = ref(false);
const currentPage = ref(0);

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
    default: 100, // 连续滚动时的速度
  },
  step: {
    type: Number,
    default: 1, // 连续滚动时的步长
  },
  // 是否使用分页模式
  pageMode: {
    type: Boolean,
    default: false,
  },
  // 分页模式下的翻页间隔
  pageInterval: {
    type: Number,
    default: 3000,
  },
});

let scrollTimer = null;
let isHovered = false;
let isUsingAnimationFrame = false;

// 计算总页数和每页高度
const getScrollInfo = () => {
  if (!tableRef.value?.$el) return { totalPages: 0, pageHeight: 0 };
  const demo =
    tableRef.value.$refs.bodyWrapper.getElementsByClassName(
      "el-scrollbar__wrap"
    )[0];
  if (!demo) return { totalPages: 0, pageHeight: 0 };

  const pageHeight = demo.clientHeight;
  const totalHeight = demo.scrollHeight;
  return {
    totalPages: Math.ceil(totalHeight / pageHeight),
    pageHeight,
  };
};

// 连续滚动模式
const continuousScroll = (demo) => {
  const tableScroll = ref(true);
  let animationFrameId = null;
  let lastTimestamp = 0;
  let isResetting = false; // 添加重置状态标记
  const FRAME_INTERVAL = props.scrollSpeed; // 控制动画帧率
  const RESET_DELAY = 800; // 重置延迟时间

  demo.addEventListener("mouseover", () => {
    tableScroll.value = false;
  });
  demo.addEventListener("mouseout", () => {
    tableScroll.value = true;
  });

  const animate = (timestamp) => {
    if (!tableScroll.value || isResetting) {
      animationFrameId = requestAnimationFrame(animate);
      return;
    }

    // 控制动画速度
    if (timestamp - lastTimestamp < FRAME_INTERVAL) {
      animationFrameId = requestAnimationFrame(animate);
      return;
    }

    const num = demo.scrollTop + props.step;
    // 计算当前滚动位置（取整避免小数误差）
    const currentPosition = Math.floor(demo.clientHeight + demo.scrollTop, 5);
    const totalHeight = Math.floor(demo.scrollHeight, 5);

    // 当滚动到底部时（使用取整后的值比较）
    if (currentPosition >= totalHeight) {
      isResetting = true; // 设置重置状态
      
      // 延迟重置到顶部 由于定时器的时间间隔太短  还没有滚动到顶部就进入了下一次
      setTimeout(() => {
        demo.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        // 等待滚动动画完成后再继续
        isResetting = false;
      }, RESET_DELAY); // 在底部停留的时间
    } else {
      demo.scrollTo({
        top: num,
        behavior: "smooth",
      });
    }

    lastTimestamp = timestamp;
    animationFrameId = requestAnimationFrame(animate);
  };

  // 开始动画
  animationFrameId = requestAnimationFrame(animate);

  // 返回清理函数
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
};

// 分页滚动模式
const pageScroll = (demo) => {
  const tableScroll = ref(true);

  demo.addEventListener("mouseover", () => {
    tableScroll.value = false;
  });
  demo.addEventListener("mouseout", () => {
    tableScroll.value = true;
  });

  scrollTimer = setInterval(() => {
    if (tableScroll.value) {
      const { totalPages, pageHeight } = getScrollInfo();
      if (totalPages <= 1) return;

      // 计算下一页的位置
      currentPage.value = (currentPage.value + 1) % totalPages;
      const nextPosition = currentPage.value * pageHeight;

      // 滚动到下一页
      demo.scrollTo({
        top: nextPosition,
        behavior: "smooth",
      });
    }
  }, props.pageInterval);
};

// 开始自动滚动
const startScroll = () => {
  if (isHovered || !props.autoScroll) return;

  stopScroll();
  isScrolling.value = true;
  emit("startScroll");

  nextTick(() => {
    const demo = tableRef.value.$refs.bodyWrapper.getElementsByClassName(
      "el-scrollbar__wrap"
    )[0];
    if (!demo) return;

    // 根据模式选择滚动方式
    if (props.pageMode) {
      isUsingAnimationFrame = false;
      pageScroll(demo);
    } else {
      isUsingAnimationFrame = true;
      // 保存清理函数
      scrollTimer = continuousScroll(demo);
    }
  });
};

// 停止滚动
const stopScroll = () => {
  if (scrollTimer) {
    if (isUsingAnimationFrame) {
      // 如果是使用 requestAnimationFrame，调用清理函数
      scrollTimer();
    } else {
      // 如果是使用 setInterval，清除定时器
      clearInterval(scrollTimer);
    }
    scrollTimer = null;
  }
  isScrolling.value = false;
  currentPage.value = 0;

  emit("stopScroll");
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

// 获取当前应该在第几页
const getCurrentPageFromScroll = (scrollTop, pageHeight) => {
  return Math.floor(scrollTop / pageHeight);
};

// 修改监听滚动事件的部分
watch(
  () => tableRef.value,
  (newVal) => {
    if (newVal) {
      const demo =
        newVal.$refs.bodyWrapper.getElementsByClassName(
          "el-scrollbar__wrap"
        )[0];

      // 移除之前的事件监听（如果有的话）
      demo?.removeEventListener("scroll", handleScroll);

      // 添加新的事件监听
      demo?.addEventListener("scroll", handleScroll);
    }
  },
  { immediate: true }
);

// 处理滚动事件
const handleScroll = () => {
  if (!isScrolling.value && tableRef.value) {
    const demo =
      tableRef.value.$refs.bodyWrapper.getElementsByClassName(
        "el-scrollbar__wrap"
      )[0];
    if (demo) {
      const { pageHeight } = getScrollInfo();
      currentPage.value = getCurrentPageFromScroll(demo.scrollTop, pageHeight);
    }
  }
};

// 组件卸载时清理
onUnmounted(() => {
  stopScroll();
  // 移除滚动事件监听
  if (tableRef.value) {
    const demo =
      tableRef.value.$refs.bodyWrapper.getElementsByClassName(
        "el-scrollbar__wrap"
      )[0];
    demo?.removeEventListener("scroll", handleScroll);
  }
});

// 获取需要暴露的方法
const getAllTableMethods = () => {
  if (tableRef.value) {
    // 获取 el-table 实例
    const table = tableRef.value;
    const methods = {};

    // 获取原型链上的所有方法
    let proto = Object.getPrototypeOf(table);
    while (proto) {
      Object.getOwnPropertyNames(proto).forEach((key) => {
        if (typeof table[key] === "function" && key !== "constructor") {
          methods[key] = (...args) => table[key](...args);
        }
      });
      proto = Object.getPrototypeOf(proto);
    }

    // 获取实例上的方法
    Object.getOwnPropertyNames(table).forEach((key) => {
      if (typeof table[key] === "function") {
        methods[key] = (...args) => table[key](...args);
      }
    });

    // 获取 $refs 中的方法
    if (table.$refs?.tableRef) {
      Object.getOwnPropertyNames(table.$refs.tableRef).forEach((key) => {
        if (typeof table.$refs.tableRef[key] === "function") {
          methods[key] = (...args) => table.$refs.tableRef[key](...args);
        }
      });
    }
  }
};

// 在组件挂载后获取并发送方法
onMounted(() => {
  nextTick(() => {
    getAllTableMethods();
  });
});

// 暴露基础方法
defineExpose({
  // 自定义的滚动相关方法
  startScroll,
  stopScroll,
  isScrolling,
  getCurrentPage: () => currentPage.value,
  getTotalPages: () => totalPages.value,
  // 代理所有 el-table 的方法
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (...args) => tableRef.value?.toggleRowSelection(...args),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  toggleRowExpansion: (...args) => tableRef.value?.toggleRowExpansion(...args),
  setCurrentRow: (row) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: (columnKeys) => tableRef.value?.clearFilter(columnKeys),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (...args) => tableRef.value?.sort(...args),
  getSelectionRows: () => tableRef.value?.getSelectionRows(),
  scrollTo: (options) => tableRef.value?.scrollTo(options),
  setScrollTop: (top) => tableRef.value?.setScrollTop(top),
  setScrollLeft: (left) => tableRef.value?.setScrollLeft(left),
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
