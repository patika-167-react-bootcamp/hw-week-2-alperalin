// DOM Elements
const userForm = document.querySelector('.form-user');
const userFormFullName = userForm.querySelector('#userFullName');
const userFormBalance = userForm.querySelector('#userBalance');

const transferForm = document.querySelector('.form-transfer');
const transferSender = transferForm.querySelector('#transferSender');
const transferRecipient = transferForm.querySelector('#transferRecipient');
const transferAmount = transferForm.querySelector('#transferAmount');

const accountListEl = document.querySelector('.account__list');
const historyListEl = document.querySelector('.history__list');

// States
const state = {
	userData: [],
	historyState: [],
};

const setState = (stateName, newState) => {
	state[stateName] = newState;
	renderApp();
};

// Delete User Data
const deleteUser = (userID, userName) => {
	// Kullanici indeksi bulunuyor
	const userIndex = state.userData.findIndex((user) => user.id === userID);

	// Kullanici siliniyor.
	state.userData.splice(userIndex, 1);

	// history guncelliyor
	setState('historyState', [
		{
			type: 'userRemove',
			id: Math.round(Math.random() * 1000),
			text: `${userName} isimli kullanicinin hesabi silindi.`,
		},
		...state.historyState,
	]);
};

// Update User Balance
const updateUserBalance = (senderID, recipientID, amount) => {
	// Kullanici objelerini ve indekslerini al
	let index = '';

	const sender = {
		user: state.userData.find((user, i) => {
			if (user.id === senderID) {
				index = i;
				return user;
			}
		}),
		index,
	};
	const recipient = {
		user: state.userData.find((user, i) => {
			if (user.id === recipientID) {
				index = i;
				return user;
			}
		}),
		index,
	};

	// Kullanicilardan biri silindiyse
	// hata mesaji gosterilip islem sonlaniyor
	if (!sender.user || !recipient.user) {
		return -1;
	}

	// Bakiyeler duzenleniyor
	sender.user.balance -= amount;
	recipient.user.balance += amount;

	// Islem olumlu sonlandigina dair donus yapiliyor.
	return { sender, recipient, amount };
};

// Components
// <li> Element Creator
const Li = (props = {}) => {
	let li = document.createElement('li');
	li.className = `list-item ${props.className ? props.className : ''}`;
	if (Array.isArray(props.text) && props.text.length > 0) {
		for (item of props.text) li.appendChild(item);
	} else {
		li.textContent = props.text ? props.text : '';
	}

	return li;
};

// <span> Element Creator
const Span = (props = {}) => {
	let span = document.createElement('span');
	span.className = 'list-item__span';
	span.textContent = `${props.text ? props.text : ''}`;

	return span;
};

// <button> Element Creator
const Button = (props = {}) => {
	let button = document.createElement('button');
	button.className = 'list-item__button';
	button.textContent = `${props.text ? props.text : ''}`;

	return button;
};

// <option> Element Creator
const Option = (props = {}) => {
	let option = document.createElement('option');
	option.value = props.id ? props.id : '';
	option.selected = props.selected ? true : false;
	option.textContent = `${props.name}`;

	return option;
};

// Renders
const renderAccountList = () => {
	// Kullanici listesi temizlenip guncelleniyor.
	accountListEl.textContent = '';
	for (let user of state.userData) {
		let buttonEl = Button({ text: 'Sil' });
		buttonEl.addEventListener('click', () => deleteUser(user.id, user.name), {
			once: true,
		});

		accountListEl.appendChild(
			Li({
				text: [
					Span({ text: user.name }),
					Span({ text: `${user.balance}₺` }),
					buttonEl,
				],
			})
		);
	}
};

const renderHistoryList = () => {
	// History alani temizlenip guncelleniyor
	historyListEl.textContent = '';
	for (let item of state.historyState) {
		historyListEl.appendChild(
			Li({
				className: item.className ? item.className : '',
				text: item.button
					? [Span({ text: item.text }), item.button]
					: `${item.text}`,
			})
		);
	}

	console.log(state.historyState);
};

const renderOptions = () => {
	// Her Render'da secim elemanlari temizleniyor
	// ve varsayilan secenek giriliyor
	transferSender.textContent = '';
	transferSender.appendChild(
		Option({ name: 'Gonderici Seciniz', selected: true })
	);

	transferRecipient.textContent = '';
	transferRecipient.appendChild(
		Option({ name: 'Alici Seciniz', selected: true })
	);

	// UserData'dan kullanici isimleri
	// secenek olarak giriliyor.
	for (let user of state.userData) {
		transferSender.appendChild(Option(user));
		transferRecipient.appendChild(Option(user));
	}
};

const renderApp = () => {
	// App render cagirildiginda
	// Ekrandaki Uc alan yeniden olusturuluyor
	renderAccountList();
	renderHistoryList();
	renderOptions();
};

// Functions
const addNewUser = (event) => {
	// Formun submit edilmesi engelleniyor
	event.preventDefault();

	// Yeni kullanici bilgileri bir degiskene ataniyor
	const newUser = {
		id: Math.round(Math.random() * 1000),
		name: userFormFullName.value,
		balance: Math.floor(userFormBalance.value),
	};

	// form input'lari temizleniyor
	userFormFullName.value = '';
	userFormBalance.value = '';

	// userData'ya yeni kullanici ekleniyor.
	setState('userData', [...state.userData, { ...newUser }]);

	// history guncelleniyor.
	setState('historyState', [
		{
			type: 'userAdd',
			id: Math.round(Math.random() * 1000),
			user: {
				id: newUser.id,
				name: newUser.name,
			},
			text: `${newUser.name} isimli kullanici eklendi.`,
		},
		...state.historyState,
	]);
};

const transfer = (event) => {
	// Formun submit edilmesi engelleniyor
	event.preventDefault();

	// Gonderici, alici ve gonderilen miktar bilgisi aliniyor
	const senderID = parseInt(transferSender.value);
	const recipientID = parseInt(transferRecipient.value);
	const amount = parseFloat(transferAmount.value);

	// userData'nin guncellenmesi icin updateUserBalance fonksiyonu cagiriliyor
	const result = updateUserBalance(senderID, recipientID, amount);
	const transactionID = Math.round(Math.random() * 1000);

	// form input'lari temizleniyor
	transferAmount.value = '';

	// 'Geri Al' butonu olusturuluyor
	const buttonEl = Button({ text: 'Geri Al' });
	buttonEl.addEventListener(
		'click',
		() => {
			// Islemin geri alinabilmesi icin revoke fonksiyonu butona ataniyor
			revoke(transactionID);
		},
		{
			once: true,
		}
	);

	// History guncelleniyor
	setState('historyState', [
		{
			type: 'transfer',
			id: transactionID,
			sender: {
				id: result.sender.user.id,
				name: result.sender.user.name,
			},
			recipient: {
				id: result.recipient.user.id,
				name: result.recipient.user.name,
			},
			amount: result.amount,
			text: `${result.sender.user.name} isimli kullanici tarafinda ${result.recipient.user.name} isimli kullaniciya ${result.amount}₺ tutarinda transfer islemi yapildi.`,
			button: buttonEl,
		},
		{
			type: 'notify',
			id: Math.round(Math.random() * 1000),
			text: `${result.sender.user.name} isimli kullanicinin guncel bakiyesi ${result.sender.user.balance}₺.`,
		},
		{
			type: 'notify',
			id: Math.round(Math.random() * 1000),
			text: `${result.recipient.user.name} isimli kullanicinin guncel bakiyesi ${result.recipient.user.balance}₺.`,
		},
		...state.historyState,
	]);
};

const revoke = (transactionID) => {
	// transactionID uzerinden historyState icerisinde
	// islem bulunuyor.
	const transaction = state.historyState.find(
		(item) => item.id === transactionID
	);

	// Transaction uzerindeki buton siliniyor.
	transaction.button = '';

	// userData'nin guncellenmesi icin updateUserBalance fonksiyonu cagiriliyor
	const result = updateUserBalance(
		transaction.recipient.id,
		transaction.sender.id,
		transaction.amount
	);

	// Eger bir kullanici silindiyse history hata mesaji ile guncelleniyor.
	// Ve islem durduruluyor
	if (result === -1) {
		setState('historyState', [
			{
				type: 'notify',
				id: Math.round(Math.random() * 1000),
				className: 'list-item--warning',
				text: `Kullanicilardan biri silindigi icin bu islem geri alinamaz`,
			},
			...state.historyState,
		]);
		return;
	}

	// History guncelleniyor
	setState('historyState', [
		{
			type: 'revoke',
			id: Math.round(Math.random() * 1000),
			sender: {
				id: result.sender.user.id,
				name: result.sender.user.name,
			},
			recipient: {
				id: result.recipient.user.id,
				name: result.recipient.user.name,
			},
			amount: result.amount,
			text: `${result.recipient.user.name} isimli kullanici tarafinda ${result.sender.user.name} isimli kullaniciya yapilan ${result.amount}₺ tutarindaki transfer islemi iptal edildi.`,
		},
		{
			type: 'notify',
			id: Math.round(Math.random() * 1000),
			text: `${result.sender.user.name} isimli kullanicinin guncel bakiyesi ${result.sender.user.balance}₺.`,
		},
		{
			type: 'notify',
			id: Math.round(Math.random() * 1000),
			text: `${result.recipient.user.name} isimli kullanicinin guncel bakiyesi ${result.recipient.user.balance}₺.`,
		},
		...state.historyState,
	]);
};

// Form'lara submit event listener'i ekleniyor.
userForm.addEventListener('submit', addNewUser);
transferForm.addEventListener('submit', transfer);
