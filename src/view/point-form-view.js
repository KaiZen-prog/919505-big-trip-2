import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import {humanizePointDateTime} from '../utils/dates';
import {BLANK_POINT, POINT_TYPES} from '../const';
import flatpickr from 'flatpickr';

import 'flatpickr/dist/flatpickr.min.css';

const ResetButtonTitle = {
  CANCEL: 'Cancel',
  DELETE: 'Delete',
};

function createPointTypeItem(pointId, pointType, currentPointType) {
  const isChecked = pointType === currentPointType ? 'checked' : '';
  const labelTitle = pointType[0].toUpperCase() + pointType.slice(1);
  return (
    `<div class="event__type-item">
      <input id="event-type-${pointType}-${pointId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value=${pointType} ${isChecked}>
      <label class="event__type-label  event__type-label--${pointType}" for="event-type-${pointType}-${pointId}">${labelTitle}</label>
    </div>`
  );
}

function createDestinationItem(destination) {
  return (
    `<option value=${destination}>
     </option>`
  );
}

function createRollupItem() {
  return (
    `<button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>`
  );
}

function createOffer(offer, checkedOffers, pointId) {
  const {id, title, price} = offer;
  let isChecked = '';

  if (checkedOffers && checkedOffers.includes(offer.id)) {
    isChecked = 'checked';
  }

  return (
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${pointId}-${id}" type="checkbox" name="event-offer-${title}" data-offer-id=${id} ${isChecked}>
      <label class="event__offer-label" for="event-offer-${pointId}-${id}">
        <span class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </label>
    </div>`
  );
}

function createPhotoItem(photo) {
  const {description, src} = photo;
  return (
    `<img class="event__photo" src=${src} alt=${description.replaceAll(' ', '&nbsp;')}/>`
  );
}

function createOffersSection(offers, checkedOffers, pointId) {
  const offersTemplate = offers.map((offer) => createOffer(offer, checkedOffers, pointId)).join('');

  return (
    `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>

      <div class="event__available-offers">
        ${offersTemplate}
      </div>
    </section>`
  );
}

function createDescriptionParagraph(description) {
  return (
    `<p class="event__destination-description">${description}</p>`
  );
}

function createPhotosContainer(photosTemplate) {
  return (
    `<div class="event__photos-container">
      <div class="event__photos-tape">
        ${photosTemplate}
      </div>
    </div>`
  );
}

function createDestinationSection(currentDestinationObject) {
  let descriptionParagraphTemplate = '';
  let photosContainerTemplate = '';

  if (currentDestinationObject.description) {
    descriptionParagraphTemplate = createDescriptionParagraph(currentDestinationObject.description);
  }

  if (currentDestinationObject.pictures.length > 0) {
    const photosTemplate = currentDestinationObject.pictures.map((picture) => createPhotoItem(picture)).join('');
    photosContainerTemplate = createPhotosContainer(photosTemplate);
  }

  return (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      ${descriptionParagraphTemplate}
      ${photosContainerTemplate}
    </section>`
  );
}

function createDetailsSection(currentOffersObject, pointId, checkedOffers, currentDestinationObject) {
  let offersSectionTemplate = '';
  let destinationSectionTemplate = '';

  // Рендерим секцию офферов только если они есть в модели для данного destination
  if (currentOffersObject) {
    offersSectionTemplate = createOffersSection(currentOffersObject.offers, checkedOffers, pointId);
  }

  // Рендерим секцию event__section--destination только если есть описание или картинки
  if (currentDestinationObject.description || currentDestinationObject.pictures.length > 0) {
    destinationSectionTemplate = createDestinationSection(currentDestinationObject);
  }

  return (
    `<section class="event__details">
      ${offersSectionTemplate}
      ${destinationSectionTemplate}
    </section>`
  );
}

function createPointFormTemplate(point, offers, destinations) {
  const {id, type, destination, dateFrom, dateTo, basePrice} = point;
  let detailsSectionTemplate = '';
  let destinationName = '';

  const currentOffersObject = offers.find((offer) => offer.type === type);
  const currentDestinationObject = destinations.find((value) => value.id === destination);

  if (currentDestinationObject) {
    destinationName = currentDestinationObject.name;

    // Рендерим секцию event__details только если для выбранного destination есть офферы или описание или картинки
    if (currentOffersObject || currentDestinationObject.description || currentDestinationObject.pictures.length > 0) {
      detailsSectionTemplate = createDetailsSection(currentOffersObject, point.id, point.offers, currentDestinationObject);
    }
  }

  const rollupTemplate = point.id ? createRollupItem() : '';

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${POINT_TYPES.map((pointType) => createPointTypeItem(point.id, pointType, point.type)).join('')}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-${id}">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${destinationName}" list="destination-list-${id}">
            <datalist id="destination-list-${id}">
              ${destinations.map((value) => createDestinationItem(value.name)).join('')}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${id}">From</label>
            <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value=${dateFrom === '' ? '' : humanizePointDateTime(point.dateFrom)}>
            &mdash;
            <label class="visually-hidden" for="event-end-time-${id}">To</label>
            <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value=${dateTo === '' ? '' : humanizePointDateTime(point.dateTo)}>
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${id}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value=${basePrice}>
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${id ? ResetButtonTitle.DELETE : ResetButtonTitle.CANCEL}</button>
          ${rollupTemplate}
        </header>
        ${detailsSectionTemplate}
      </form>
    </li>`
  );
}

export default class PointFormView extends AbstractStatefulView {
  #offers = [];
  #destinations = [];
  #datepickerFrom = null;
  #datepickerTo = null;
  #handleCloseButtonClick = () => {};
  #handleFormSubmit = () => {};

  constructor({offers, destinations, onCloseButtonClick, onFormSubmit, point = BLANK_POINT}) {
    super();
    this.#offers = offers;
    this.#destinations = destinations;
    this._setState(PointFormView.parsePropsToState(point));
    this.#handleCloseButtonClick = onCloseButtonClick;
    this.#handleFormSubmit = onFormSubmit;

    this._restoreHandlers();
  }

  // Перегружаем метод родителя removeElement,
  // чтобы при удалении удалялся более не нужный календарь
  removeElement() {
    super.removeElement();
    this.#destroyDatePicker(this.#datepickerFrom);
    this.#destroyDatePicker(this.#datepickerTo);
  }

  reset(point) {
    this.updateElement(
      PointFormView.parsePropsToState(point),
    );
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn')?.addEventListener('click', this.#closeButtonClickHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#pointTypeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#pointDestinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#pointPriceChangeHandler);
    this.element.querySelector('.event__available-offers')?.addEventListener('change', this.#pointOfferChangeHandler);
    this.element.querySelector('.event--edit').addEventListener('submit', this.#formSubmitHandler);

    this.#setDatepicker();
  }

  get template() {
    return createPointFormTemplate(this._state, this.#offers, this.#destinations);
  }

  #destroyDatePicker(datePicker) {
    if (datePicker) {
      datePicker.destroy();
      datePicker = null;
    }
  }

  #closeButtonClickHandler = () => {
    this.#handleCloseButtonClick();
  };

  #pointTypeChangeHandler = (evt) => {
    this.updateElement({type: evt.target.value, offers: []});
  };

  #pointDestinationChangeHandler = (evt) => {
    const value = evt.target.value;
    const newDestination = this.#destinations.find((destination) => destination.name === value);

    this._setState({destination: newDestination ? newDestination.id : this._state.destination});

    this.element.addEventListener('click', (innerEvent) => {
      if (innerEvent.target.type !== 'submit' && this.element.parentElement) {
        this.updateElement(this._state);
      }
    }, {once: true});
  };

  #pointPriceChangeHandler = (evt) => {
    this.updateElement({basePrice: evt.target.value});
  };

  #pointOfferChangeHandler = (evt) => {
    let currentOffers = [...this._state.offers];

    if (evt.target.checked) {
      currentOffers.push(evt.target.dataset.offerId);
    } else {
      currentOffers = currentOffers.filter((offer) => offer !== evt.target.dataset.offerId);
    }

    this.updateElement({offers: currentOffers});
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(PointFormView.parseStateToPoint(this._state));
  };

  #dateFromChangeHandler = ([userDate]) => {
    this.updateElement({dateFrom: userDate});
    this.#datepickerTo.set('minDate', this._state.dateFrom);
  };

  #dateToChangeHandler = ([userDate]) => {
    this.updateElement({dateTo: userDate});
    this.#datepickerFrom.set('maxDate', this._state.dateTo);
  };

  #setDatepicker() {
    const [dateFromInputElement, dateToInputElement] = this.element.querySelectorAll('.event__input--time');

    const config = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      locale: {firstDayOfWeek: 1},
      'time_24hr': true
    };

    this.#datepickerFrom = flatpickr(
      dateFromInputElement,
      {
        ...config,
        defaultDate: this._state.dateFrom,
        onClose: this.#dateFromChangeHandler,
        maxDate: this._state.dateTo
      },
    );

    this.#datepickerTo = flatpickr(
      dateToInputElement,
      {
        ...config,
        defaultDate: this._state.dateTo,
        onClose: this.#dateToChangeHandler,
        minDate: this._state.dateFrom
      },
    );
  }

  static parsePropsToState(point) {
    return {...point};
  }

  static parseStateToPoint(state) {
    return {...state};
  }
}
