import { useState } from "react";
import axios from "axios";
import "./Vitals.css";

export default function Vitals() {
  const [form, setForm] = useState({
    height: "",
    weight: "",
    systolic: "",
    diastolic: "",
    bloodSugar: "",
  });

  const [bmiResult, setBmiResult] = useState(null);
  const [bpResult, setBpResult] = useState(null);
  const [sugarResult, setSugarResult] = useState(null);
  const [openCard, setOpenCard] = useState(null);

  const userId = localStorage.getItem("userId");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const evaluateBMI = () => {
  const h = parseFloat(form.height) * 0.3048; // feet to meters
  const w = parseFloat(form.weight);
  if (h && w) {
    const bmi = (w / (h * h)).toFixed(1);
    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 24.9) category = "Normal";
    else if (bmi < 29.9) category = "Overweight";
    else category = "Obese";
    setBmiResult(`BMI: ${bmi} – ${category}`);
  }
};

  const evaluateBP = () => {
    const { systolic, diastolic } = form;
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    if (sys && dia) {
      if (sys < 120 && dia < 80) setBpResult("Blood Pressure: Normal");
      else if (sys < 130 && dia < 80) setBpResult("Elevated BP");
      else setBpResult("High Blood Pressure");
    }
  };

  const evaluateSugar = () => {
    const sugar = parseFloat(form.bloodSugar);
    if (sugar) {
      if (sugar < 100) setSugarResult("Blood Sugar: Normal (Fasting)");
      else if (sugar < 125) setSugarResult("Prediabetic Range");
      else setSugarResult("Diabetic Range");
    }
  };

  const handleCheck = (e) => {
    e.preventDefault();
    evaluateBMI();
    evaluateBP();
    evaluateSugar();
  };

  const handleSubmit = async () => {
  console.log("handleSubmit triggered ✅");

  const { height, weight, systolic, diastolic, bloodSugar } = form;
  if (!height || !weight || !systolic || !diastolic || !bloodSugar) {
    alert("Please fill in all vitals before saving.");
    return;
  }

  const h = parseFloat(height) * 0.3048;
const w = parseFloat(weight);
const bmi = parseFloat((w / (h * h)).toFixed(1));
  const bloodPressure = `${systolic}/${diastolic}`;

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  console.log("Submitting vitals:", {
    userId,
    height: parseFloat(height),
    weight: parseFloat(weight),
    bmi,
    bloodPressure,
    bloodSugar: parseFloat(bloodSugar)
  });

  try {
    await axios.post("http://localhost:5000/api/vitals", {
      userId,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi,
      bloodPressure,
      bloodSugar: parseFloat(bloodSugar)
    });
    alert("Vitals saved!");
  } catch (err) {
    console.error("Save error:", err);
    alert("Failed to save vitals.");
  }
};


  const handleOpenCard = (card) => {
    setOpenCard(openCard === card ? null : card);
  };

  return (
    <div className="vitals-wrapper">
      <div className="vitals-page">
        <h1>Vitals Checker</h1>
        <div className="card-group">
          <div className="vitals-card" onClick={() => handleOpenCard("bmi")}>
            <h3>Check BMI</h3>
          </div>
          <div className="vitals-card" onClick={() => handleOpenCard("sugar")}>
            <h3>Check Sugar Levels</h3>
          </div>
          <div className="vitals-card" onClick={() => handleOpenCard("bp")}>
            <h3>Check BP Levels</h3>
          </div>
        </div>

        <form className="vitals-form" onSubmit={handleCheck}>
          {/* BMI */}
          <div className="input-section" style={{ display: openCard === "bmi" ? "block" : "none" }}>
  <input
    type="number"
    name="height"
    value={form.height}
    onChange={handleChange}
    placeholder="Height (feet)"
    step="any"
  />
  <input
    type="number"
    name="weight"
    value={form.weight}
    onChange={handleChange}
    placeholder="Weight (kg)"
    step="any"
  />
  {bmiResult && <p className="result">{bmiResult}</p>}
</div>

          {/* Sugar */}
          <div className="input-section" style={{ display: openCard === "sugar" ? "block" : "none" }}>
            <input
              type="number"
              name="bloodSugar"
              value={form.bloodSugar}
              onChange={handleChange}
              placeholder="Blood Sugar (mg/dL)"
            />
            {sugarResult && <p className="result">{sugarResult}</p>}
          </div>

          {/* BP */}
          <div className="input-section" style={{ display: openCard === "bp" ? "block" : "none" }}>
            <input
              type="number"
              name="systolic"
              value={form.systolic}
              onChange={handleChange}
              placeholder="Systolic (Upper)"
            />
            <input
              type="number"
              name="diastolic"
              value={form.diastolic}
              onChange={handleChange}
              placeholder="Diastolic (Lower)"
            />
            {bpResult && <p className="result">{bpResult}</p>}
          </div>

          {openCard && (
            <>
              <button type="submit" className="btn-save">Check</button>
              <button type="button" className="btn-save" onClick={handleSubmit} style={{ marginTop: "10px" }}>
                Save Vitals
              </button>
            </>
          )}
        </form>

        {openCard && (
          <div className="health-tip">
            {openCard === "bmi" && <p><strong>💡 BMI Tip:</strong> A BMI between 18.5 and 24.9 is considered healthy.</p>}
            {openCard === "sugar" && <p><strong>💡 Sugar Tip:</strong> Fasting sugar below 100 is normal. Avoid excess sweets.</p>}
            {openCard === "bp" && <p><strong>💡 BP Tip:</strong> Normal BP is below 120/80. Exercise and reduce salt intake.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
