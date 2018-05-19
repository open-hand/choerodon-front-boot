import React from 'react';
import {
  Route,
  Switch
} from 'react-router-dom'
import nomatch from 'nomatch';
import asyncRouter from '../../util/asyncRouter'

const Home = asyncRouter(() => import('Home'))
{{asyncRoutes}}

function AutoRouter() {
  return (
      <Switch>
        <Route exact path='/' component={Home}/>
        {{routes}}
        <Route path={'*'} component={nomatch} />
      </Switch>
  );
}

export default AutoRouter;
