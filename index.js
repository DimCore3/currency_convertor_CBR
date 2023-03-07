"use strict";

async function getCurrency(fromDate, toDate, currency) {
    isLoading(true);
    if (isDataCorrect(fromDate, toDate)) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        const myModal = document.getElementById('modalCurrency');
        const modal = bootstrap.Modal.getInstance(myModal);
        modal.hide();
        const currencyInfoBox = document.getElementById('currencyInfoBox');
        currencyInfoBox.className = 'd-block d-flex'
        currencyInfoBox.style.overflow = 'scroll';
        currencyInfoBox.style.maxHeight = '80vh';
        const tbody = document.createElement('tbody');
        const newTable = document.getElementById('curTable');
        newTable.removeChild(newTable.lastElementChild)
        
        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
            let result = await getCurrencyList(date, currency);
            
            if (Object.keys(result).length !== 0) {
                newAddRow(tbody, date.toLocaleDateString(), currency, (result.Value / result.Nominal).toFixed(4));
                
            } else {
                return;
            }
        };
        newTable.appendChild(tbody);
    }
    isLoading(false);
};

function isLoading(bool) {
    let loadingSpinner = document.getElementById('loading');
    if (bool) {
        loadingSpinner.className = 'spinner-border position-absolute top-50 start-50'
    } else {
        loadingSpinner.className = 'spinner-border d-none'
    };
}

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

function newAddRow(tbody, date, currency, amount) {
    const dataList = [date, currency, amount];
    var template = document.querySelector('#productrow');
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