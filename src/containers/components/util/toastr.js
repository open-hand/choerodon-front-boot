import { message } from 'choerodon-ui/pro';

const successHandle = (mgs, title, opts) => {
  message.success(mgs);
};

const infoHandle = (mgs, title, opts) => {
  message.info(mgs);
};

const warningHandle = (mgs, title, opts) => {
  message.warning(mgs);
};

const errorHandle = (mgs, title, opts) => {
  message.error(mgs);
};

const handle = (msg, title, opts) => {
  message.config({
    top: 50,
    bottom: 50,
    duration: 2,
  });
  message[opts.type](msg, undefined, undefined, 'rightBottom');
};

const toastr = {
  success: handle,
  info: handle,
  warning: handle,
  error: handle,
};

window.toastr = toastr;

export default toastr;
