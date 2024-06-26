import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

interface IOrderSuccess {
    total: number;
}

interface IOrderSuccessActions {
    onClick: () => void;
}

export class OrderSuccess extends Component<IOrderSuccess> {
    protected _close: HTMLButtonElement;
    protected _total: HTMLElement;

    constructor(container: HTMLElement, actions: IOrderSuccessActions) {
        super(container);

        this._close = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
        this._total = ensureElement<HTMLElement>('.order-success__description', this.container);

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }

    set total(value: number) {
        this.setText(this._total, `Списано ${value} синапсов`);
    }
}