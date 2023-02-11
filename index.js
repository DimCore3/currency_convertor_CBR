"use strict";

const modalBackground = document.getElementsByClassName('modalBackground')[0];
const allModalForms = document.getElementsByClassName('modalForm');
const modalRoot = document.getElementsByClassName('modalRoot');
const formCurrency = document.getElementById('modalFormCurrency');
const formConvert = document.getElementById('modalFormConvert');

const getCurrency = async (element) => {
    if (element.from.value && element.to.value && element.from.value < element.to.value) {
        closeModal();
        const startDate = new Date(element.from.value);
        const endDate = new Date(element.to.value);
        const currency = element.currency.value;
        const table = document.createElement('table');
        let currencyInfoBox = document.getElementById('currencyInfoBox');
        currencyInfoBox.removeChild(currencyInfoBox.firstElementChild)
        currencyInfoBox.appendChild(table);
        currencyInfoBox.style.display = 'flex';
        addRow(table, 'Дата', 'Валюта', 'Курс');
        
        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
            let result = await getCurrencyList(date.toLocaleDateString(), currency);
            if (Object.keys(result).length !== 0) {
                addRow(table, date.toLocaleDateString(), currency, (result.Value / result.Nominal).toFixed(2))
            }
        }

    } else {
        alert('Введите корректные данные');
    }
};

const addRow = (table, date, currency, amount) => {
    let tr = document.createElement('tr');
    let tdDate = document.createElement('td');
    let tdCurrency = document.createElement('td');
    let trAmount = document.createElement('td');
    table.appendChild(tr);                
    tr.appendChild(tdDate);
    tr.appendChild(tdCurrency);
    tr.appendChild(trAmount);
    tdDate.innerText = date;
    tdCurrency.innerText = currency;
    trAmount.innerText = amount;
}

const convert = async (element, btnId) => {
    try {
        if (element.date.value && element.amount.value) {
            const { date, currency, amount } = element;
            const dateValue = new Date(date.value).toLocaleDateString();
            const currencyValue = currency.value;
            const amountValue = amount.value;
            let result = await getCurrencyList(dateValue, currencyValue);
            
            if (Object.keys(result).length !== 0) {
                const fullAmount = (result.Value * amountValue) / result.Nominal;
                document.getElementById('convertedAmountInfo').innerText = `${amountValue} ${result.Name} = ${fullAmount.toFixed(2)} RUB`;  
                closeModal();
                openModal(btnId);  

            } else {
                alert('Информация на ' + dateValue + ' отсутствует.')
            }
        } else {
            alert('Пожалуйста, заполните все поля.')
        }

    } catch (error) {        
        alert('Ошибка: ' + error);
    }
};

// API тупит или есть ограничения, не всегда сразу отдаёт ответ
async function getCurrencyList(date, currency) {
    const [day, month, year] = date.split('.');
    try {
        const response = await fetch(`https://www.cbr-xml-daily.ru/archive/${year}/${month}/${day}/daily_json.js`)
            .then(res => res.json())
            .catch(error => console.log('error: ', error));
        return response.Valute[currency];

    } catch (error) {   
        return {}
    }
}

const getModalByBtnId = (btnId) => {
    const btnsForModalElements = [
        {btn: 'btnOpenCurrency', modal: 'modalCurrency'},
        {btn: 'btnOpenConvert', modal: 'modalConvert'},
        {btn: 'btnOpenConvertedAmount', modal: 'modalConvertedAmount'},
    ];

    for (let element of btnsForModalElements) {
        if (element.btn === btnId) {
            return document.getElementById(element.modal)
        }
    }
} 

const openModal = (btnId) => {
    setDisplayFlexOrNone(modalBackground);
    setDisplayFlexOrNone(getModalByBtnId(btnId));
};

const closeModal = () => {
    setDisplayFlexOrNone(modalBackground);
    for (let element of modalBackground.children) {
        element.style.display = 'none';
    }
};

const setDisplayFlexOrNone = (element) => {
    element.style.display = element.style.display === 'none' || element.style.display === '' ?  'flex' : 'none';
}
 
const addListeners = () => {
    modalBackground.addEventListener('click', (event) => {
        setDisplayFlexOrNone(event.target);
        for (let element of event.target.children) {
            element.style.display = 'none';
        }
    })

    for (let element of allModalForms) {
        element.addEventListener('click', (event) => {
            event.preventDefault();
        });
    }
    
    for (let element of modalRoot) {
        element.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
};

addListeners();