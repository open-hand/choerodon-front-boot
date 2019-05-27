import React, { Component } from 'react';
import classNames from 'classnames';
import { Icon } from 'choerodon-ui';
import { FormattedMessage, injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import { HEADER_TITLE_NAME } from '../../../common/constants';

@injectIntl
@inject('AppState')
@observer
export default class PageContent extends Component {
  render() {
    const { props } = this;
    const { className, code, children, style } = props;
    const classString = classNames('page-content', className);
    let { title, description, link } = props;
    if (code) {
      const { intl, AppState: { currentMenuType }, values } = props;
      const { name = HEADER_TITLE_NAME } = currentMenuType;
      const { messages } = intl;
      title = intl.formatMessage({ id: `${code}.title` }, values || { name });
      description = intl.formatMessage({ id: `${code}.description` }, values);
      if (messages[`${code}.link`]) {
        link = intl.formatMessage({ id: `${code}.link` }, values);
      }
    }
    return (
      <div className={classString} style={style}>
        {
          (code || title || description) && (
            <div className="page-content-header">
              <div className="title">
                {title}
              </div>
              <div className="description">
                {description}
                {
                  link && (
                    <a href={link} target="_blank" rel="noreferrer noopener">
                      <FormattedMessage id="learnmore" defaultMessage="了解更多" />
                      <Icon type="open_in_new" />
                    </a>
                  )
                }
              </div>
            </div>
          )
        }
        {children}
      </div>
    );
  }
}
