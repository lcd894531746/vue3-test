
// 获取 ECharts 官方示例配置的函数
export const getEchartsOption = async (type) => {
    try {
        const response = await fetch(`https://echarts.apache.org/examples/examples/js/${type}.js`);
        const jsContent = await response.text();

        // 创建一个全局变量来接收配置
        let option;

        // 创建执行环境
        const context = {
            option: null, // 这个会被示例代码赋值
            setTimeout: () => { },
            setInterval: () => { },
            app: {
                title: '',
                titleCN: ''
            }
        };

        // 执行示例代码
        try {
            // 将 context 中的变量注入到执行环境中
            const code = `
        with (context) {
          ${jsContent}
          return option;
        }
      `;

            // 创建函数并执行
            const fn = new Function('context', code);
            option = fn(context);
            console.log('获取到的配置:', option);
            return option;
        } catch (error) {
            console.error('执行示例代码失败:', error);
            return null;
        }
    } catch (error) {
        console.error('获取示例代码失败:', error);
        return null;
    }
};