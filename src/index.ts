import { EventEmitter, IEvents } from './components/base/EventEmitter';
import { AppState, CardData, CatalogChangeEvent } from './components/AppData';
import './scss/styles.scss';
import { LarekAPI } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Page } from './components/Page';
import { BasketCard, Card, CatalogCard, PreviewCard } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { ICard, IOrderContacts, IOrderPayment } from './types';
import { Basket } from './components/common/Basket';
import { OrderContactsForm, OrderPaymentForm } from './components/Order';
import { OrderSuccess } from './components/common/OrderSuccess';


// ----------------- Шаблоны -----------------
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');

const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const orderSuccessTemplate = ensureElement<HTMLTemplateElement>('#success');


// ----------------- Экземпляры -----------------
const events = new EventEmitter();

const api = new LarekAPI(CDN_URL, API_URL);

const appData = new AppState({}, events);

const page = new Page(document.body, events)

const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);

const orderPayment = new OrderPaymentForm(cloneTemplate(orderTemplate), events);
const orderContacts = new OrderContactsForm(cloneTemplate(contactsTemplate), events);


// ----------------- Отладка -----------------
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})


// Presenter

// ----------------- Отображение каталога -----------------
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

// ----------------- Выбрана карточка товара -----------------
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

        if (item.price === null) {
            card.setDisabled(card.button, true);
            card.setButtonText('Бесценный товар купить нельзя');
        }

        else if (appData.isInBasket(item.id)) {
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


// ----------------- Корзина -----------------

function updateBasketButton(): void {
    if (!appData.order.items.length) basket.setDisabled(basket.button, true);
     else basket.setDisabled(basket.button, false);
}

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
    updateBasketButton();
})


events.on('basket:open', () => {
    updateBasketButton();
    modal.render({
        content: createElement<HTMLElement>('div', {}, basket.render())
    });
});



// ----------------- Форма "оплата и адрес" -----------------
// переход из корзины в форму оформления заказа
events.on('order:open', () => {
    modal.render({
        content: orderPayment.render({
            payment: null,
            address: '',
            valid: false,
            errors: []
        })
    });
});


// Изменилось состояние валидации формы оплаты и адреса
events.on('paymentErrors:changed', (errors: Partial<IOrderPayment>) => {
    const { payment, address } = errors;
    orderPayment.valid = !payment && !address;
    orderPayment.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей в форме с оплатой и адресом
events.on('order:payment:changed', (data: { payment: 'card' | 'cash' }) => {
    appData.setPaymentField(data.payment);
});

events.on('payment:changed', (data: { payment: 'card' | 'cash' | null }) => {
    if (data.payment === 'card') {
        orderPayment.buttonCard.classList.add('button_alt-active');
        orderPayment.buttonCash.classList.remove('button_alt-active');
    } else if (data.payment === 'cash') {
        orderPayment.buttonCard.classList.remove('button_alt-active');
        orderPayment.buttonCash.classList.add('button_alt-active');
    } else {
        orderPayment.buttonCard.classList.remove('button_alt-active');
        orderPayment.buttonCash.classList.remove('button_alt-active');
    }
});

events.on(/^order\..*:changed/, (data: { field: keyof IOrderPayment, value: string }) => {
    appData.setAddressField(data.field, data.value);
});



// ----------------- Форма "Конакты" -----------------

// переход из формы с оплатой и адресом в форму с контактами
events.on('order:submit', () => {
    modal.render({
        content: orderContacts.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
});


// Изменилось состояние валидации формы контактов
events.on('contactsErrors:changed', (errors: Partial<IOrderContacts>) => {
    const { email, phone } = errors;
    orderContacts.valid = !email && !phone;
    orderContacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});


// Изменилось одно из полей формы контактов
events.on(/^contacts\..*:changed/, (data: { field: keyof IOrderContacts, value: string }) => {
    appData.setContactsField(data.field, data.value);
});


// ----------------- Отправка заказа -----------------

events.on('contacts:submit', () => {
    api.orderProducts(appData.order)
        .then(() => {
            const orderSuccess = new OrderSuccess(cloneTemplate(orderSuccessTemplate), {
                onClick: () => modal.close()
            });

            modal.render({
                content: orderSuccess.render({
                    total: appData.order.total,
                })
            });
        })
        .then(() => {
            appData.clearBasket();
            events.emit('basket:changed');
        })
        .catch(err => {
            console.error(err);
        });
});


// Блокируем прокрутку страницы, если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем + очищаем формы
events.on('modal:close', () => {
    page.locked = false;
    appData.clearOrder();
});

// Получаем данные с сервера
api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });
