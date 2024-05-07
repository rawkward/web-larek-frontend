import { IOrderPayment } from "../types";
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
            events.emit('order:payment:change', { payment: 'card' });
        });

        this._buttonCash.addEventListener('click', () => {
            events.emit('order:payment:change', { payment: 'cash' });
        });
    }

    set payment(item: string | null) {
        if (item) {
            if (item === 'card') this.setDisabled(this._buttonCard, true);
            if (item === 'cash') this.setDisabled(this._buttonCash, true);
        } else {
            this.setDisabled(this._buttonCard, false);
            this.setDisabled(this._buttonCash, false);
        }
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}