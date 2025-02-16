"use client"

import React, { useState } from "react"
import { Box, TextField, Button, Typography, Paper, CircularProgress, Checkbox, FormControlLabel } from "@mui/material"
import patientData from "../data/data.json"
import { useNavigate } from "react-router-dom"


export function Login() {
  const [patientId, setPatientId] = useState("")
  const [error, setError] = useState("")
  // navigate to the next page: PatientData.tsx
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const trainRAG = async (patientID) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/get_patient?patient_id=${patientID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Error training RAG:", error);
    }
  };

  // navigate to the next page: PatientData.tsx
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    try {
      const patient = patientData[patientId]
      if (patient) {
        await trainRAG(patientId);
        navigate("/patient-data", { state: { patientId: patientId} })
      } else {
        setError("Invalid Patient ID")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg,rgb(206, 136, 221) 0%,rgb(138, 181, 255) 100%)", // Aesthetic gradient
      }}
    >
      <Paper
        elevation={5}
        sx={{
          p: 5,
          maxWidth: 400,
          borderRadius: 3,
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.2)", // Soft transparent effect
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Search Patients
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Enter a Patient ID to continue
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Patient ID"
            variant="outlined"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            margin="normal"
            required
            InputProps={{
              sx: {
                color: "black",
                borderRadius: "30px",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.8)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 1)",
                },
              },
            }}
            InputLabelProps={{ sx: { color: "black" } }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1.1rem",
              borderRadius: "30px",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              color: "black",
              transition: "0.3s",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
          </Button>
          {error && (
            <Typography color="error" sx={{ mt: 2, fontWeight: "bold" }}>
              {error}
            </Typography>
          )}
        </form>
      </Paper>
    </Box>
  )
}
