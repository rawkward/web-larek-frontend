import { IOrderContacts, IOrderPayment } from "../types";
import { ensureElement } from "../utils/utils";
import { Form } from "./Form";
import { IEvents } from "./base/events";

export class OrderPaymentForm extends Form<IOrderPayment> {
    protected _buttonCard: HTMLButtonElement;
    protected _buttonCash: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._buttonCard = ensureElement<HTMLButtonElement>(`button[name="card"]`, container);
        this._buttonCash = ensureElement<HTMLButtonElement>(`button[name="cash"]`, container);

        this._buttonCard.addEventListener('click', () => {
            events.emit('order:payment:changed', { payment: 'card' });
        });

        this._buttonCash.addEventListener('click', () => {
            events.emit('order:payment:changed', { payment: 'cash' });
        });
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    get buttonCard(): HTMLButtonElement {
        return this._buttonCard;
    }

    get buttonCash(): HTMLButtonElement {
        return this._buttonCash;
    }
}

export class OrderContactsForm extends Form<IOrderContacts> {

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }
    
    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }
}