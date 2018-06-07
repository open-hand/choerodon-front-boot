import React, { Component } from 'react';
import { Button } from 'choerodon-ui';
import img from './style/404.png';

class nomatch extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  Linkto() {
    const { history } = this.props;
    history.push('/');
  }

  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        <img
          style={{
            width: '420px',
            height: '420px',
            position: 'absolute',
            top: '10rem',
            left: '10%',
          }}
          src={img}
          alt=""
        />
        <div
          style={{
            position: 'absolute',
            top: '15rem',
            left: '50%',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              color: '#3F51B5',
            }}
          >404</h1>
          <p
            style={{
              fontSize: '18px',
              marginTop: '2rem',
            }}
          >抱歉，你访问的页面不存在</p>
          <Button funcType="raised" type="primary" icon="save" onClick={this.Linkto.bind(this)}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }
}

export default nomatch;
