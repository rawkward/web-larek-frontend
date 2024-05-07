
export interface ICard {
    index?: number;
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IBasket {
    count: number;
    total: number;
    items: string[];
}

export interface IOrderPayment {
    payment: string;
    address: string;
}

export interface IOrderContacts {
    email: string;
    phone: string;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export type IOrder = IOrderPayment & IOrderContacts & Pick<IBasket, 'items' | 'total'>;

export interface IOrderResult {
    id: string;
}

export interface ICardsData {
    cards: ICard[];
    preview: string | null;
}

export interface IAppState extends ICardsData {
    basket: string[];
    order: IOrder | null;
    loading: boolean;
}

//export type TPaymentMethod = 'card' | 'cash' | null;

export type TCardBaseInfo = Pick<ICard, 'id' | 'image' | 'title' | 'category' | 'price'>;

export type TBasketInfo = Pick<IBasket, 'count'>;