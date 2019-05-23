let serviceModuleManager;

class ServiceModuleManager {
  constructor() {
    this.maps = [];
  }

  set(maps) {
    this.maps = maps;
  }

  get() {
    return this.maps;
  }

  getServiceByModule(module) {
    const index = this.maps.findIndex(o => o.modules && o.modules.includes(module));
    if (index !== -1) {
      return this.maps[index].name;
    }
    return `HAS_NO_MATCHED_SERVICE_OF_${module}`;
  }
}

export default function getServiceModuleManager() {
  if (!serviceModuleManager) {
    serviceModuleManager = new ServiceModuleManager();
  }
  return serviceModuleManager;
}
