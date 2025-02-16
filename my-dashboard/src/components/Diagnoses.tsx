"use client"

import React from "react"
import { Card, CardContent, Typography, Divider, IconButton, Menu, MenuItem } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import patientData from "../data/data.json"
import { useLocation, useNavigate } from "react-router-dom"

//  onLogout function


export function Diagnoses() {
    const location = useLocation()
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    
    // Retrieve patientId from state
    const patientId = location.state?.patientId
  
    if (!patientId) {
      navigate("/")
      return null
    }
    const onLogout = () => {
        navigate("/", { replace: true }) // Redirect to Login and clear state
      }

  // Extract clinical notes from patient data
  const patient = patientData[patientId]
  const patientKeys = Object.keys(patient)
  const diagnoses = (patient["diagnoses"] || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }
  
    const handleMenuClose = () => {
        setAnchorEl(null)
    }

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
        <MenuItem onClick={() => {
          navigate("/patient-data", { state: { patientId: patientId } })
          handleMenuClose()
        }
        }>Home</MenuItem>
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
          navigate(path, { state: { patientId: patientId } }) 
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

    <Card sx={{ maxWidth: 800, margin: "80px auto", padding: 3, borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Diagnosis Notes
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {diagnoses.length > 0 ? (
          diagnoses.map((note: any, index: number) => (
            <Card key={index} sx={{ mb: 2, padding: 2, borderRadius: 2, boxShadow: 1 }}>
              <Typography fontWeight="bold">Patient ID:</Typography> {note.patient_id}
                <Typography fontWeight="bold">Date:</Typography> {new Date(note.date).toISOString().split("T")[0]}
                <Typography fontWeight="bold">Age:</Typography> {note.age} years
                <Typography fontWeight="bold">Type:</Typography> {note.type}
                <Typography fontWeight="bold">Source:</Typography> {note.source}
                <Typography fontWeight="bold">ICD-9 Code:</Typography> {note.icd9_code || "N/A"}
                <Typography fontWeight="bold">ICD-10 Code:</Typography> {note.icd10_code || "N/A"}
                <Typography fontWeight="bold">Description:</Typography> {note.description}
                <Typography fontWeight="bold">Performing Provider:</Typography> {note.performing_provider || "Unknown"}
            </Card>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No diagonis notes available.
          </Typography>
        )}
      </CardContent>
    </Card>
    </>
  )
}
