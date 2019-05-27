import { action, computed, observable } from 'mobx';

class GuideStore {
  @observable currentGuideComponent = false;

  @observable currentStep = 0;

  @observable loading = observable.map();

  @computed get getCurrentGuideComponent() {
    return this.currentGuideComponent;
  }

  @action setCurrentGuideComponent(data) {
    this.currentGuideComponent = data;
  }

  @computed get getCurrentStep() {
    return this.currentStep;
  }

  @action setCurrentStep(step) {
    this.currentStep = step;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action setLoading(current) {
    this.loading.set(current, false);
  }

  @action addCurrentStep() {
    this.currentStep += 1;
  }
}

const introStore = new GuideStore();

export default introStore;
