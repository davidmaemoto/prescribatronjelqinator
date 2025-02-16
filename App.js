import React, { useState } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { Login } from "./components/Login.tsx"
import { PatientData } from "./components/PatientData.tsx"
import { PatientNotes } from "./components/PatientNotes.tsx"
import { Diagnoses } from "./components/Diagnoses.tsx"
import {Orders} from "./components/Orders.tsx"
import {Immunizations} from "./components/Immunizations.tsx"
import {Labs} from "./components/Labs.tsx"

function App() {
  const [patient, setPatient] = useState(null)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/patient-data" element={<PatientData />} />
        <Route path="/patient-notes" element={<PatientNotes />} />
        <Route path="/diagnoses" element={<Diagnoses />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/immunizations" element={<Immunizations />} />
        <Route path="/labs" element= {<Labs />} />
      </Routes>
    </Router>
  )
}

export default App
