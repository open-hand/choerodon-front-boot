import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Icon } from 'choerodon-ui';
import './index.scss';
import NavBar from '../../../src/containers/components/dashboard/Navbar';

export default class Announcement extends Component {
  render() {
    return (
      <div className="c7n-iam-dashboard-announcement">
        <ul>
          <li>
            <Icon type="volume_up" />
            <a target="choerodon" href="http://choerodon.io/zh/docs/release-notes/changelog_v0.8/">
              <FormattedMessage id="announcement.item.01" />
            </a>
          </li>
          <li>
            <Icon type="volume_up" />
            <a target="choerodon" href="http://choerodon.io/zh/docs/release-notes/changelog_v0.7/">
              <FormattedMessage id="announcement.item.02" />
            </a>
          </li>
          <li>
            <Icon type="volume_up" />
            <a target="choerodon" href="http://choerodon.io/zh/docs/release-notes/changelog_v0.6/">
              <FormattedMessage id="announcement.item.03" />
            </a>
          </li>
        </ul>
        <NavBar>
          <a target="choerodon" href="http://choerodon.io/zh/docs/release-notes/">
            <FormattedMessage id="announcement.redirect" />
          </a>
        </NavBar>
      </div>
    );
  }
}
