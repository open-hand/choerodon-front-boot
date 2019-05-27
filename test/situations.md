## 常见场景

### 发送请求

HAP4.0选用axios作为请求发送库，使用方式如下：

```js
import React from 'react';
import { inject } from 'mobx-react';

@inject('axios')
class Example1 extends React.Component {
  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    try {
      const res = await this.props.axios.get('your url here');
      // if res get success, do something
    } catch (error) {
      // if something wrong, do something
    }
  }

  render() {
    return (
      <div>axios demo</div>
    )
  }
}

```

`注意`：

@inject注入axios，通过this.props.axios调用。

### 弹出框处理

通常打开弹窗的方式如下：

```js
const modalKey = Modal.key(); // modal key帮助我们更好地缓存弹窗内容

handleOk = () => {
  // 做一些确定的操作
  // 如果返回值为true，弹窗关闭
  // 为false，弹窗不关闭
};

handleCancel = () => {
  // do something
};

handleOpenModal = () => {
  Modal.open({
    key: modalKey,
    title: 'Modal的标题',
    drawer: true, // 是否为抽屉形式
    destoryOnClose: true,
    children: (
      <Form dataSet={addDataSetDS}>
        <TextField name="name" />
        <Select name="tableName" placeholder="请选择" required searchable />
      </Form>
    ),
    okText: '新增',
    onOk: this.handleOk,
    onCancel: this.handleCancel,
  });
};
```

### 弹窗内部调用自身

如果Modal被拆分为单独的文件，在children内部调用onOk事件。

```js
@observer
export default class SomeModal extends Component {
  constructor(props) {
    super(props);
    props.modal.handleOk(this.handleOkInModal.bind(this));
    this.dataSets = {};
  }

  handleOkInModal() {
    // do something link handleOk
  }

  render() {
    // 展示内容
  }
}
```

### 开发模式

`choerodon-hap-front-boot`提供了3条命令，分别为

- `npm start`: 本地开发时启动命令
- `npm run build`：当开发完毕后，通过build打包成编译后可发布到product环境的命令，单体应用
- `npm run dist`：当开发完毕后，通过dist打包成可发布到product环境的命令，可前后端分离部署

所有的命令都有一个参数，-m，以start为例

```js
"start": "choerodon-hap-front-boot start --config ./react/config.js -m",

"start": "choerodon-hap-front-boot start --config ./react/config.js",
```

`-m命令表示把target中generate-react中的所有模块一起打包!!!`

所以执行前要`mvn package -U`

注意：

在本地开发时，我们不提倡你使用-m命令，因为这会使打包文件数量变多（很多模块与我们开发的模块并没有关系），而且打包过来的模块，你在对应模块下修改源码是不会被监听的。

所以一般只有使用build和dist时，才会使用-m命令。