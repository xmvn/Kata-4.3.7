const searchInput = document.querySelector('.search__input');
const searchList = document.querySelector('.search__list');
const savedList = document.querySelector('.saved-list');
const URL = 'https://api.github.com/search/';

const debounce = (fn, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const getRepositories = async (value) => {
  const response = await fetch(`${URL}repositories?q=${value}&per_page=5`);
  return await response.json();
};
const createList = (res) => {
  if (res.items.length === 0) {
    searchList.innerHTML =
      "<li class='search__list-item'>Результатов не найдено</li>";
  } else {
    searchList.innerHTML = res.items
      .map(
        (item) =>
          `<li class="search__list-item">Repo:${item.name.substring(
            0,
            20
          )} Stars:${item.stargazers_count}</li>`
      )
      .join('');
  }
};

const handleResponse = async (e) => {
  const { value } = e.target;
  if (value.trim() !== '') {
    try {
      const result = await getRepositories(value.trim());
      createList(result);
      itemData(document.querySelectorAll('.search__list-item'), result);
    } catch (err) {
      alert('Превышен лимит запросов');
    }
  } else {
    searchList.innerHTML = '';
  }
};
const handleDebounce = debounce(handleResponse, 400);
searchInput.addEventListener('input', handleDebounce);

const itemData = (listItems, data) => {
  listItems.forEach((element, index) => {
    element.addEventListener('click', () => {
      if (!element.classList.contains('saved')) {
        createElement(data.items[index]);
        searchInput.value = '';
        searchList.innerHTML = '';
        let deleteButton = document.querySelectorAll(
          '.saved-list__item-button'
        );
        deleteItem(deleteButton);

        element.classList.add('saved');
      }
    });
  });
};

const createElement = (item) => {
  const savedElement = document.createElement('li');
  savedElement.classList.add('saved-list__item');
  savedElement.setAttribute(`id`, item.id);
  savedElement.addEventListener('click', openLink);
  savedElement.addEventListener('auxclick', openLink);

  function openLink() {
    window.open(`${item.html_url}`, '_blank');
  }

  const itemContent = document.createElement('div');
  itemContent.classList.add('saved-list__item-content');
  savedElement.appendChild(itemContent);

  const nameSpan = document.createElement('span');
  nameSpan.classList.add('saved-list__content-span');
  nameSpan.textContent = `Repo: ${item.name.substring(0, 30)}`;
  itemContent.appendChild(nameSpan);

  const ownerSpan = document.createElement('span');
  ownerSpan.classList.add('saved-list__content-span');
  ownerSpan.textContent = `Owner: ${item.owner.login}`;
  itemContent.appendChild(ownerSpan);

  const starsSpan = document.createElement('span');
  starsSpan.classList.add('saved-list__content-span');
  starsSpan.textContent = `Stars: ${item.stargazers_count}`;
  itemContent.appendChild(starsSpan);

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('saved-list__item-button');
  savedElement.appendChild(deleteButton);

  const deleteImg = document.createElement('img');
  deleteImg.src = 'cross.png';
  deleteImg.alt = 'delete';
  deleteButton.appendChild(deleteImg);

  savedList.appendChild(savedElement);
};

const deleteItem = (btns) => {
  btns.forEach((btn) => {
    const handleClick = (event) => {
      event.stopPropagation();
      btn.closest('.saved-list__item').remove();
      btn.removeEventListener('click', handleClick);
    };
    btn.addEventListener('click', handleClick);
  });
};
