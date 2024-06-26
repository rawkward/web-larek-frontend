# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с TS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

### Главная страница

Интерфейс представления главной страницы

```
interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
```


### Товар

Карточка товара

```
interface ICard {
    index?: number;
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}
```

Модель данных карточек

```
interface ICardsData {
    cards: ICard[];
    preview: string | null;
}
```

Интерфейс для действий при клике на кнопку карточки

```
interface ICardActions {
    onClick: (event: MouseEvent) => void;
}
```


### Корзина товаров

Данные корзины

```
interface IBasket {
    count: number;
    total: number;
    items: string[];
}
```

Интерфейс представления корзины

```
interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}
```


### Данные заказа

Данные формы выбора метода оплаты и адреса

```
interface IOrderPayment {
    payment: string;
    address: string;
}
```

Данные формы указания электронной почты и телефона

```
interface IOrderContacts {
    email: string;
    phone: string;
}
```

Состояние формы

```
interface IFormState {
    valid: boolean;
    errors: string[];
}
```

Ошибки форм

```
type FormErrors = Partial<Record<keyof IOrder, string>>;
```

Тип данных заказа

```
type IOrder = IOrderPayment & IOrderContacts & Pick<IBasket, 'items' | 'total'>;
```

Отправленный заказ

```
interface IOrderResult {
    id: string;
}
```


### Успешный заказ

Интерфейс успешного заказ

```
interface IOrderSuccess {
    total: number;
}
```

Интерфейс для действия при клике на кнопку в окне успешного заказа

```
interface IOrderSuccessActions {
    onClick: () => void;
}
```


### Модальное окно

Представление содержимого модального окна

```
interface IModalData {
    content: HTMLElement;
}
```


### Состояние приложения

Интерфейс состояния всего приложения

```
interface IAppState extends ICardsData {
    basket: string[];
    order: IOrder | null;
}
```

Тип данных, который используется для генерации события изменения в каталоге карточек

```
type CatalogChangeEvent = {
    catalog: ICard[];
};
```


### Брокер событий

Тип названия события

```
type EventName = string | RegExp;
```

Коллбэк для обработки события

```
type Subscriber = Function;
```

Тип данных для подписки на все события

```
type EmitterEvent = {
    eventName: string,
    data: unknown
};
```

Интерфейс методов брокера событий

```
interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```


### API

Получаемые с сервера данные о карточках

```
type ApiListResponse<Type> = {
    total: number,
    items: Type[]
};
```

Типы методов API-запросов

```
type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';
```

Интерфейс методов взаимодействия приложения с сервером

```
interface ILarekAPI {
    getProductList: () => Promise<ICard[]>;
    getProduct: (id: string) => Promise<ICard>;
    orderProducts: (order: IOrder) => Promise<IOrderResult>;
}
```


## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице, 
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.


### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов.\
`constructor(baseUrl: string, options: RequestInit = {})`- принимает базовый URL и глобальные опции для всех запросов (опционально).

Методы:
- `protected handleResponse(response: Response): Promise<object>` - обрабатывает полученный с сервера ответ типа Response, возвращая промис с объектом
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс Component
Абстрактный класс представления компонента. Все другие классы представления наследуют этот класс.\
`protected constructor(protected readonly container: HTMLElement)` - конструктор класса принимает данные в виде доступного только для чтения контейнера с типом HTMLElement.\
Класс предоставляет набор методов для взаимодействия с этими данными:
- toggleClass(element: HTMLElement, className: string, force?: boolean) - переключает класс переданного элемента на переданный класс. При добавлении параметра force класс может добавляться или удаляться, независимо от того, есть или был этот класс у элемента
- protected setText(element: HTMLElement, value: unknown) - устанавливает текстовое содержимое переданному элементу на переданное значение
- setDisabled(element: HTMLElement, state: boolean) - переключает статус блокировки у переданного элемента на переданное значение
- protected setHidden(element: HTMLElement) - скрывает переданный элемент
- protected setVisible(element: HTMLElement) - делает переданный элемент видимым
- protected setImage(element: HTMLImageElement, src: string, alt?: string) - устанавливает элементу переданное изображение. Также опционально устанавливает текстовое описание изображения
- render(data?: Partial<T>): HTMLElement - возвращает корневой DOM-элемент

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
`constructor()` - конструктор не принимает никаких параметров.\  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие

#### Класс Model
Абстрактный класс модели данных. Все классы, являющиеся моделями данных, наследуют этот класс.\
`constructor(data: Partial<T>, protected events: IEvents)` - Конструктор класса принимает данные в виде объекта, часть или все свойства которого относятся к обобщенному типу `<T>`, а также инстант брокера событий, который имплементирует интерфейс IEvents.\

Данный класс предоставляет метод:
- emitChanges(event: string, payload?: object) - этот метод сообщает, что модель данных изменилась.


### Слой данных

#### Класс СardData
Класс хранит данные об отдельной карточке товара. В полях класса хранятся следующие данные:
- id: string - id карточки
- description: string - описание карточки
- image: string - ссылка на изображение на карточке
- title: string - название карточки
- category: string - категория (тег) карточки
- price: number | null - цена товара в карточке

#### Класс AppState
Класс отвечает за хранение данных карточек, корзины, заказа, а также о состоянии приложения и форм в модальных окнах. Также класс отвечает за логику работы с этими данными.\
Класс использует родительский конструктор класса Model и принимает инстант брокера событий, который имплементирует интерфейс IEvents.\
В полях класса хранятся следующие данные:
- catalog: ICard[] - массив объектов карточек
- order: IOrder - объект с данными заказа
- preview: string | null; - выбранная пользователем карточка
- formErrors: FormErrors = {}; - объект ошибок в форме
- successModalActive: boolean = false - булево значение, хранящее информацию о том, открыто ли сейчас модальное окно успешного заказа. По умолчанию установлено как false

Класс предоставляет набор методов для взаимодействия с этими данными:
- isInBasket(id: string): boolean - проверяет, добавлена ли карточка с переданным id в корзину
- addToBasket(id: string): void - добавляет карточку с переданным id в корзину
- removeFromBasket(id: string): void - удаляет карточку с переданным id из корзины
- clearBasket() - очищает корзину и обнуляет общую стоимость в корзине
- clearOrder() - удаляет данные из форм
- getTotal() - возвращает общую стоимость товаров в корзине
- getCards(): ICard[] - возвращает массив объектов всех карточек
- геттер get basketCards(): ICard[] - возвращает массив объектов карточек в корзине
- getCard(id: string) - возвращает объект с карточкой, соответствующей переданному id
- setCatalog(items: ICard[]) - создает массив объектов карточек в приложении (каталог карточек)
- setPreview(item: ICard) - устанавливает переданную карточку как выбранную пользователем
- setPaymentField(value: 'card' | 'cash') - добавляет данные о типе оплаты из формы "тип оплаты и адрес" в данные заказа
- setAddressField(field: keyof IOrderPayment, value: string) - добавляет данные об адресе из формы "тип оплаты и адрес" в данные заказа
- validatePayment() - проверяет валидность формы "тип оплаты и адрес"
- setContactsField(field: keyof IOrderContacts, value: string) - добавляет данные из формы "контакты" в данные заказа
- validateContacts() - проверяет валидность формы "контакты"

### Слой представления
Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

#### Класс Page
Класс представления главной страницы. Отвечает за отображение каталога карточек, количества товаров в корзине. Позволяет открывать карточки, корзину, блокирует и разблокирует прокрутку в зависимости от того, открыто ли модальное окно.\
`constructor(container: HTMLElement, protected events: IEvents)` - в конструкторе класс принимает HTML-элемент (контейнер) и инстант брокера событий, который имплементирует интерфейс IEvents.\
Поля класса:
- protected _counter: HTMLElement - счетчик количества товаров в корзине
- protected _catalog: HTMLElement - каталог карточек
- protected _wrapper: HTMLElement - обертка всей главной страницы
- protected _basket: HTMLElement - корзина

Методы класса:
- сеттер set counter(value: number) - устанавливает текстовое значение в счетчике количества товаров в корзине
- сеттер set catalog(items: HTMLElement[]) - помещает массив карточек на главную страницу
- set locked(value: boolean) - блокирует и разблокирует прокрутку страницы

#### Класс Card
Класс отвечает за отображение карточки, задавая в ней данные: название, описание, категория, изображение, цену. На сайте для непосредственно отображения используются классы, которые наследуют этот класс.\
`constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions)` - в конструктор класса передается строка с названием класса блока, HTML-элемент контейнера и опционально коллбэк для взаимодействия с интерактивными элементами карточки, имплементирующий интерфейс ICardActions.\
В классе устанавливаются слушатели на все интерактивные элементы, в результате взаимодействия с которыми пользователя генерируются соответствующие события.\
Поля класса:
- protected _title: HTMLElement - название карточки
- protected _image?: HTMLImageElement - изображение на карточке
- protected _description?: HTMLElement - описание карточки
- protected _category?: HTMLElement - категория карточки
- protected _price: HTMLElement - цена товара на карточке

Методы класса:
- set id(value: string) - присваивает карточке id
- get id(): string - возвращает id карточки
- set title(value: string) - присваивает карточке название
- get title(): string - возвращает строку с названием карточки
- set image(value: string) - присваевает карточке переданное изображение
- set description(value: string) - присваивает карточке описание
- set category(value: string) - присваивает карточке категорию
- set price(value: number | null) - присваивает карточке цену или "Бесценно", если цена = null

#### Класс PreviewCard
Класс отвечает за содержимое модального окна, которое открывается при клике на карточку на главной странице.\
`constructor(container: HTMLElement, actions?: ICardActions)` - в конструктор класса передается HTML-элемент контейнера и опционально коллбэк для взаимодействия с интерактивными элементами карточки (кнопка "Добавить в корзину"), имплементирующий интерфейс ICardActions.\
В классе устанавливаются слушатели на все интерактивные элементы, в результате взаимодействия с которыми пользователя генерируются соответствующие события.\
Поля класса:
- protected _button: HTMLButtonElement; - кнопка, при нажатии на которую выбранная карточка добавляется в корзину. Если выбранный товар - бесценный, то кнопка становится неактивной

Методы класса:
- get button(): HTMLButtonElement - возвращает DOM-элемент кнопки на карточке
- setButtonText(value: string) - присваивает кнопке на карточке переданный текст

#### Класс CatalogCard
Класс отвечает за отображение отдельной карточки на главной странице сайта (в каталоге). Вся карточка является кнопкой, при нажатии на которую открывается модальное окно с экземпляром PreviewCard.\
`constructor(container: HTMLElement, actions?: ICardActions)` - в конструктор класса передается HTML-элемент контейнера и опционально коллбэк для взаимодействия с интерактивными элементами карточки. Вся карточка является кнопкой. Коллбэк имплементирует интерфейс ICardActions.\
В классе устанавливаются слушатели на все интерактивные элементы, в результате взаимодействия с которыми пользователя генерируются соответствующие события.\
Поля класса:
- protected _button: HTMLElement - кнопка, при нажатии на которую открывается модальное окно

#### Класс BasketCard
Класс отвечает за отображение упрощенной вариации карточки товара. Эта карточка находится внутри модального окна корзины в качестве элемента массива карточек.\
`constructor(container: HTMLElement, actions?: ICardActions)` - в конструктор класса передается HTML-элемент контейнера и опционально коллбэк для взаимодействия с интерактивными элементами карточки (кнопка с иконкой мусорного ведра). Коллбэк имплементирует интерфейс ICardActions.\
В классе устанавливаются слушатели на все интерактивные элементы, в результате взаимодействия с которыми пользователя генерируются соответствующие события.\
Поля класса:
- protected _index: HTMLElement - порядковый номер товара в корзине
- protected _button: HTMLButtonElement - кнопка, при нажатии на которую, товар удаляется из корзины

Методы класса:
- set index(value: number) - присвает карточке порядковый номер

#### Класс Modal
Класс отвечает за отображение всех модальных окон на сайте. С помощью слушателей позволяет закрывать модальное окно нажатием на кнопку-крестик и на оверлей. Внутри себя содержит контент других компонентов представления.\
`constructor(container: HTMLElement, protected events: IEvents)` - в конструктор класса передается HTML-элемент контейнера и инстант брокера событий, который имплементирует интерфейс IEvents.\
В классе устанавливаются слушатели на все интерактивные элементы, в результате взаимодействия с которыми пользователя генерируются соответствующие события.\
Поля класса:
- protected _closeButton: HTMLButtonElement - кнопка, при нажатии на которую модальное окно закрывается
- protected _content: HTMLElement - содержимое модального окна

Методы класса:
- set content(value: HTMLElement) - помещает внутрь модального окна переданный элемент
- open() - открывает модальное окно
- close() - закрывает модальное окно
- render(data: IModalData): HTMLElement - отображает на странице элемент модального окна и элемент переданного аргумента

#### Класс Basket
Класс отвечает за отображение списка товаров в корзине, их общей стоимости и с помощью кнопки позволяет перейти к форме оформления заказа.\
`constructor(container: HTMLElement, protected events: IEvents)` - в конструктор класса передается HTML-элемент контейнера и инстант брокера событий, который имплементирует интерфейс IEvents.\
В классе устанавливаются слушатели на все интерактивные элементы, в результате взаимодействия с которыми пользователя генерируются соответствующие события.\
Поля класса:
- protected _list: HTMLElement - массив карточек товаров
- protected _total: HTMLElement - общая стоимость товаров в корзине
- protected _button: HTMLElement - кнопка, при нажатии на которую открывается модальное окно с формой

Методы класса:
- set items(items: HTMLElement[]) - отображает список товаров в корзине, если они есть, либо отображает текст, что корзина пуста
- set total(total: number) - устанавливает значение общей стоимости товаров в корзине
- get button() - возвращает DOM-элемент кнопки в корзине

#### Класс Form
Класс используется другими компонентами с формами и отвечает за управление формами, позволяя отправлять форму, отображать сообщения об ошибках и уведомлять об изменениях в инпутах.\
`constructor(protected container: HTMLFormElement, protected events: IEvents)` - в конструктор класса передается HTML-элемент формы, служащей контейнером, и инстант брокера событий, который имплементирует интерфейс IEvents.\
В классе устанавливаются слушатели на все интерактивные элементы, в результате взаимодействия с которыми пользователя генерируются соответствующие события.\
Поля класса:
- protected _submit: HTMLButtonElement - кнопка отправки формы
- protected _errors: HTMLElement - ошибки в форме

Методы класса:
- protected onInputChange(field: keyof T, value: string) - генерирует событие изменения в инпуте
- set valid(value: boolean) - определяет форму как валидную
- set errors(value: string) - устанавливает текст ошибок
- render(state: Partial<T> & IFormState) - отображает форму и ошибки

#### Класс OrderPaymentForm
Класс наследуюется от класса Form и отвечает за отображение и взаимодействие с формой выбора типа оплаты и указания адреса.\
`constructor(container: HTMLFormElement, events: IEvents)` - в конструктор класса передается HTML-элемент формы, служащей контейнером, и инстант брокера событий, который имплементирует интерфейс IEvents.\
В классе устанавливаются слушатели на кнопки с типом оплаты, в результате взаимодействия с которыми пользователя генерируются соответствующие события.\
Поля класса:
- protected _buttonCard: HTMLButtonElement - кнопка для выбора типа оплаты "card"
- protected _buttonCash: HTMLButtonElement - кнопка для выбора типа оплаты "cash"

Методы класса:
- set address(value: string) - устанавливает переданное значение в инпут "Адрес"
- get buttonCard(): HTMLButtonElement - возвращает элемент кнопки "card"
- get buttonCash(): HTMLButtonElement - возвращает элемент кнопки "cash"
- toggleCard(state: boolean = true) - переключает тип оплаты "card" с невыбранного на выбранный и наоборот
- toggleCash(state: boolean = true) - переключает тип оплаты "cash" с невыбранного на выбранный и наоборот

#### Класс OrderContactsForm
Класс наследуюется от класса Form и отвечает за отображение и взаимодействие с формой указания email и телефона в заказе.
`constructor(container: HTMLFormElement, events: IEvents)` - в конструктор класса передается HTML-элемент формы, служащей контейнером, и инстант брокера событий, который имплементирует интерфейс IEvents.\
Методы класса:
- set email(value: string) - устанавливает переданное значение в инпут "email"
- set phone(value: string) - устанавливает переданное значение в инпут "телефон"

#### Класс OrderSuccess
Класс отвечает за отображение информации о том, что заказ совершен успешно, также отображает общую сумму заказа и кнопку возврата на главную страницу. Используется в случае успешной отправки POST запроса.\
`constructor(container: HTMLElement, actions: IOrderSuccessActions)` - в конструктор класса передается HTML-элемент контейнера и коллбэк для взаимодействия с кнопкой. Коллбэк имплементирует интерфейс IOrderSuccessActions.\
Поля класса:
- protected _close: HTMLElement - кнопка
- protected _total: HTMLElement - общая сумма заказа

Методы класса:
- set total(value: number) - устанавливает текстовое значение с общей суммой заказа


### Слой коммуникации

#### Класс LarekApi
Класс наследует класс Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.\
`constructor(cdn: string, baseUrl: string, options?: RequestInit)` - в конструктор класса передается строка-URL для CDN, строка с начальным URL для запросов и опционально настройки для запросов.\
Поля класса:
- readonly cdn: string - начальный URL для запросов

Методы класса:
- `getProduct(id: string): Promise<ICard>` - GET запрос карточки товара
- `getProductList(): Promise<ICard[]>` - GET запрос массива карточек
- `orderProducts(order: IOrder): Promise<IOrderResult>` - POST запрос заказа

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*\
*События изменения данных (генерируются классами моделями данных)*
- `items:changed` - изменение каталога карточек
- `preview:changed` - изменилась выбранная для показа карточка
- `basket:changed` - изменения в корзине
- `paymentErrors:changed` - изменились данные об ошибках в форме "оплата и адрес"
- `payment:changed` - изменились данные в инпутах в форме "оплата и адрес"
- `contactsErrors:changed` - изменились данные об ошибках в форме контактов

*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*
- `card:select` - пользователь нажал на карточку на главной странице
- `modal:open` - открыто модальное окно
- `modal:close` - закрыто модальное окно
- `basket:open` - открыто модальное окно корзины
- `order:open` - открыто модальное окно с формой "оплата и адрес"
- `order:payment:changed` - пользователь нажал на одну из кнопок выбора типа оплаты
- `/^order\..*:changed/` - изменение в инпуте в форме "оплата и адрес"
- `/^contacts\..*:changed/` - изменение в инпуте в форме контактов
- `order:submit` - отправка формы "оплата и адрес"
- `contacts:submit`- отправка формы контактов