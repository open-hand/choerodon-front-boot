import React, { Component } from 'react';

const asyncPropsLoader = (Cmp, promise) => (
  class extends Component {
    state = {
      asyncProps: null,
    };

    componentWillMount() {
      promise.then((props) => {
        this.setState({
          asyncProps: props,
        });
      });
    }

    render() {
      const { asyncProps } = this.state;
      return asyncProps ? <Cmp {...this.props} {...asyncProps} /> : null;
    }
  }
);

export default asyncPropsLoader;
