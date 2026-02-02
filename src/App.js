import { useState } from 'react';
import './App.css';

const URL = 'http://localhost:5001/tax-calculator';

function App() {
  const [taxYear, setTaxYear] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [tax, setTax] = useState(null);

  // handling api states - error / loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateProgressiveTax = (income, brackets) => {
    let totalTax = 0;

    for (const bracket of brackets) {
      // income should be greater than bracket min otherwise break unnecesary loop
      if (income <= bracket.min) break;

      // case 1: it has max
      // case 2: it doesn't have max, so it will be income
      const upperLimit = bracket.max ?? income;
      // don't tax more than you earned then substract to tax the portion inside this bracket
      const taxableAmount = Math.min(income, upperLimit) - bracket.min;

      totalTax += taxableAmount * bracket.rate;
    }

    return totalTax;
  }

  const handleOnCalculate = async (ev) => {
    ev.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${URL}/tax-year/${taxYear}`);

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      const incomeNum = Number(annualIncome);

      const calculatedTax = calculateProgressiveTax(
        incomeNum,
        data.tax_brackets
      );

      setTax(calculatedTax);
    } catch (err) {
      setError(err.message);
      setTax(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="App">
      <form onSubmit={handleOnCalculate}>
        <div>
          <label htmlFor="annualIncome">Anual income:</label><br />
          <input
            type="text"
            id="annualIncome"
            name="annualIncome"
            placeholder="Enter your annual income"
            value={annualIncome}
            onChange={(ev) => setAnnualIncome(ev.target.value)}
          />
        </div>
        <br /><br />
        <div>
          <label htmlFor="taxYear">Tax year:</label><br />
          <input
            type="text"
            id="taxYear"
            name="taxYear"
            placeholder="Enter your tax year"
            value={taxYear}
            onChange={(ev) => setTaxYear(ev.target.value)}
          />
        </div>
        <br /><br />
        <button type="submit" disabled={loading || !taxYear || !annualIncome}>
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </form>

      {error && <p className="App-error">{error}</p>}

      {
        tax !== null && (
          <>
            <p>
              Total tax owed: {" "}
              <strong>${tax.toFixed(2)}</strong>
            </p>
            <p>
              Effective tax rate: {" "}
              <strong>{((tax / annualIncome) * 100).toFixed(2)}%</strong>
            </p>
          </>
        )
      }
    </div>
  );
}

export default App;
