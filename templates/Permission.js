{{imports }}

import axios from 'Axios';
import { Observable } from 'rxjs/Observable';

let Permission = {};
const localPermission = Object.assign(Permission, {{defines }});
Observable.fromPromise(axios.get('iam/v1/menus?with_permissions=true&type=menu'))
  .subscribe(value => {
    value.map(data => {
      if(data.permissions && data.permissions.length > 0) {
        const centerPermission = data.permissions.map(value => value.name);
        Permission[data.code] = centerPermission;
      }
    })
    Permission =  Object.assign(Permission, localPermission);
  });


export default Permission;

