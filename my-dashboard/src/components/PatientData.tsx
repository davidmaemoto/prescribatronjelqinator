"use client"

import React, { useState } from "react"
import { 
  Menu, MenuItem, IconButton, Card, CardContent, Typography, Grid, Divider, TextField, Button
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { useNavigate, useLocation } from "react-router-dom"
import patientData from "../data/data.json"


export function PatientData() {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const patientId = location.state?.patientId

  const patient = patientData[patientId]

  const onLogout = () => {
    navigate("/", { replace: true }) // Redirect to Login and clear state
  }

  const patientKeys = Object.keys(patient)

  // get value for Object key = "demographics"
  const demographics = patient["demographics"][0]

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  const handleQuerySubmit = async (query: string, patientId: string) => {
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("https://6c63-2607-f6d0-ced-5bb-4c9d-c83c-8fd1-3cf9.ngrok-free.app/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "patient_id": patientId,
          "query": query,
        }),
      });
      const data = await res.json();
      setResponse(data.answer);
    } catch (error) {
      setResponse("Error fetching response");
    } finally {
      setLoading(false);
    }
  };

  


  return (
    <>
      {/* Dropdown Menu Button in the Top Left */}
      <IconButton 
        onClick={handleMenuOpen} 
        sx={{ position: "absolute", top: 10, left: 10 }}
      >
        <MenuIcon fontSize="large" />
      </IconButton>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuClose()}>Home</MenuItem>
        {patientKeys.filter(key => !["demographics", "procedures", "pathology_report", "radiology_report", "med_admin", "med_orders"].includes(key)).map((key, index) => {
          let displayKey = key
          let path = `/${key}`

          if (key === "clinical_note") {
            displayKey = "Patient Notes"
            path = "/patient-notes"
          } else if (key === "diagnoses") {
            displayKey = "Diagnoses"
            path = "/diagnoses"
          }
          else if (key === "immunization") {
            displayKey = "Immunizations"
            path = "/immunizations"
          }
          else if (key === "labs") {
            displayKey = "Labs"
            path = "/labs"
          } else if (key === "orders_and_ordersets") {
            displayKey = "Orders"
            path = "/orders"
          }

          return (
            <MenuItem 
              key={index} 
              onClick={() => { 
          navigate(path, { state: { patientId: demographics.patient_id } }) 
          handleMenuClose()
              }}
            >
              {displayKey}
            </MenuItem>
          )
        })}
        <MenuItem 
          onClick={() => {
            onLogout()
            handleMenuClose()
          }} 
          sx={{ color: "red", fontWeight: "bold" }}
        >
          Logout
        </MenuItem>
      </Menu>

      {/* Home Page - Patient Info */}
      <Card 
        sx={{ 
          maxWidth: 800, 
          margin: "80px auto", 
          padding: 3, 
          borderRadius: 4, 
          boxShadow: 3 
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Patient Information
          </Typography>
          
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* Personal Details */}
            <Grid item xs={6}>
              <Typography fontWeight="bold">Patient ID:</Typography> {demographics.patient_id}
              <Typography fontWeight="bold">Legal Sex:</Typography> {demographics.legal_sex}
              <Typography fontWeight="bold">Date of Birth:</Typography> {demographics.date_of_birth}
              <Typography fontWeight="bold">Marital Status:</Typography> {demographics.marital_status}
              <Typography fontWeight="bold">Language:</Typography> {demographics.language}
            </Grid>

            {/* Health & Medical Info */}
            <Grid item xs={6}>
              <Typography fontWeight="bold">Recent Height (cm):</Typography> {demographics.recent_height_cm}
              <Typography fontWeight="bold">Recent Weight (kg):</Typography> {demographics.recent_weight_kg}
              <Typography fontWeight="bold">Recent BMI:</Typography> {demographics.recent_bmi}
              <Typography fontWeight="bold">Smoking History:</Typography> {demographics.smoking_hx.toString().split("-")[1]}
              <Typography fontWeight="bold">Alcohol Use:</Typography> {demographics.alcohol_use.toString().split(";")[1]}
            </Grid>

            {/* Insurance Details */}
            <Grid item xs={12}>
              <Typography fontWeight="bold">Insurance Name:</Typography> {demographics.insurance_name}
              <Typography fontWeight="bold">Insurance Type:</Typography> {demographics.insurance_type}
            </Grid>

          </Grid>
        </CardContent>
      </Card>
      {/* AI Chat Interface */}
      <Card sx={{ maxWidth: 800, margin: "20px auto", padding: 3, borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            AI Assistant
          </Typography>
          <TextField
            fullWidth
            label="Ask about the patient"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={() => handleQuerySubmit(query, patientId)} disabled={loading}> 
            {loading ? "Processing..." : "Ask AI"}
          </Button>
          {response && (
            <Typography sx={{ mt: 2 }}>
              <strong>Response:</strong> {response}
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  )
}
