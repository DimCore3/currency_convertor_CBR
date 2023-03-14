"use strict";

async function getCurrency(fromDate, toDate, currency) {
    let startDate = new Date(fromDate);
    let endDate = new Date(toDate);
    if (isDataCorrect(startDate, endDate)) {
        isLoading(true);
        showHideModal('hide', 'modalCurrency');
        await generateTable(startDate, endDate, currency);
    }
    isLoading(false);
};

async function generateTable(startDate, endDate, currency) {
    let result;
    let previousResultString;
    let tbody = document.createElement('tbody');
    let curTable = document.getElementById('curTable');
    createTable(curTable);
    
    console.time('generateTableFor');
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        result = await makeFetchRequest(date, currency, previousResultString);
        previousResultString = result !== {} ? JSON.stringify(result) : '{}';
        if (Object.keys(result).length !== 0) {
            newAddRow(tbody, date.toLocaleDateString(), currency, (result.Value / result.Nominal).toFixed(4));
            
        } else {
            return;
        };
    };
    console.timeEnd('generateTableFor');
    curTable.appendChild(tbody);
}

function createTable(curTable) {
    let currencyInfoBox = document.getElementById('currencyInfoBox');
    currencyInfoBox.className = 'd-block'
    currencyInfoBox.style.overflow = 'scroll';
    currencyInfoBox.style.maxHeight = '80vh';
    curTable.removeChild(curTable.lastElementChild);
}

function isDataCorrect(fromDate, toDate) {
    if (fromDate && toDate) {
        if (fromDate <= toDate) {
            return true;
        } else {
            alert('Диапазон дат указан некорректно!');
        }
    }
    return false;
}

function newAddRow(tbody, date, currency, amount) {
    let dataList = [date, currency, amount];
    let template = document.querySelector('#productrow');
    let clone = template.content.cloneNode(true);
    let td = clone.querySelectorAll("td");
    dataList.forEach((data, index) => td[index].textContent = data);
    tbody.appendChild(clone);
}

async function convert(date, currency, amount) {
    try {
        document.getElementById('convertedAmountInfo').innerText = `Загрузка...`;
        let dateNow = new Date();
        let fullDate = new Date(date);
        let roundedAmount = Number(amount).toFixed(2);
        
        if (date && roundedAmount && amount && currency && dateNow > fullDate && Number(roundedAmount) === Number(amount)) {
            isLoading(true);
            showHideModal('hide', 'modalConvert')
            showHideModal('show', 'modalConvertedAmount')
            let dateValue = new Date(date);
            let result = await makeFetchRequest(dateValue, currency);
            if (Object.keys(result).length !== 0) {
                let fullAmount = (result.Value * roundedAmount) / result.Nominal;
                let text = `${roundedAmount} ${result.Name} = ${fullAmount.toFixed(2)} Рублей`;
                document.getElementById('convertedAmountInfo').innerText = text;
            } else {
                showHideModal('hide', 'modalConvertedAmount')
                return;
            }
        } else {
            document.getElementById('convertedAmountInfo').innerText = 'Пожалуйста, заполните все поля.';
        }

    } catch (error) {
        alert('Ошибка: ' + error);
    }
    isLoading(false);
};

async function makeFetchRequest(date, currency, previousResultString = '{}', numIteration = 0) {
    console.time('makeFetchRequest');
    const Address = 'https://www.cbr-xml-daily.ru/';
    let maxItteration = 30;
    if (maxItteration < numIteration) {
        alert('Максимальное колличество запросов!');
        return {}
    };
    let iteration = numIteration === undefined ? 1 : numIteration + 1;
    let day = leftFillNum(date.getDate(), 2);
    let month = leftFillNum(date.getMonth() + 1, 2);
    let year = leftFillNum(date.getFullYear(), 4);
    let response = await fetch(`${Address}archive/${year}/${month}/${day}/daily_json.js`)
        .then(res => res.json())
        .then(res => res.Valute[currency])
        .catch(() => {
            if (previousResultString !== '{}') {
                return JSON.parse(previousResultString);
            };
            let lastDate = new Date(date.getTime());
            lastDate.setDate(date.getDate() - 1);
            return makeFetchRequest(lastDate, currency, previousResultString, iteration);
        });
    console.timeEnd('makeFetchRequest');
    return response;
};

function leftFillNum(num, targetLength) {
    return num.toString().padStart(targetLength, "0");
}

function showHideModal(action, id) {
    if (action === 'hide') {
        let element = document.getElementById(id);
        let modal = bootstrap.Modal.getInstance(element);
        modal.hide();
    };
    
    if (action === 'show') {
        let element = document.getElementById(id);
        let modal = bootstrap.Modal.getOrCreateInstance(element);
        modal.show();
    }
}

function isLoading(bool) {
    let loadingSpinner = document.getElementById('loading');
    if (bool) {
        loadingSpinner.className = "spinner-border position-absolute top-50 start-50";
    } else {
        loadingSpinner.className = 'spinner-border d-none';
    }
}

function setMaxDatesForInputs() {
    const inputIds = [
        'date-convert',
        'start-date-currency',
        'end-date-currency'
    ];
    inputIds.forEach((id) => {
        let element = document.getElementById(id);
        element.max = new Date().toISOString().split("T")[0];
    })
};
setMaxDatesForInputs();

function setPreventDefStopProp() {
    let forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopPropagation();
            form.classList.add('was-validated')
        })
    })
}
setPreventDefStopProp();