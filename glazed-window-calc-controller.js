let isPriceDisplayed = false;
let currentGlass = []

//Renders a div and inserts the submitted form values
function addGlass() {
    const data = $('#glass-size').serializeArray()
    if (data[0].value >= 1 && 2000 >= data[1].value >= 100 && 2000 >= data[2].value >= 100) {
        currentGlass.push(data)
        let nodeString = `Antal: ${data[0].value}\tGlasbredd: ${data[1].value}\tGlashöjd: ${data[2].value}`

        const finalDiv = document.getElementById("div1");
        const infoDiv = document.createElement("div");

        const newContent = document.createTextNode(nodeString);
        const removalBtn = document.createElement("button");
        removalBtn.setAttribute("style", "margin-left: 0.5em;")
        removalBtn.innerText = "-"

        infoDiv.setAttribute("style", "margin-top: 0.3em")
        infoDiv.appendChild(newContent);
        infoDiv.appendChild(removalBtn)
        finalDiv.appendChild(infoDiv)
        updateIds()
        calcPrice()
    } else {
        alert("Du har fyllt i felaktiga värden, max bredd och höjd: 2000")
    }
}

//Calculates the sum of the elements in the #div1 and renders a price in #div2
function calcPrice() {
    const collectionPrice = 190
    let totalPrice = 0;
    let totalSqr = 0;
    const energyType = $('#energy_type').serializeArray()
    const typeData = getGlassTypeData($('#glass-type').serializeArray()[0].value)

    for (glass of currentGlass) {
        let sqr = 0
        let glassWidth = glass[1].value / 1000
        let glassHeight = glass[2].value / 1000
        let glassAmount = parseInt(glass[0].value)
        if ((glassWidth * glassHeight) < 0.5) {
            sqr = 0.5
        } else {
            sqr = glassWidth * glassHeight;
        }
        totalSqr += sqr
        totalPrice += getGlassPrice(sqr, typeData, energyType, glassAmount)
    }
    totalPrice += collectionPrice

    if (isPriceDisplayed) {
        let temp = document.querySelector('#div2')
        removeAllChildNodes(temp)
    }

    //Removes the collectionprice in case no glass has been added to the list
    if (currentGlass.length === 0) {
        totalPrice = 0;
    }

    const newDiv = document.createElement("div");
    const finalDiv = document.getElementById("div2");
    const newPriceHeader = document.createElement("h3")
    const newDiv1 = document.createElement("div")
    const newDiv2 = document.createElement("div")
    const newDeliveryHeader = document.createElement("h3")
    const newParagraph1 = document.createElement("p");
    const newContent = document.createTextNode(`Hämtpris: ${Math.round(totalPrice)} kr. ${typeData.type}`);
    const div2Text = document.createTextNode("Detta pris är inklusive moms och gäller vid hämtning i Kalmar.")

    newDiv.setAttribute("id", "price")
    newDeliveryHeader.innerHTML = `Beställ och hämta vecka ${getDeliveryWeek(typeData)}`
    newParagraph1.innerHTML = 'Eller mejla för leveranspris.'

    newDiv.appendChild(newContent);
    newDiv1.appendChild(newDeliveryHeader)
    newDiv1.appendChild(newParagraph1);
    newDiv2.appendChild(div2Text);
    newPriceHeader.appendChild(newDiv)

    finalDiv.appendChild(newPriceHeader)
    finalDiv.appendChild(newDiv2);
    finalDiv.appendChild(document.createElement("br"))
    finalDiv.appendChild(newDiv1)
    isPriceDisplayed = true;
}

function getDeliveryWeek(glassType) {
    const date = new Date
    let time = date.getWeek() + glassType.deliveryTimeWeeks
    return time
}

Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
}

//Toggles the radio button for "Dubbelenergi" depending on whether "2-glas" or "3-glas" is selected
async function toggleRadio() {
    const DoubleEnergyRadio = document.getElementById("double_energy");
    const EnergyRadio = document.getElementById("energy");
    DoubleEnergyRadio.disabled = !DoubleEnergyRadio.disabled;
    if (DoubleEnergyRadio.disabled && DoubleEnergyRadio.checked) {
        EnergyRadio.checked = true
    }
}

function getGlassPrice(sqr, typeData, energyType, amount) {
    const energyLevel = energyType[0].value
    let total = 0;
    if (energyLevel === "no-energy") {
        total = (sqr * typeData.sqrPrice)
    } else if (energyLevel === "energy") {
        total = (sqr * (typeData.sqrPrice + typeData.energy))
    } else if (energyLevel === "double_energy") {
        total = (sqr * (typeData.sqrPrice + typeData.double_energy))
    }
    total *= amount;
    return Math.round(total);
}

function getGlassTypeData(type) {
    switch (type) {

        case "D4-12":
            return {
                "type": "2-glas",
                "sqrPrice": 690,
                "no-energy": 0,
                "energy": 200,
                "deliveryTimeWeeks": 2
            }

        case "T4-12":
            return {
                "type": "3-glas",
                "sqrPrice": 890,
                "no-energy": 0,
                "energy": 200,
                "double_energy": 400,
                "deliveryTimeWeeks": 2
            }
    }
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function clearList() {
    removeAllChildNodes(document.getElementById('div1'));
    removeAllChildNodes(document.getElementById('div2'));
    isPriceDisplayed = false;
    currentGlass = []
    calcPrice()
}

function removeSpecific(removalIndex) {
    currentGlass.splice(removalIndex, 1);
    document.getElementById(`glassDiv${removalIndex}`).remove();
    updateIds()
    calcPrice()
}

function updateIds() {
    let elements = document.getElementById("div1");
    let children = elements.children;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        child.setAttribute("id", `glassDiv${i}`)
        child.lastChild.setAttribute("id", `removeBtn${i}`)
        child.lastChild.setAttribute("onclick", `removeSpecific(${i})`)
    }
}
