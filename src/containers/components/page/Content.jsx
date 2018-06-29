import React, { Component } from 'react';
import classNames from 'classnames';
import { Icon } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { inject, observer } from "mobx-react";

@inject('AppState')
@observer
class PageContent extends Component {
  render() {
    const props = this.props;
    const classString = classNames('page-content', props.className);
    let { title, description, link, children, style, code } = props;
    if (code) {
      const { intl, AppState, values } = props;
      const { name = `${process.env.HEADER_TITLE_NAME || 'Choerodon'}` } = AppState.currentMenuType;
      const { messages } = intl;
      title = intl.formatMessage({id: `${code}.title`}, values || {name});
      description = intl.formatMessage({id: `${code}.description`});
      if (messages[`${code}.link`]) {
        link = intl.formatMessage({id: `${code}.link`});
      }
    }
    return (
      <div className={classString} style={style}>
        {code || title || description ? (
          <div className="page-content-header">
            <div className="title">{title}</div>
            <div className="description">
              {description}
              {link && <a href={link} target="_blank"><FormattedMessage id="learnmore" defaultMessage="了解更多" /><Icon type="open_in_new" /></a>}
            </div>
          </div>) : null}
        {children}
      </div>
    );
  }
}

export default injectIntl(PageContent);
