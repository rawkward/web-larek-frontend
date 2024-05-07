import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

interface IOrderSuccess {
    total: number;
}

interface IOrderSuccessActions {
    onClick: () => void;
}

export class OrderSuccess extends Component<IOrderSuccess> {
    protected _close: HTMLElement;
    protected _total: HTMLElement;

    constructor(container: HTMLElement, actions: IOrderSuccessActions) {
        super(container);

        this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
        this._total = ensureElement<HTMLElement>('.order-success__description', this.container);

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }

    set total(value: number) {
        this._total.textContent = `Списано ${value} синапсов`;
    }
}