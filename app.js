const button = document.getElementById('send');
const input = document.getElementById('count');
button.onclick = changeCountTraders;
window.onload = addButtons;

function addButtons() {
    fetch('/puppeteer',
        {
            method: 'GET',
        })
        .then((res) => {
            return res.json();
        }).then((res) => {
            let elementId = document.getElementById('hr');
            let div = document.createElement('div');
            div.setAttribute('id', 'buttonsDiv');
            insertAfter(elementId, div);

            elementId = document.getElementById('buttonsDiv');
            elementId.setAttribute('class', 'generatedButtonDiv');
            elementId.innerHTML = '<p id=\'forButtons\' ></p>';
            elementId = document.getElementById('forButtons');

            res.forEach(function (m) {
                let buttonsDiv = document.createElement('button');
                buttonsDiv.setAttribute('class', 'generatedButton');
                buttonsDiv.setAttribute('onclick', 'downloadFile(\'' + m + '\')');
                buttonsDiv.setAttribute('id', m);
                buttonsDiv.innerHTML = m;
                insertAfter(elementId, buttonsDiv);
                elementId = document.getElementById(m);
            })
        });
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function changeCountTraders() {
    const body = JSON.stringify({
        data: input.value,
    });
    fetch('/createUrl',
        {
            method: 'POST',
            body: body
        }).then((res) => {
            return res.json();
        }).then((res) => {
        });
}

function downloadFile(number) {
    const body = JSON.stringify({
        data: number,
    });
    fetch('/downloadFile',
        {
            method: 'POST',
            body: body
        }).then((res) => {
            return res.json();
        }).then((res) => {
            let a = document.createElement('a');
            a.setAttribute('href','/downloadFile');
            a.setAttribute('id', 'toDel');
            a.setAttribute('download',res.substr(14));
            onload = a.click();
        })
}
