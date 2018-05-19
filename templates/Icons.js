{{imports }}
import axios from 'Axios';
import { Observable } from 'rxjs/Observable';

let Icons = {};
const localIcons = Object.assign(Icons, {{defines}});
Observable.fromPromise(axios.get('iam/v1/menus?with_permissions=true&type=menu'))
  .subscribe(value => {
    value.map(data => {
      Icons[data.code] = data.icon
    })
    Icons =  Object.assign(Icons, localIcons);
  });
export default Icons;
