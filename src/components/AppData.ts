import { IAppState, ICard, ICardsData, IOrder, IOrderContacts, IOrderPaymentAndAddress } from "../types";
import { Model } from "./base/Model";
import { IEvents } from "./base/events";

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

    // isInBasket(id: string): boolean {
    //     return this.order.items.some(item => item === id);
    // }

    // addToBasket(): void {
    //     if (!this.isInBasket(id)) {
    //         this.order.items.push(id);
    //         this.order.totalPrice = this.getTotalPrice();
    //         this.emitChanges('basket:changed', { items: this.order.items });
    //     } else {
    //         this.emitChanges('card:changed');
    //     }
    // }

}

export class AppState extends Model<IAppState> {
    //basket: string[];
    catalog: ICard[];
    loading: boolean;
    order: IOrder = {
        payment: null,
        address: '',
        email: '',
        phone: '',
        items: [],
        totalPrice: 0
    };
    preview: string | null;

    isInBasket(id: string): boolean {
        return this.order.items.some(item => item === id);
    }

    //пока метод здесь, но может нужно его перенести в Card? View
    addToBasket(id: string): void {
        if (!this.isInBasket(id)) {
            this.order.items.push(id);
            this.order.totalPrice = this.getTotalPrice();
            this.emitChanges('basket:changed', { items: this.order.items });
        } else {
            this.emitChanges('preview:changed', { card: this.getCard(id) });
        }
    }

    removeFromBasket(id: string): void {
        this.order.items.filter(item => item !== id);
        this.emitChanges('basket:changed', { items: this.order.items });
    }

    clearBasket() {
        this.order.items = [];
        this.emitChanges('basket:changed', { items: this.order.items });
    }

    getTotalPrice() {
        return this.order.items.reduce((a, c) => {
            const item = this.catalog.find(it => it.id === c);
            const itemPrice = item && item.price !== null ? item.price : 0;
            return a + itemPrice;
        }, 0);
    }

    getCards(): ICard[] {
        return this.catalog;
    }

    // getOrderCards(): ICard[] {
    //     return this.order.items.map(item => this.getCard(item));
    // }

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

    setPaymentAndAddressField(data: IOrderPaymentAndAddress) {
        this.order.payment = data.payment;
        this.order.address = data.address;

        this.events.emit('payment:ready', this.order);
    }

    setContactsField(data: IOrderContacts) {
        this.order.email = data.phone;
        this.order.phone = data.phone;

        this.events.emit('order:ready', this.order);
    }
}