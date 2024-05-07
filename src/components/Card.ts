import { ICard } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _category?: HTMLElement;
    protected _price: HTMLElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
        this._image = container.querySelector(`.${blockName}__image`);
        this._description = container.querySelector(`.${blockName}__text`);
        this._category = container.querySelector(`.${blockName}__category`);
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set description(value: string) {
        if (Array.isArray(value)) {
            this._description.replaceWith(...value.map(str => {
                const descTemplate = this._description.cloneNode() as HTMLElement;
                this.setText(descTemplate, str);
                return descTemplate;
            }));
        } else {
            this.setText(this._description, value);
        }
    }

    set category(value: string) {
        this._category.textContent = value;
        switch (value) {
            case 'софт-скил':
                this._category.classList.add(`card__category_soft`);
                break;
            case 'другое':
                this._category.classList.add(`card__category_other`);
                break;
            case 'кнопка':
                this._category.classList.add(`card__category_button`);
                break;
            case 'дополнительное':
                this._category.classList.add(`card__category_additional`);
                break;
            case 'хард-скил':
                this._category.classList.add(`card__category_hard`);
                break;
          }
    }

    set price(value: number | null) {
        this._price.textContent = value ? `${value} синапсов` : 'Бесценно';
    }
}


export class PreviewCard extends Card {
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container);
        this._button = ensureElement<HTMLButtonElement>(`.card__button`, container);

        if (actions?.onClick) this._button.addEventListener('click', actions.onClick);
    }

    get button(): HTMLButtonElement {
        return this._button;
    }

    setButtonText(value: string) {
        this._button.textContent = value;
    }
}

export class CatalogCard extends Card {
    protected _button: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);
        this._button = ensureElement<HTMLElement>(container, container);

        if (actions?.onClick) this._button.addEventListener('click', actions.onClick);
    }
}

export class BasketCard extends Card {
    protected _index: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);
        this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);
        this._button = ensureElement<HTMLButtonElement>(`.basket__item-delete`, container);

        if (actions?.onClick) this._button.addEventListener('click', actions.onClick);
    }

    set index(value: number) {
        this._index.textContent = String(value);
    }
}