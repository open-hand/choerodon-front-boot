import React, { Component, createElement } from 'react';
import { Button, Col, Icon, Row, Spin, Modal, Menu } from 'choerodon-ui';
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

const { Item } = Menu;

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
    DashboardStore.saveDashboardLaydout(newLayout, type, id);
  };

  handleCancel = () => {
    this.props.DashboardStore.resetDashboardData();
  };

  handleSave = () => {
    this.props.DashboardStore.updateDashboardData();
  };

  handleReset = () => {
    this.props.DashboardStore.resetDashboard();
  };

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
              <Button
                icon="compare_arrows"
                className={`${PREFIX_CLS}-header-button`}
                onClick={() => this.handleReset()}
              >
                <FormattedMessage id="boot.reset" />
              </Button>
              <Button
                icon="playlist_add"
                className={`${PREFIX_CLS}-header-button`}
                onClick={() => this.props.DashboardStore.setModalVisible(true)}
              >
                <FormattedMessage id="boot.append" />
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

  handleDelete = (id) => {
    this.props.DashboardStore.setCardVisibleById(id, false);
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

  renderPreviewItem(item) {
    const { AppState, dashboardLocale, dashboardComponents } = this.props;
    const { dashboardCode, dashboardNamespace } = item;
    const language = AppState.currentLanguage;
    const key = `${dashboardNamespace}/${dashboardCode}`;
    const localeKey = `${dashboardNamespace}/${language}`;
    const getMessage = dashboardLocale[localeKey];
    const card = dashboardComponents[key] && createElement(getCachedRouter(`router-${key}`, dashboardComponents[key]));
    let content;
    if (card && getMessage) {
      const IntlProviderAsync = getCachedIntlProvider(`locale-${localeKey}`, language, getMessage);
      content = (
        <IntlProviderAsync key={`${item.key}`}>
          {card}
        </IntlProviderAsync>
      );
    } else {
      content = card;
    }
    return (
      <CardProvider>
        {
          toolbar => (
            <div
              style={{ width: 433, height: 267, top: -77, left: -105, transform: 'scale(0.3)', overflow: 'hidden', pointerEvents: 'none', position: 'absolute' }}
              className="c7n-boot-dashboard-card"
            >
              <header
                className="c7n-boot-dashboard-card-title"
              >
                <h1>
                  <Icon type={item.dashboardIcon} />
                  <span>
                    {item.dashboardTitle}
                  </span>
                  {toolbar}
                </h1>
              </header>
              {/* {provided.isDragging ? '正在抓取' : '停放'} */}
              <div>
                {content}
              </div>
            </div>
          )
        }
      </CardProvider>
    );
  }

  handleSelectCard = (e) => {
    this.selectedCard = e.key;
  };

  handleCreate = (e) => {
    if (this.selectedCard && this.selectedCard !== -1) {
      this.props.DashboardStore.setCardVisibleById(this.selectedCard, true);
      this.props.DashboardStore.setModalVisible(false);
    }
    this.selectedCard = null;
  };

  renderModalContent() {
    const { DashboardStore: { getHiddenDashboardData: items, editing, creating, visible }, intl } = this.props;

    return (
      <Menu
        mode="inline"
        className="c7n-boot-dashboard-preview"
        onClick={this.handleSelectCard}
      >
        {items.length > 0 ? items.map(item => (
          <Item style={{ height: 112 }} key={item.id}>
            <div className="info">
              <div className="title">{item.dashboardTitle}</div>
              <p className="description">{item.dashboardDescription}</p>
              <Icon type="check_circle" />
            </div>
            {this.renderPreviewItem(item)}
          </Item>
        )) : (
          <Item style={{ height: 112, textAlign: 'center', marginTop: 30, color: 'rgba(0,0,0,0.54)', background: '#fff' }} key={-1}>
          暂无可添加的卡片
          </Item>
        )}
      </Menu>
    );
  }

  render() {
    const { screenWidth } = this.state;
    const { DashboardStore: { getDashboardData: items, editing, creating, visible, loading }, intl } = this.props;


    return (
      <Page className="c7n-boot-dashboard">
        {this.renderHeader(editing)}
        <Content className="c7n-boot-dashboard-content">
          <Spin spinning={loading}>
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
                              {editing ? (<Icon type="delete" onClick={() => this.handleDelete(item.id)} />) : null}
                            </h1>
                          </header>
                          {/* {provided.isDragging ? '正在抓取' : '停放'} */}
                          <div style={{ pointerEvents: editing ? 'none' : 'all', height: '100%' }}>
                            {this.renderItem(item)}
                          </div>
                          {editing ? (
                            <Icon
                              type="call_made"
                              {...provided.resizeHandle}
                              style={{
                                position: 'absolute',
                                right: 6,
                                bottom: 6,
                                fontSize: 12,
                                cursor: 'se-resize',
                                color: 'rgba(0,0,0,0.54)',
                                transform: 'rotate(90deg)',
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
            <Modal
              bodyStyle={{ height: '500px', overflowX: 'hidden' }}
              title="添加卡片"
              visible={visible}
              closable={false}
              width={600}
              className="c7n-boot-dashboard-create"
            // maskClosable={!APITestStore.modalSaving}
              onCancel={() => { this.props.DashboardStore.setModalVisible(false); }}
              onOk={this.handleCreate}
              okText={intl.formatMessage({ id: 'boot.append' })}
            >
              {this.renderModalContent()}
            </Modal>
          </Spin>
        </Content>
      </Page>
    );
  }
}
