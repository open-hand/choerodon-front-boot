import React, { Component, createElement } from 'react';
import { Button, Col, Icon, Row, Spin, Switch } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Page from '../page';
import Dragact from './dragact/dragact';
import Header from '../page/Header';
import Content from '../page/Content';
import './style';
import asyncRouter from '../util/asyncRouter';
import asyncLocaleProvider from '../util/asyncLocaleProvider';
import CardProvider from './CardProvider';

const cache = {};

function getCachedIntlProvider(key, language, getMessage) {
  if (!cache[key]) {
    cache[key] = asyncLocaleProvider(language, getMessage);
  }
  return cache[key];
}

function getCachedRouter(key, componentImport) {
  if (!cache[key]) {
    cache[key] = asyncRouter(componentImport);
  }
  return cache[key];
}
const PREFIX_CLS = 'c7n-boot-dashboard';

const getblockStyle = isDragging => ({
  background: isDragging ? 'rgba(255,255,255,0.60)' : '#fff',
});

@inject('DashboardStore', 'AppState')
@injectIntl
@observer
export default class Dashboard extends Component {
  dragactNode;

  state = {
    screenWidth: 1366,
  };

  fetchData = () => {
    this.props.DashboardStore.loadDashboardData();
  };


  componentWillMount() {
    this.fetchData();
    this.onResizeWindow();
    window.addEventListener('resize', this.onResizeWindow);
  }

  componentWillReceiveProps() {
    this.fetchData();
  }

  shouldComponentUpdate() {
    const { DashboardStore: { getDashboardData: items } } = this.props;
    return items.length !== 0;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResizeWindow);
  }

  handleOnDragEnd = () => {
    const { AppState, DashboardStore } = this.props;
    const { currentMenuType: { id = '0', type = 'site' } } = AppState;
    const newLayout = this.dragactNode.getLayout();
    const parsedLayout = JSON.stringify(newLayout);
    localStorage.setItem('layout', parsedLayout);
    DashboardStore.setDashboardData(newLayout, type, id);
  };

  handleCancel = () => {
    this.props.DashboardStore.resetDashboardData();
  };

  handleSave = () => {
    this.props.DashboardStore.updateDashboardData();
  }

  renderHeader(editing) {
    return (
      <Header
        className={`${PREFIX_CLS}-header`}
        title={[
          <Icon type="home" key="icon" />,
          <FormattedMessage id="boot.dashboard.home" key="title" />,
        ]}
      >
        {
          editing ? (
            <React.Fragment>
              <Button
                icon="check"
                className={`${PREFIX_CLS}-header-button`}
                onClick={() => this.handleSave()}
              >
                <FormattedMessage id="boot.dashboard.complete" />
              </Button>
              <Button
                icon="close"
                className={`${PREFIX_CLS}-header-button`}
                onClick={() => this.handleCancel()}
              >
                <FormattedMessage id="boot.cancel" />
              </Button>
            </React.Fragment>
          ) : (
            <Button
              icon="mode_edit"
              className={`${PREFIX_CLS}-header-button`}
              onClick={() => this.handleEdit()}
            >
              <FormattedMessage id="boot.dashboard.customize" />
            </Button>
          )
        }
      </Header>
    );
  }

  handleEdit = () => {
    this.props.DashboardStore.setEditing(true);
  };

  onResizeWindow = () => {
    const newWidth = document.body.clientWidth - 40;
    const { screenWidth } = this.state;
    if (newWidth !== screenWidth) this.setState({ screenWidth: newWidth });
  };


  renderItem(item) {
    const { AppState, dashboardLocale, dashboardComponents } = this.props;
    const { dashboardCode, dashboardNamespace } = item;
    const language = AppState.currentLanguage;
    const key = `${dashboardNamespace}/${dashboardCode}`;
    const localeKey = `${dashboardNamespace}/${language}`;
    const getMessage = dashboardLocale[localeKey];
    const card = dashboardComponents[key] && createElement(getCachedRouter(`router-${key}`, dashboardComponents[key]));
    if (card && getMessage) {
      const IntlProviderAsync = getCachedIntlProvider(`locale-${localeKey}`, language, getMessage);
      return (
        <IntlProviderAsync key={`${item.key}`}>
          {card}
        </IntlProviderAsync>
      );
    } else return card;
  }

  render() {
    const { screenWidth } = this.state;
    const { DashboardStore: { getDashboardData: items, editing } } = this.props;


    return (
      <Page className="c7n-boot-dashboard">
        {this.renderHeader(editing)}
        <Content className="c7n-boot-dashboard-content">
          {items.length > 0 ? (
            <Dragact
              layout={items} // 必填项
              col={12} // 必填项
              width={screenWidth} // 必填项
              rowHeight={80} // 必填项
              margin={[20, 20]} // 必填项
              className="c7n-boot-dashboard-drag-layout" // 必填项
              style={{ background: '#fff' }} // 非必填项
              ref={(node) => { this.dragactNode = node; }}
              onDragEnd={this.handleOnDragEnd}
              placeholder
            >
              {(item, provided) => (
                <CardProvider>
                  {
                      toolbar => (
                        <div
                          {...provided.props}
                          {...(editing ? provided.dragHandle : null)}
                          style={{
                            ...provided.props.style,
                            ...getblockStyle(provided.isDragging),
                            overflow: 'hidden',
                            cursor: editing ? 'grab' : 'inherit',
                          }}
                          className="c7n-boot-dashboard-card"
                        >
                          <header
                            className="c7n-boot-dashboard-card-title"
                            style={{
                              pointerEvent: editing ? 'none' : '',
                            }}
                          >
                            <h1>
                              <Icon type={item.dashboardIcon} />
                              <span>
                                {item.dashboardTitle}
                              </span>
                              {!editing ? toolbar : null}
                              {editing ? (<Icon type="delete" onClick={this.handleDelete} />) : null}
                            </h1>
                          </header>
                          {/* {provided.isDragging ? '正在抓取' : '停放'} */}
                          <div style={{ pointerEvents: editing ? 'none' : 'all' }}>
                            {this.renderItem(item)}
                          </div>
                          {editing ? (
                            <span
                              {...provided.resizeHandle}
                              style={{
                                position: 'absolute',
                                width: 20,
                                height: 20,
                                right: 4,
                                bottom: 4,
                                cursor: 'se-resize',
                                borderRight: '4px solid rgba(15,15,15,0.2)',
                                borderBottom: '4px solid rgba(15,15,15,0.2)',
                              }}
                            />
                          ) : null}
                        </div>
                      )
                    }
                </CardProvider>
              )}
            </Dragact>
          ) : null}
        </Content>
      </Page>
    );
  }
}
