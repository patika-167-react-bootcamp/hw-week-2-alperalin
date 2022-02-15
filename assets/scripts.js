// DOM Elements
const userForm = document.querySelector('.form-user');
const userFormFullName = userForm.querySelector('#userFullName');
const userFormBalance = userForm.querySelector('#userBalance');

const transferForm = document.querySelector('.form-transfer');
const transferSender = transferForm.querySelector('#transferSender');
const transferRecipient = transferForm.querySelector('#transferRecipient');
const transferAmount = transferForm.querySelector('#transferAmount');

const userList = document.querySelector('.userList');
const history = document.querySelector('.history');

// States
const state = {
	userData: [],
	historyList: [],
};

const setState = (stateName, newState) => {
	state[stateName] = newState;
	renderApp();
};

// Updater
const updateUserData = (senderID, recipientID, amount) => {
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

	// Bakiyeler duzenleniyor
	sender.user.balance -= amount;
	recipient.user.balance += amount;

	// history guncelliyor
	setState('historyList', [
		...state.historyList,
		`${sender.user.name} isimli kullanici tarafinda ${recipient.user.name} isimli kullaniciya ${amount}₺ gonderildi.`,
		`${sender.user.name} isimli kullanicinin guncel bakiyesi ${sender.user.balance}₺.`,
		`${recipient.user.name} isimli kullanicinin guncel bakiyesi ${recipient.user.balance}₺.`,
	]);

	// render cagiriliyor
	renderApp();
};

// Components
// <li> Element Creator
const Li = (props = {}) => {
	let li = document.createElement('li');
	li.className = `listItem${props.className ? props.className : ''}`;
	li.textContent = `${props.text ? props.text : ''}`;

	return li;
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
const renderUserList = () => {
	// Kullanici listesi temizlenip guncelleniyor.
	userList.textContent = '';
	for (let user of state.userData) {
		userList.appendChild(
			Li({
				text: `${user.name} ${user.balance}₺`,
			})
		);
	}
};

const renderHistoryList = () => {
	// History alani temizlenip guncelleniyor
	history.textContent = '';
	for (let item of state.historyList) {
		history.appendChild(
			Li({
				text: `${item}`,
			})
		);
	}
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
	renderUserList();
	renderHistoryList();
	renderOptions();
};

// Functions
const addNewUser = (event) => {
	// Formun submit edilmesi engelleniyor
	event.preventDefault();

	// userData'ya yeni kullanici ekleniyor.
	setState('userData', [
		...state.userData,
		{
			id: Math.round(Math.random() * 1000),
			name: userFormFullName.value,
			balance: Math.floor(userFormBalance.value),
		},
	]);

	// history guncelleniyor.
	setState('historyList', [
		...state.historyList,
		`${userFormFullName.value} isimli kullanici eklendi.`,
	]);

	// form input'lari temizleniyor
	userFormFullName.value = '';
	userFormBalance.value = '';
};

const transfer = (event) => {
	// Formun submit edilmesi engelleniyor
	event.preventDefault();

	// Gonderici, alici ve gonderilen miktar bilgisi aliniyor
	const senderID = parseInt(transferSender.value);
	const recipientID = parseInt(transferRecipient.value);
	const amount = parseFloat(transferAmount.value);

	// userData'nin guncellenmesi icin updateUserData fonksiyonu cagiriliyor
	updateUserData(senderID, recipientID, amount);

	// form input'lari temizleniyor
	transferAmount.value = '';
};

// Form'lara submit event listener'i ekleniyor.
userForm.addEventListener('submit', addNewUser);
transferForm.addEventListener('submit', transfer);
