import { IAppState, ICard, ICardsData, IOrder } from "../types";
import { Model } from "./base/Model";
import { IEvents } from "./base/events";

export class CardData extends Model<ICard> {

    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;

    // addToBasket(id: string): void {
    //     this.id = id;
    //     this.emitChanges('basket:added', { id: this.id });
    // } -- мб не нужен аргумент?

    addToBasket(): void {
        this.emitChanges('basket:added', { id: this.id });
    }

    isInBasket(): boolean {
        //find?
    }

    // protected _cards: ICard[];
    // protected _preview: string | null;
    // protected events: IEvents;

    // set cards(cards:ICard[]) {
    //     this._cards = cards;
    //     this.events.emit('cards:changed')
    // }

    // get cards() {
    //     return this._cards;
    // }

    // getCard(cardId: string) {
    //     return this._cards.find((item) => item.id === cardId)
    // }

    // set preview(cardId: string | null) {
    //     if (!cardId) {
    //         this._preview = null;
    //         return;
    //     }
    //     const selectedCard = this.getCard(cardId);
    //     if (selectedCard) {
    //         this._preview = cardId;
    //         this.events.emit('card:selected')
    //     }
    // }

    // get preview () {
    //     return this._preview;
    // }
}

export class AppState extends Model<IAppState> {
    basket: string[];
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

    clearBasket() {
        this.order.items = [];
        this.emitChanges('basket:changed', { items: this.order.items });
    }

    getTotalPrice() {
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setCatalog(items: ICard[]) { /////////////////////////???????????????????????
        this.catalog = items.map(item => new CardData(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: LotItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    getActiveLots(): LotItem[] {
        return this.catalog
            .filter(item => item.status === 'active' && item.isParticipate);
    }

    getClosedLots(): LotItem[] {
        return this.catalog
            .filter(item => item.status === 'closed' && item.isMyBid)
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}