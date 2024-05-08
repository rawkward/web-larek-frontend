import { FormErrors, IAppState, ICard, ICardsData, IOrder, IOrderContacts, IOrderPayment } from "../types";
import { Model } from "./base/Model";

export type CatalogChangeEvent = {
    catalog: ICard[];
};

export class CardData extends Model<ICard> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export class AppState extends Model<IAppState> {
    catalog: ICard[];
    order: IOrder = {
        payment: null,
        address: '',
        email: '',
        phone: '',
        items: [],
        total: 0
    };
    preview: string | null;
    formErrors: FormErrors = {};


    isInBasket(id: string): boolean {
        return this.order.items.some(item => item === id);
    }

    addToBasket(id: string): void {
        if (!this.isInBasket(id)) {
            this.order.items.push(id);
            this.order.total = this.getTotal();
            this.emitChanges('basket:changed', { items: this.order.items });
        } else {
            this.emitChanges('preview:changed', { card: this.getCard(id) });
        }
    }

    removeFromBasket(id: string): void {
        this.order.items = this.order.items.filter(item => item !== id);
        this.order.total = this.getTotal();
        this.emitChanges('basket:changed', { items: this.order.items });
    }

    clearBasket() {
        this.order.items = [];
        this.order.total = 0;
        this.emitChanges('basket:changed', { items: this.order.items });
    }

    clearOrder() {
		this.order.payment = null;
        this.order.address = '';
        this.order.email = '';
        this.order.phone = '';
        this.emitChanges('payment:changed', { payment: this.order.payment });
	}

    getTotal() {
        return this.order.items.reduce((a, c) => {
            const item = this.catalog.find(it => it.id === c);
            const itemPrice = item && item.price !== null ? item.price : 0;
            return a + itemPrice;
        }, 0);
    }

    getCards(): ICard[] {
        return this.catalog;
    }

    get basketCards(): ICard[] {
        return this.order.items.map(item => this.getCard(item));
    }

    getCard(id: string) {
        return this.catalog.find(card => card.id === id);
    }

    setCatalog(items: ICard[]) { 
        this.catalog = items.map(item => new CardData(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ICard) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }


    // ----------------- Поля формы с оплатой и адресом -----------------

    setPaymentField(value: 'card' | 'cash') {
        this.order.payment = value;
        this.emitChanges('payment:changed', { payment: value });

        if (this.validatePayment()) {
            this.events.emit('payment:ready', this.order);
        }
    }

    setAddressField(field: keyof IOrderPayment, value: string) {
        this.order[field] = value;

        if (this.validatePayment()) {
            this.events.emit('payment:ready', this.order);
        }
    }

    validatePayment() {
        const errors: typeof this.formErrors = {};
        if (!this.order.payment) {
            errors.payment = 'Необходимо выбрать способ оплаты';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес доставки';
        }
        this.formErrors = errors;
        this.events.emit('paymentErrors:changed', this.formErrors);
        return Object.keys(errors).length === 0;
    }


    // ----------------- Поля формы с почтой и телефоном -----------------
    setContactsField(field: keyof IOrderContacts, value: string) {
        this.order[field] = value;

        if (this.validateContacts()) {
            this.events.emit('contacts:ready', this.order);
        }
    }

    validateContacts() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('contactsErrors:changed', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}