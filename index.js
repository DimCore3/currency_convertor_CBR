"use strict";

const modalBackground = document.getElementsByClassName('modalBackground')[0];
const formCurrency = document.getElementById('modalFormCurrency');
const formConvert = document.getElementById('modalFormConvert');

async function getCurrency(fromDate, toDate, currency) {

    if (isDataCorrect(fromDate, toDate)) {
        const myModal = document.getElementById('modalCurrency')
        const modal = bootstrap.Modal.getInstance(myModal);
        modal.hide();
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        table.appendChild(thead);
        table.appendChild(tbody);
        table.className = 'table table-striped';
        const currencyInfoBox = document.getElementById('currencyInfoBox');
        currencyInfoBox.removeChild(currencyInfoBox.firstElementChild)
        currencyInfoBox.appendChild(table);
        currencyInfoBox.style.display = 'flex';
        currencyInfoBox.style.overflow = 'scroll';
        currencyInfoBox.style.maxHeight = '80vh';
        addRow('th', thead, 'Дата', 'Валюта', 'Курс');

        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
            let result = await getCurrencyList(date, currency);

            if (Object.keys(result).length !== 0) {
                addRow('td', tbody, date.toLocaleDateString(), currency, (result.Value / result.Nominal).toFixed(4));

            } else {
                return;
            }
        };
    }
};

function isDataCorrect(fromDate, toDate) {
    if (fromDate && toDate) {
        if (fromDate <= toDate) {
            return true;
        } else {
            alert('Диапазон дат указан некорректно!')
        }
    }
    return false;
}

function addRow(type, tbody, date, currency, amount) {
    const dataList = [date, currency, amount];
    const tr = document.createElement('tr');
    tbody.appendChild(tr);
    dataList.forEach((data) => {
        const element = document.createElement(type);
        tr.appendChild(element);
        element.innerText = data;
    });
}

async function convert(date, currency, amount) {
    try {
        document.getElementById('convertedAmountInfo').innerText = `Загрузка...`;
        let dateNow = new Date();
        let fullDate = new Date(date);
        let roundedAmount = Number(amount).toFixed(2);

        if (date && roundedAmount && amount && currency && dateNow > fullDate && Number(roundedAmount) === Number(amount)) {
            const currentModalConvert = document.getElementById('modalConvert');
            const currentModal = bootstrap.Modal.getInstance(currentModalConvert);
            currentModal.hide();

            const convertedAmountModal = document.getElementById('modalConvertedAmount');
            const newModal = bootstrap.Modal.getOrCreateInstance(convertedAmountModal);
            newModal.show();

            const dateValue = new Date(date);
            let result = await getCurrencyList(dateValue, currency);
            if (Object.keys(result).length !== 0) {
                const fullAmount = (result.Value * roundedAmount) / result.Nominal;
                let text = `${roundedAmount} ${result.Name} = ${fullAmount.toFixed(2)} Рублей`;
                document.getElementById('convertedAmountInfo').innerText = text;
            } else {
                newModal.hide();
                return;
            }
        } else {
            document.getElementById('convertedAmountInfo').innerText = 'Пожалуйста, заполните все поля.';
        }

    } catch (error) {
        alert('Ошибка: ' + error);
    }
};

async function getCurrencyList(date, currency, numItteration) {
    let maxItteration = 30;
    if (maxItteration < numItteration) {
        alert('Максимальное колличество запросов!');
        return {}
    }
    let itteration = numItteration;
    if (itteration === undefined) {
        itteration = 1;
    } else {
        itteration = itteration + 1;
    };

    try {
        const day = leftFillNum(date.getDate(), 2);
        const month = leftFillNum(date.getMonth() + 1, 2);
        const year = leftFillNum(date.getFullYear(), 4);

        const response = await fetch(`https://www.cbr-xml-daily.ru/archive/${year}/${month}/${day}/daily_json.js`)
            .then(res => res.json())
        return response.Valute[currency];

    } catch (error) {
        const newDate = new Date(date.getTime());
        newDate.setDate(date.getDate() - 1);
        return await getCurrencyList(newDate, currency, itteration);
    }
};

function leftFillNum(num, targetLength) {
    return num.toString().padStart(targetLength, "0");
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
}
setMaxDatesForInputs();

function setPreventDefStopProp() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopPropagation();
            form.classList.add('was-validated')
        })
    })
}
setPreventDefStopProp();