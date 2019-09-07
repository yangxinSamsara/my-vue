// defineProperty版
class Vue extends EventTarget {
    constructor(options) {
        super();
        this.options = options;
        this.compile(); //1.将数据渲染到页面
        this.observer(this.options.data); //2.创建劫持  3.更新数据（使用自定义事件）
    }

    observer(data) {
        let _this = this;
        let keys = Object.keys(data);
        keys.forEach(key => {
            let value = data[key];
            Object.defineProperty(data, key, {
                configurable: true, //设为true  可以更改data
                enumerable: true, //设为true可以遍历data 序列化data
                get() {
                    console.log('获取数据')
                    return value
                },
                set(newValue) {
                    console.log('设置新数据', newValue);
                    if (newValue !== value) {
                        value = newValue
                        let event = new CustomEvent(key, {
                            detail: newValue
                        })
                        _this.dispatchEvent(event)
                    }
                }
            })
        })
    }

    compile() { //获取所有的节点找到带双大括号的
        let ele = document.querySelector(this.options.el);
        let childNodes = ele.childNodes;
        this.compileNodes(childNodes)
    }

    compileNodes(childNodes) {
        let _this = this;
        [...childNodes].forEach(node => {
            if (node.nodeType === 1) { //元素节点
                if (node.childNodes.length > 0) {
                    this.compileNodes(node.childNodes)
                }
            } else if (node.nodeType === 3) { //文本节点
                let text = node.textContent;
                let reg = /\{\{\s*(\S+)\s*\}\}/g; //匹配{{xx}}  (\S+)括号表示分块 方便下面取到xx
                if (reg.test(text)) {
                    let $1 = RegExp.$1;
                    node.textContent = this.options.data[$1]
                    _this.addEventListener($1,e=>{
                        node.textContent=e.detail
                    })
                }
            }
        })
    }
}