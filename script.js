const themeSwitch = document.querySelector('.theme-switch');
const createNewItemInput = document.querySelector('.input-container>input');
const itemTemplate = document.querySelector('template');
const itemList = document.querySelector('.item-list');
const itemCountElement = document.querySelector('.count-and-clear');
const clearCompletedBtn = document.querySelector('.clear-completed-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const [filterAllBtn, filterActiveBtn, filterCompletedBtn] = [...filterBtns];

themeSwitch.addEventListener('click', () => {
	document.body.classList.toggle('dark-theme');
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

function updateDraggables(container) {
	container.addEventListener('dragover', (e) => {
		e.preventDefault();
		const draggingElement = container.querySelector('.dragging');
		const afterElement = getAfterElement(e.clientY);

		if (afterElement === null) {
			container.insertBefore(draggingElement, itemCountElement);
		} else {
			container.insertBefore(draggingElement, afterElement);
		}
	});
}

function updateItemCount(itemList) {
	const itemUnchecked = itemList.querySelectorAll('.item-container:not(.checked)');
	var [numberElement, itemStringElement] = [...itemList.querySelectorAll('.item-count>span')];

	numberElement.innerText = itemUnchecked.length;
	itemStringElement.innerText = itemUnchecked.length > 1 ? 'items' : 'item';
}

createNewItemInput.addEventListener('keyup', (e) => {
	if (e.key === 'Enter') {
		const input = createNewItemInput.value.trim();

		if (input === '') return;

		const clone = itemTemplate.content.cloneNode(true);

		const itemContainer = clone.querySelector('.item-container');
		const detailElement = clone.querySelector('.item-detail');
		const checkBtn = clone.querySelector('.check-btn');
		const clearBtn = clone.querySelector('.clear-btn');

		detailElement.innerText = input;

		detailElement.addEventListener('click', () => {
			itemContainer.classList.toggle('checked');
			updateItemCount(itemList);
		});

		checkBtn.addEventListener('click', () => {
			itemContainer.classList.toggle('checked');
			updateItemCount(itemList);
		});

		clearBtn.addEventListener('click', () => {
			itemList.removeChild(itemContainer);
			updateItemCount(itemList);
		});

		itemContainer.addEventListener('dragstart', () => {
			itemContainer.classList.add('dragging');
		});

		itemContainer.addEventListener('dragend', () => {
			itemContainer.classList.remove('dragging');
		});

		itemList.prepend(clone);
		createNewItemInput.value = null;
		updateDraggables(itemList);
		updateItemCount(itemList);
	}
});

clearCompletedBtn.addEventListener('click', () => {
	const itemChecked = itemList.querySelectorAll('.checked');
	itemChecked.forEach((item) => {
		itemList.removeChild(item);
	});
});

function tickFilterBtn(btn) {
	filterBtns.forEach((btn) => {
		btn.classList.remove('ticked');
	});
	btn.classList.add('ticked');
}

filterBtns.forEach((btn) => {
	btn.addEventListener('click', () => {
		tickFilterBtn(btn);

		const items = itemList.querySelectorAll('.item-container');

		switch (btn) {
			case filterAllBtn:
				items.forEach((item) => {
					item.classList.remove('hidden');
				});
				break;
			case filterActiveBtn:
				items.forEach((item) => {
					if (item.classList.contains('checked')) {
						item.classList.add('hidden');
					} else {
						item.classList.remove('hidden');
					}
				});
				break;
			case filterCompletedBtn:
				items.forEach((item) => {
					if (item.classList.contains('checked')) {
						item.classList.remove('hidden');
					} else {
						item.classList.add('hidden');
					}
				});
				break;
			default:
				break;
		}
	});
});
