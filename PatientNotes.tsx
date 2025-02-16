"use client"

import React from "react"
import { 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  IconButton, 
  Menu, 
  MenuItem,
  Box // <-- ADDED
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import patientData from "../data/data.json"
import { useLocation, useNavigate } from "react-router-dom"

//  onLogout function

export function PatientNotes() {
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
  const clinicalNotes = (patient["clinical_note"] || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
  const pathologyReports = (patient["pathology_report"] || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
  const radiologyReports = (patient["radiology_report"] || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

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
        }}>
          Home
        </MenuItem>

        {patientKeys.filter(key => !["demographics", "procedures", "pathology_report", "radiology_report", "med_admin", "med_orders"].includes(key))
          .map((key, index) => {
            let displayKey = key
            let path = `/${key}`
            if (key === "clinical_note") {
              displayKey = "Patient Notes"
              path = "/patient-notes"
            } else if (key === "diagnoses") {
              displayKey = "Diagnoses"
              path = "/diagnoses"
            } else if (key === "immunization") {
              displayKey = "Immunizations"
              path = "/immunizations"
            } else if (key === "labs") {
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
          })
        }
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

      {/* Clinical Notes */}
      <Card sx={{ maxWidth: 800, margin: "80px auto", padding: 3, borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Clinical Notes
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
            {clinicalNotes.length > 0 ? (
              clinicalNotes.map((note: any, index: number) => (
                <Card
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Typography fontWeight="bold">Patient ID:</Typography> {note.patient_id}
                  <Typography fontWeight="bold">Date:</Typography> {new Date(note.date).toISOString().split("T")[0]}
                  <Typography fontWeight="bold">Age:</Typography> {note.age} years
                  <Typography fontWeight="bold">Type:</Typography> {note.type}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" sx={{ fontStyle: "italic", mt: 1 }}>
                    {note.text.replace("All dates have been shifted by a fixed per-patient offset for PHI masking Accession numbers and numeric identifiers have been replaced by plausible looking alternatives for PHI masking", "")}
                  </Typography>
                </Card>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                No clinical notes available.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Pathology Reports */}
      <Card sx={{ maxWidth: 800, margin: "80px auto", padding: 3, borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Pathology Reports
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
            {pathologyReports.length > 0 ? (
              pathologyReports.map((note: any, index: number) => (
                <Card
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Typography fontWeight="bold">Patient ID:</Typography> {note.patient_id}
                  <Typography fontWeight="bold">Date:</Typography> {new Date(note.date).toISOString().split("T")[0]}
                  <Typography fontWeight="bold">Age:</Typography> {note.age} years
                  <Typography fontWeight="bold">Type:</Typography> {note.type}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" sx={{ fontStyle: "italic", mt: 1 }}>
                    {note.text.replace("All dates have been shifted by a fixed per-patient offset for PHI masking Accession numbers and numeric identifiers have been replaced by plausible looking alternatives for PHI masking", "")}
                  </Typography>
                </Card>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                No pathology reports available.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Radiology Reports */}
      <Card sx={{ maxWidth: 800, margin: "80px auto", padding: 3, borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Radiology Reports
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
            {radiologyReports.length > 0 ? (
              radiologyReports.map((note: any, index: number) => (
                <Card
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Typography fontWeight="bold">Patient ID:</Typography> {note.patient_id}
                  <Typography fontWeight="bold">Date:</Typography> {new Date(note.date).toISOString().split("T")[0]}
                  <Typography fontWeight="bold">Age:</Typography> {note.age} years
                  <Typography fontWeight="bold">Type:</Typography> {note.type}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" sx={{ fontStyle: "italic", mt: 1 }}>
                    {note.text.replace("All dates have been shifted by a fixed per-patient offset for PHI masking Accession numbers and numeric identifiers have been replaced by plausible looking alternatives for PHI masking", "")}
                  </Typography>
                </Card>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                No radiology reports available.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  )
}
