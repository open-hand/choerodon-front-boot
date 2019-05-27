import context from './context';

export default function getAllSubModuleNames() {
  const { choerodonConfig: { modules } } = context;
  return modules || [];
}
