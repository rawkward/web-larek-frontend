import { EventEmitter, IEvents } from './components/base/events';
import { AppState, CardData, CatalogChangeEvent } from './components/AppData';
import './scss/styles.scss';
import { LarekAPI } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Page } from './components/Page';
import { BasketCard, Card, CatalogCard, PreviewCard } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/Modal';
import { ICard, IOrderContacts, IOrderPayment } from './types';
import { Basket } from './components/Basket';
import { OrderPaymentForm } from './components/Order';


// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');

const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const orderTemplate = ensureElement<HTMLTemplateElement>('#order');


// Экземпляры
const events = new EventEmitter();

const api = new LarekAPI(CDN_URL, API_URL);

const appData = new AppState({}, events);

const page = new Page(document.body, events)

const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);

const order = new OrderPaymentForm(cloneTemplate(orderTemplate), events);

events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// отладка

// Presenter

// отображение каталога
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new CatalogCard(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            description: item.description,
            category: item.category,
            price: item.price,
        });
    });

    page.counter = appData.order.items.length;
});

// выбрана карточка товара
events.on('card:select', (item: ICard) => {
    appData.setPreview(item);
});

events.on('preview:changed', (item: ICard) => {
    const showCard = (item: ICard) => {
        const card = new PreviewCard(cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                appData.addToBasket(item.id);
                modal.close();
            }
        });

        if (appData.isInBasket(item.id)) {
            card.setDisabled(card.button, true);
            card.setButtonText('Уже в корзине');
        }
        else {
            card.setDisabled(card.button, false);
            card.setButtonText('В корзину');
        }

        modal.render({
            content: card.render({
                title: item.title,
                description: item.description,
                image: item.image,
                category: item.category,
                price: item.price,
            })
        });
    };

    if (item) {
        api.getProduct(item.id)
            .then((result) => {
                item.id = result.id;
                item.title = result.title;
                item.description = result.description;
                item.image = result.image;
                item.category = result.category;
                item.price = result.price;
                showCard(item);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }
});


// добавление товара в корзину
events.on('basket:changed', () => {
    page.counter = appData.order.items.length;
    basket.items = appData.basketCards.map((item, index) => {
        const card = new BasketCard(cloneTemplate(basketCardTemplate), {
            onClick: () => {
                appData.removeFromBasket(item.id);
                basket.total = appData.getTotal();
            }
        });
        const cardIndex = index + 1;
        return card.render({
            index: cardIndex,
            title: item.title,
            price: item.price,
        });
    });
    basket.total = appData.order.total;
})


// открытие корзины
events.on('basket:open', () => {
    modal.render({
        content: createElement<HTMLElement>('div', {}, basket.render())
    });
});


// переход из корзины в форму оформления заказа
events.on('order:open', () => {
    modal.render({
        content: order.render({
            payment: null,
            address: '',
            valid: false,
            errors: []
        })
    });
});

// Изменилось состояние валидации формы
events.on('paymentErrors:change', (errors: Partial<IOrderPayment>) => {
    const { payment, address } = errors;
    order.valid = !payment && !address;
    order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
});

events.on('contactsErrors:change', (errors: Partial<IOrderContacts>) => {
    const { email, phone } = errors;
    order.valid = !email && !phone;
    order.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on('order:payment:change', (data: { payment: string }) => {
    appData.setPaymentField('payment', data.payment);
});

events.on('order:address:change', (data: { address: string }) => {
    appData.setAddressField('address', data.address);
});

events.on(/^contacts\..*:change/, (data: { field: keyof IOrderContacts, value: string }) => {
    appData.setContactsField(data.field, data.value);
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });

// api.getProductList()
//     .then(data => {
//         console.log(data);
//         appData.setCatalog(data);
//         console.log(appData.getCards());
//         console.log(appData.isInBasket('c101ab44-ed99-4a54-990d-47aa2bb4e7d9'));
//         appData.addToBasket('c101ab44-ed99-4a54-990d-47aa2bb4e7d9');
//         appData.addToBasket('412bcf81-7e75-4e70-bdb9-d3c73c9803b7');
//         appData.addToBasket('b06cde61-912f-4663-9751-09956c0eed67');
//         console.log(appData.isInBasket('c101ab44-ed99-4a54-990d-47aa2bb4e7d9'));
//         console.log(appData.order.items);
//         console.log(appData.gettotal());

//         appData.clearBasket();

//         console.log(appData.isInBasket('c101ab44-ed99-4a54-990d-47aa2bb4e7d9'));
//     })
//     .catch(err => {
//         console.error(err);
//     });
