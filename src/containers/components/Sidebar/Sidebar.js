import React, { PureComponent } from 'react';
import { Button } from 'choerodon-ui';
import classNames from 'classnames';
import { Col } from 'antd';
import QueueAnim from 'rc-queue-anim';
import './Sidebar.scss';
import './main.scss';


class Sidebar extends PureComponent {

  static defaultProps = {
    loading: false,
    visible: false,
    showOkBth: true,
  };

  componentWillUpdate(nextProps) {
    const elements = document.getElementById('container');
    if (this.props.visible === false && nextProps.visible === true) {
      elements.className = 'c7n-sidebar-wrap';
    }
  }

  get header() {
    return this.props.title ? (
      <header className="c7n-sidebar-container-header"><span className="c7n-text-title-3">{this.props.title}</span></header>
    ) : null;
  }

  get aside() {
    return this.props.aside ? (
      <aside className="c7n-sidebar-container-aside">{this.props.aside}</aside>
    ) : null;
  }

  get footer() {
    if (this.props.showOkBth) {
      return (
        <footer className="c7n-sidebar-container-footer">
          {this.props.footer ? this.props.footer : (
            <div>
              <Button
                funcType="raised"
                onClick={this.props.onOk}
                className="login-form-button"
                style={{ marginRight: 12 }}
                loading={this.props.loading}
                clicked={this.props.loading}
              >
                {Choerodon.getMessage('保存', 'Save')}
              </Button>
              <Button
                funcType="raised"
                disabled={this.props.loading}
                htmltype="reset"
                onClick={this.props.onClose}
                className="color2"
              >
                {Choerodon.getMessage('取消', 'Cancel')}
              </Button>
            </div>)}
        </footer>);
    } else {
      return (
        <footer className="c7n-sidebar-container-footer">
          <Button
            disabled={this.props.loading}
            text={Choerodon.getMessage('取消', 'Cancel')}
            htmltype="reset"
            onClick={this.props.onClose}
            className="color2"
          >
            取消
          </Button>
        </footer>);
    }
  }

  get content() {
    if (this.aside) {
      return (
        <section className="c7n-sidebar-container-content">
          <article className="c7n-sidebar-container-article">{this.props.children}</article>
          {this.aside}
        </section>
      );
    }
    return (
      <section className="c7n-sidebar-container-content">
        <article className="c7n-sidebar-container-article">{this.props.children}</article>
      </section>
    );
  }

  hideParent = () => {
    if (!this.props.visible) {
      const elements = document.getElementById('container');
      elements.className = 'c7n-sidebar-hidden';
    }
  };
  render() {
    const pageStyle = classNames({
      'c7n-region': true,
      'c7n-sidebar-container': true,
    });
    return (
      <div id="container" className="c7n-sidebar-container">
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <QueueAnim
            duration={150}
            type={['alpha']}
          >
            {this.props.visible ?
              <div key="left" className="c7n-left-Wrapper" /> : null}
          </QueueAnim>
          <QueueAnim
            duration={200}
            type={['right', 'left', 'alpha']}
            onEnd={this.hideParent}
          >
            {this.props.visible ?
              <div className={pageStyle} key="demo">
                {this.header}
                {this.content}
                {this.footer}
              </div> : null}
          </QueueAnim>
        </div>

      </div>);
  }
}

export default Sidebar;
