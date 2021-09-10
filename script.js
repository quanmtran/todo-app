const themeSwitch = document.querySelector('.theme-switch');
const createNewItemInput = document.querySelector('.input-container>input');
const itemList = document.querySelector('.item-list');
const clearCompletedBtn = document.querySelector('.clear-completed-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const [filterAllBtn, filterActiveBtn, filterCompletedBtn] = [...filterBtns];

const LOCAL_STORAGE_KEY_IS_DARK_THEME = 'isDarkTheme';

renderTheme();

themeSwitch.addEventListener('click', () => {
	const isDarkTheme = document.body.classList.contains('dark-theme');
	localStorage.setItem(LOCAL_STORAGE_KEY_IS_DARK_THEME, !isDarkTheme);
	renderTheme();
});

function renderTheme() {
	const isDarkTheme = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_IS_DARK_THEME));
	if (isDarkTheme) {
		document.body.classList.add('dark-theme');
	} else {
		document.body.classList.remove('dark-theme');
	}
}

const LOCAL_STORAGE_KEY_MY_TODO_LIST = 'myTodoList';
const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_MY_TODO_LIST)) || [];

renderItemList();

createNewItemInput.addEventListener('keyup', (e) => {
	if (e.key === 'Enter') {
		const input = createNewItemInput.value.trim();

		if (input === '') return;

		items.unshift({ detail: input, isChecked: false });
		renderItemList();
		updateItemsArrAndSaveToLocalStorage();

		createNewItemInput.value = null;
	}
});

clearCompletedBtn.addEventListener('click', () => {
	const itemChecked = itemList.querySelectorAll('.checked');
	itemChecked.forEach((item) => {
		itemList.removeChild(item);
	});

	updateItemsArrAndSaveToLocalStorage();
});

filterBtns.forEach((btn) => {
	btn.addEventListener('click', () => {
		tickFilterBtn(btn);
		displayFilteredItems();
	});
});

function getAfterElement(y) {
	const remainingDraggableElements = [...document.querySelectorAll('.item-container:not(.dragging')];

	return remainingDraggableElements.reduce(
		(closestElement, element) => {
			const box = element.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;

			if (offset <= 0 && offset > closestElement.offset) {
				return { offset: offset, element: element };
			} else {
				return closestElement;
			}
		},
		{
			offset: Number.NEGATIVE_INFINITY,
			element: null,
		}
	).element;
}

function updateDraggables() {
	itemList.addEventListener('dragover', (e) => {
		e.preventDefault();
		const draggingElement = itemList.querySelector('.dragging');
		const afterElement = getAfterElement(e.clientY);

		if (afterElement === null) {
			itemList.appendChild(draggingElement);
		} else {
			itemList.insertBefore(draggingElement, afterElement);
		}

		updateItemsArrAndSaveToLocalStorage();
	});
}

function cloneTemplate(item) {
	const clone = document.querySelector('template').content.cloneNode(true);

	const itemContainer = clone.querySelector('.item-container');
	const detailElement = clone.querySelector('.item-detail');
	const checkBtn = clone.querySelector('.check-btn');
	const clearBtn = clone.querySelector('.clear-btn');

	detailElement.innerText = item.detail;

	if (item.isChecked) {
		itemContainer.classList.add('checked');
	}

	[detailElement, checkBtn].forEach((element) => {
		element.addEventListener('click', () => {
			itemContainer.classList.toggle('checked');
			displayFilteredItems();
			displayItemCount();
			updateItemsArrAndSaveToLocalStorage();
		});
	});

	clearBtn.addEventListener('click', () => {
		itemList.removeChild(itemContainer);
		displayItemCount();
		updateItemsArrAndSaveToLocalStorage();
	});

	itemContainer.addEventListener('dragstart', () => {
		itemContainer.classList.add('dragging');
	});

	itemContainer.addEventListener('dragend', () => {
		itemContainer.classList.remove('dragging');
	});

	return clone;
}

function renderItemList() {
	itemList.innerHTML = null;

	items.forEach((item) => {
		itemList.append(cloneTemplate(item));
	});

	updateDraggables();
	displayFilteredItems();
	displayItemCount();
}

function updateItemsArr() {
	while (items.length > 0) {
		items.pop();
	}

	const itemContainers = document.querySelectorAll('.item-container');
	itemContainers.forEach((itemContainer) => {
		const detail = itemContainer.querySelector('.item-detail').innerText;
		const isChecked = itemContainer.classList.contains('checked');

		items.push({ detail: detail, isChecked: isChecked });
	});
}

function saveListToLocalStorage() {
	localStorage.setItem(LOCAL_STORAGE_KEY_MY_TODO_LIST, JSON.stringify(items));
}

function updateItemsArrAndSaveToLocalStorage() {
	updateItemsArr();
	saveListToLocalStorage();
}

function tickFilterBtn(clickedBtn) {
	filterBtns.forEach((btn) => {
		btn.classList.remove('ticked');
	});

	clickedBtn.classList.add('ticked');
}

function displayFilteredItems() {
	const items = itemList.querySelectorAll('.item-container');

	if (filterActiveBtn.classList.contains('ticked')) {
		items.forEach((item) => {
			if (item.classList.contains('checked')) {
				item.classList.add('hidden');
			} else {
				item.classList.remove('hidden');
			}
		});
		return;
	}

	if (filterCompletedBtn.classList.contains('ticked')) {
		items.forEach((item) => {
			if (item.classList.contains('checked')) {
				item.classList.remove('hidden');
			} else {
				item.classList.add('hidden');
			}
		});
		return;
	}

	items.forEach((item) => {
		item.classList.remove('hidden');
	});
}

function displayItemCount() {
	const itemUnchecked = itemList.querySelectorAll('.item-container:not(.checked)');
	var [numberElement, itemStringElement] = [...document.querySelectorAll('.item-count>span')];

	numberElement.innerText = itemUnchecked.length;
	itemStringElement.innerText = itemUnchecked.length > 1 ? 'items' : 'item';
}
