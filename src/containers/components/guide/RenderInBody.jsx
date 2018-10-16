import React, { Component } from 'react';
import ReactDom from 'react-dom';

export default class RenderInBody extends Component {

  componentDidMount() { // 新建一个div标签并塞进body
    this.popup = document.createElement('div');
    document.body.appendChild(this.popup);
    this.renderLayer();
  }

  componentDidUpdate() {
    this.renderLayer();
  }

  componentWillUnmount() { // 在组件卸载的时候，保证弹层也被卸载掉
    ReactDom.unmountComponentAtNode(this.popup);
    document.body.removeChild(this.popup);
  }

  renderLayer() { // 将弹层渲染到body下的div标签
    ReactDom.render(this.props.children, this.popup);
  }

  render() {
    return null;
  }
}
