import AbstractView from '../framework/view/abstract-view.js';
import {humanizePointDateTime} from '../utils/dates';
import {POINT_TYPES} from '../const';

const ResetButtonTitle = {
  CANCEL: 'Cancel',
  DELETE: 'Delete',
};

function createPointTypeItem(pointId, pointType, currentPointType) {
  const isChecked = pointType === currentPointType ? 'checked' : '';
  return (
    `<div class="event__type-item">
      <input id="event-type-${pointType}-${pointId}" class="event__type-input  visually-hidden" type="radio" name="event-type" ${isChecked}>
      <label class="event__type-label  event__type-label--${pointType}" for="event-type-${pointType}-${pointId}">${pointType}</label>
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
  const isChecked = checkedOffers.includes(offer.id) ? 'checked' : '';

  return (
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${pointId}-${id}" type="checkbox" name="event-offer-${title}" ${isChecked}>
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

function createDetailsSection(offers, pointId, checkedOffers, currentDestinationObject) {
  let offersSectionTemplate = '';
  let destinationSectionTemplate = '';

  // Рендерим секцию офферов только если они есть в модели для данного destination
  if (offers.length) {
    offersSectionTemplate = createOffersSection(offers, checkedOffers, pointId);
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

  const currentDestinationObject = destinations.find((value) => value.id === destination);

  if (currentDestinationObject) {
    destinationName = currentDestinationObject.name;

    // Рендерим секцию event__details только если для выбранного destination есть офферы или описание или картинки
    if (offers.length || currentDestinationObject.description || currentDestinationObject.pictures.length > 0) {
      detailsSectionTemplate = createDetailsSection(offers, id, point.offers, currentDestinationObject);
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
                ${POINT_TYPES.map((pointType) => createPointTypeItem(id, pointType, type)).join('')}
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
            <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value=${dateFrom === '' ? '' : humanizePointDateTime(dateFrom)}>
            &mdash;
            <label class="visually-hidden" for="event-end-time-${id}">To</label>
            <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value=${dateTo === '' ? '' : humanizePointDateTime(dateTo)}>
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${id}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value=${basePrice}>
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${point.id ? ResetButtonTitle.DELETE : ResetButtonTitle.CANCEL}</button>
          ${rollupTemplate}
        </header>
        ${detailsSectionTemplate}
      </form>
    </li>`
  );
}

export default class PointFormView extends AbstractView {
  #point = null;
  #offers = [];
  #destinations = null;
  #handleCloseButtonClick = () => {};
  #handleFormSubmit = () => {};

  constructor({point, offers, destinations, onCloseButtonClick, onFormSubmit}) {
    super();
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleCloseButtonClick = onCloseButtonClick;
    this.#handleFormSubmit = onFormSubmit;

    const rollupButtonElement = this.element.querySelector('.event__rollup-btn');

    if (rollupButtonElement) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeButtonClickHandler);
    }

    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
  }

  get template() {
    return createPointFormTemplate(this.#point, this.#offers, this.#destinations);
  }

  #closeButtonClickHandler = () => {
    this.#handleCloseButtonClick();
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(this.#point);
  };
}
