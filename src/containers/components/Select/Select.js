// data 显示下拉数据
// onChange 下拉数据选中事件回调
// type 长条下拉框
// type2 带边框小下拉框 不填type属性则为clientSearch专用
// default 默认显示字符串
// width 下拉框长度
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Observable } from 'rxjs';
import { Icon } from 'antd';
import './Select.css';

@inject('AppState')
@observer
class Select extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display: 'none',
      default: this.props.default ? this.props.default : '请选择',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.default) {
      if (nextProps.default !== this.props.default) {
        this.setState({
          default: nextProps.default,
        });
      }
    }
  }

  changeDisplay = () => {
    Observable.fromEvent(document, 'click')
      .subscribe((x) => {
        if (x.target.className.indexOf('selectDiv') === -1) {
          this.setState({
            display: 'none',
          });
        }
      });
    if (this.state.display === 'none') {
      this.setState({
        display: 'block',
      });
    } else {
      this.setState({
        display: 'none',
      });
    }
  }
  handleClickItems = (item) => {
    this.setState({
      default: item.name,
    });
    this.props.onChange(item.code);
  }
  renderData = () => {
    let data;
    if (this.props.data.length > 0) {
      data = this.props.data.map(item => (
        <p
          role="none" 
          onClick={this.handleClickItems.bind(this, item)} 
          className="pItems" 
          style={{ paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', 
          }}
        >
          <nobr>{item.name}</nobr>
        </p>
      ));
    } else {
      data = (
        <p>没有匹配内容</p>
      );
    }
    return data;
  }
  renderWidth = () => {
    let width;
    if (this.props.width) {
      width = this.props.width;
    } else if (this.props.type) {
      width = 440;
    } else {
      width = 100;
    }
    return width;
  }
  render() {
    return (
      <div
        className="selectDiv"
        role="none"
        onClick={this.changeDisplay.bind(this)}
        style={{
          paddingLeft: this.props.type || this.props.type2 ? '5px' : 0,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          cursor: 'pointer',
          width: this.renderWidth(),
          justifyContent: 'space-between',
          border: this.props.type || this.props.type2 ? '1px solid #d3d3d3' : 0,
          height: this.props.type || this.props.type2 ? '24px' : 'auto',
          borderRadius: this.props.type2 ? '2px' : 'unset',
        }}
      >
        <span className="selectDiv">{this.state.default}</span>
        <Icon style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.55)' }} className="selectDiv" type="caret-down" role={'button'} onClick={this.changeDisplay.bind(this)} />
        <div
          style={{
            display: this.state.display,
            position: 'absolute',
            top: this.props.type || this.props.type2 ? '22px' : '18px',
            zIndex: 3,
            width: this.props.type || this.props.type2 ? '100%' : 'calc(100% + 15px)',
            textAlign: 'left',
            background: 'white',
            border: '1px solid #d3d3d3',
            left: this.props.type || this.props.type2 ? 0 : '-7px',
            maxHeight: '350px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {this.renderData()}
        </div>
      </div>
    );
  }
}
export default Select;
