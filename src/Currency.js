// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

import {useEffect, useState} from "react";

export default function Currency() {
    const [input, setInput] = useState(1)
    const [firstCurrency, setFirstCurrency] = useState("EUR")
    const [secondCurrency, setSecondCurrency] = useState("USD")
    const [convertedData, setConvertedData] = useState("")


    useEffect(() => {
        async function getCurrencyData() {
            if (firstCurrency === secondCurrency) return

            const res = await fetch(`https://api.frankfurter.app/latest?amount=${input}&from=${firstCurrency}&to=${secondCurrency}`);
            const data = await res.json()
            const final = data.rates[secondCurrency]
            setConvertedData(final)


        }

        getCurrencyData()
    }, [input, firstCurrency, secondCurrency]);
    return (
        <div>
            <input type="text" value={input} onChange={(e) => setInput(Number(e.target.value))}/>
            <select value={firstCurrency} onChange={e => setFirstCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="INR">INR</option>
                <option value="CHF">CHF</option>
            </select>
            <select value={secondCurrency} onChange={e => setSecondCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="INR">INR</option>
                <option value="CHF">CHF</option>
            </select>
            <p>{convertedData}</p>
        </div>
    );
}