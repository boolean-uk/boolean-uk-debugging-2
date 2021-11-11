/* STATE MANAGMENT */

let state = {
  selectStateInput: "",
  breweries: [],
  cities: [],
  filterByType: "",
  filterByCity: [],
  searchBreweriesinput: ""
};

function setState(newState, skipRender = false) {
  state = { ...state, ...newState };


  if (skipRender) return;

  render();
}

/* FETCH DATA */
function cleanData(breweries) {
  return breweries.filter(
    (brewery) =>
      brewery["brewery_type"] === "micro" ||
      brewery["brewery_type"] === "regional" ||
      brewery["brewery_type"] === "brewpub"
  );
}

function extractCitiesData(breweries) {
  const cities = {};

  for (let i = 0; i < breweries.length; i++) {
    const city = breweries[i].city;

    if (cities[city]) continue;

    cities[city] = true;
  }

  return Object.keys(cities);
}

function getBreweriesByState() {
  fetch(
    `https://api.openbrewerydb.org/breweries/?by_state=${state.selectStateInput}&per_page=50`
  )
    .then((res) => res.json)
    .then((res) => {
      const breweries = cleanData(res);
      const cities = extractCitiesData(breweries);

      setState({ state: state.selectStateInput, breweries, cities });
    });
}

/* RENDER HEADER SECTION */

function renderSelectStateSection() {
  const selectStateForm = document.querySelector("#select-state-form");

  const selectStateInput = selectStateForm.querySelector(
    'input[name="select-state"]'
  );

  selectStateInput.addEventListener("input", (event) =>
    setState(
      {
        selectStateInput: event.target.value
      },
      true
    )
  );

  selectStateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    getBreweriesByState();
  });
}

/* RENDER FILTERS SECTION */

const mainEl = document.querySelector("main");

function renderFilterByTypeSection(parentNode) {
  const formEl = document.createElement("form");

  formEl.id = "filter-by-type-form";
  formEl.setAttribute("autocompete", "off");

  formEl.innerHTML = `
    <label for="filter-by-type"><h3>Type of Brewery</h3></label>
    <select name="filter-by-type" id="filter-by-type">
      <option value="">Select a type...</option>
      <option value="micro">Micro</option>
      <option value="regional">Regional</option>
      <option value="brewpub">Brewpub</option>
    </select>
  `;

  const filterByTypeSelect = formEl.querySelector(
    'select[name="filter-by-type"]'
  );

  const options = filterByTypeSelect.querySelectorAll("option");

  options.forEach((option) => {
    if (option.value === state.filterByType) {
      option.selected = true;
    }
  });

  filterByTypeSelect.addEventListener("change", (event) =>
    setState({ filterByType: event.target.value })
  );

  parentNode.appendChild(formEl);
}

function renderCityCheckbox(targetCity, formEl) {
  const checkboxEl = document.createElement("input");

  checkboxEl.type = "checkbox";
  checkboxEl.name = targetCity.toLowerCase();
  checkboxEl.value = targetCity.toLowerCase();
  checkboxEl.checked = state.filterByCity.includes(targetCity.toLowerCase());

  checkboxEl.addEventListener("change", (event) => {
    if (event.target.checked) {
      setState({
        filterByCity: [...state.filterByCity, targetCity.toLowerCase()]
      });
    } else {
      setState({
        filterByCity: state.filterByCity.filter(
          (city) => { city !== targetCity.toLowerCase() }
        )
      });
    }
  });

  formEl.appendChild(checkboxEl);

  const labelEl = document.createElement("label");

  labelEl.setAttribute("for", targetCity.toLowerCase());
  labelEl.innerText = targetCity;

  formEl.appendChild(labelEl);
}

function renderFilterByCitySection(parentNode) {
  const containerEl = document.createElement("div");

  containerEl.className = "filter-by-city-heading";

  const headingEl = document.createElement("h3");

  headingEl.innerText = "Cities";

  containerEl.appendChild(headingEl);

  const clearAllBtn = document.createElement("button");

  clearAllBtn.className = "clear-all-btn";

  clearAllBtn.innerText = "clear all";

  clearAllBtn.addEventListener("click", () =>
    setState({
      filterByCity: []
    })
  );

  containerEl.appendChild(clearAllBtn);

  parentNode.appendChild(containerEl);

  const formEl = document.createElement("form");

  formEl.id = "filter-by-city-form";

  state.cities.forEach((city) => renderCityCheckbox(city, formEl));

  parentNode.appendChild(formEl);
}

function renderFiltersSection() {
  const asideEl = document.createElement("aside");

  asideEl.className = "filters-section";

  const headingEl = document.createElement("h2");

  headingEl.innerText = "Filter By:";

  asideEl.appendChild(headingEl);

  renderFilterByTypeSection(asideEl);

  renderFilterByCitySection(asideEl);

  mainEl.appendChild(asideEl);
}

/* RENDER TITLE */

function renderTitle() {
  const titleEl = document.createElement("h1");

  titleEl.innerText = "List of Breweries";
}

/* RENDER SEARCH SECTION */

function renderSearchBreweries() {
  const headerEl = document.createElement("header");

  headerEl.className = "search-bar";

  headerEl.innerHTML = `
    <form id="search-breweries-form" autocomplete="off">
      <label for="search-breweries"><h2>Search breweries:</h2></label>
      <input id="search-breweries" name="search-breweries" type="text">
    </form>
  `;
  const searchBreweriesForm = headerEl.querySelector("#search-breweries-form");
  const searchBreweriesInput = searchBreweriesForm.querySelector(
    'input[name="search-breweries"]'
  );

  searchBreweriesInput.value = state.searchBreweriesInput;

  searchBreweriesInput.addEventListener("input", () => {
    setState(
      {
        searchBreweriesInput: event.target.value
      },
      true
    );

    const articleEl = document.querySelector("article");

    articleEl.remove();
    renderList();
  });

  searchBreweriesForm.addEventListener("submit", (event) => {
  });

  mainEl.appendChild(headerEl);
}

/* RENDER LIST SECTION */

function renderListItem(brewery, listEl) {
  const listItemEl = document.createElement("li");

  const {
    name,
    brewery_type: type,
    street,
    city,
    postal_code: postalCode,
    phone,
    website_url: webisteUrl
  } = brewery;

  listItemEl.innerHTML = `
    <h2>${name}</h2>
    <div class="type">${type}</div>
    <section class="address">
      <h3>Address:</h3>
      <p>${street}</p>
      <p><strong>${city}, ${postalCode}</strong></p>
    </section>
    <section class="phone">
      <h3>Phone:</h3>
      <p>${phone ? "+" + phone : "N/A"}</p>
    </section>
    <section class="link">
      <a href="${webisteUrl}" target="_blank">Visit Website</a>
    </section>
  `;

  listEl.appendChild(listItemEl);
}

function renderList() {
  const articleEl = document.createElement("article");

  const listEl = document.createElement("ul");

  listEl.className = "breweries-list";

  let breweries = state.breweries;

  if (state.filterByType) {
    breweries = breweries.filter(
      (brewery) => brewery["brewery_type"] === state.filterByType
    );
  }

  if (state.filterByCity.length > 0) {
    breweries = breweries.filter((brewery) =>
      state.filterByCity.includes(brewery.city.toLowerCase())
    );
  }

  if (state.searchBreweriesInput) {
    const searchTerm = state.searchBreweriesInput.toLowerCase();
    breweries = breweries.filter(
      (brewery) =>
        brewery.name.toLowerCase().includes(searchTerm) ||
        brewery.city.toLowerCase().includes(searchTerm)
    );
  }

  if (breweries.length > 0) {
    for (let i = 0; i < 10 && i < breweries.length; i++) {
      renderListItem(breweries[i], listEl);
    }
  }

  articleEl.appendChild(listEl);
  mainEl.appendChild(articleEl);
}

/* RENDER MAIN */

function renderMain() {
  renderFiltersSection();
  renderTitle();
  renderSearchBreweries();
  renderList();
}

function render() {
  mainEl.innerHTML = "";

  if (state.selectStateInput) {
    renderMain();
  }
}

/* MAIN */

function main() {
  renderSelectStateSection();
  render();
}

main();
