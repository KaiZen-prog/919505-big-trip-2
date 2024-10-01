import {render} from '../render';
import HeaderContainerView from '../view/header-container-view';
import TripInfoWrapperView from '../view/trip-info-wrapper-view';
import TripInfoView from '../view/trip-info-view';
import PointSortingPanelView from '../view/point-sorting-panel-view';
import AddPointButtonView from '../view/add-point-button-view';

export default class HeaderPresenter {
  headerContainerView = new HeaderContainerView();
  tripInfoWrapper = new TripInfoWrapperView();

  constructor(headerElement) {
    this.headerElement = headerElement;
  }

  init() {
    render(this.headerContainerView, this.headerElement);
    render(this.tripInfoWrapper, this.headerContainerView.getElement());
    render(new TripInfoView(), this.tripInfoWrapper.getElement());
    render(new PointSortingPanelView(), this.tripInfoWrapper.getElement());
    render(new AddPointButtonView(), this.tripInfoWrapper.getElement());
  }
}
