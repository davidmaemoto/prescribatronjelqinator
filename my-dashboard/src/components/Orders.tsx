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

export function Orders() {
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
  const medAdmin = (patient["med_admin"] || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
  const medOrders = (patient["med_orders"] || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
  const ordersOrdersets = (patient["orders_and_ordersets"] || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

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

    {/* Medical Admin Notes */}
    <Card sx={{ maxWidth: 800, margin: "80px auto", padding: 3, borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Medical Admin Notes
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
          {medAdmin.length > 0 ? (
            medAdmin.map((note: any, index: number) => (
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
                <Typography fontWeight="bold">Medication:</Typography> {note.medication || "N/A"}
                <Typography fontWeight="bold">Line:</Typography> {note.line || "N/A"}
                <Typography fontWeight="bold">Taken Date:</Typography> {note.taken_date ? new Date(note.taken_date).toISOString().split("T")[0] : "N/A"}
                <Typography fontWeight="bold">Taken Date Age:</Typography> {note.taken_date_age || "N/A"} years
                <Typography fontWeight="bold">Taken Time:</Typography> {note.taken_time || "N/A"}
                <Typography fontWeight="bold">MAR Action:</Typography> {note.mar_action || "N/A"}
                <Typography fontWeight="bold">SIG:</Typography> {note.sig || "N/A"}
                <Typography fontWeight="bold">Route:</Typography> {note.route || "N/A"}
                <Typography fontWeight="bold">Site:</Typography> {note.site || "N/A"}
                <Typography fontWeight="bold">Infusion Rate:</Typography> {note.infusion_rate ? `${note.infusion_rate} ${note.infusion_rate_unit || ""}` : "N/A"}
                <Typography fontWeight="bold">Dose Unit:</Typography> {note.dose_unit || "N/A"}
                <Typography fontWeight="bold">MAR Duration:</Typography> {note.mar_duration ? `${note.mar_duration} ${note.mar_duration_unit || ""}` : "N/A"}
              </Card>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              No medical admin notes available.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>

    {/* Medical Order Reports */}
    <Card sx={{ maxWidth: 800, margin: "80px auto", padding: 3, borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Medical Order Reports
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
          {medOrders.length > 0 ? (
            medOrders.map((note: any, index: number) => (
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
                <Typography fontWeight="bold">Medication:</Typography> {note.medication || "N/A"}
                <Typography fontWeight="bold">SIG:</Typography> {note.sig || "N/A"}

                <Typography fontWeight="bold">Order Date:</Typography> {note.order_date ? new Date(note.order_date).toISOString().split("T")[0] : "N/A"}
                <Typography fontWeight="bold">Order Age:</Typography> {note.order_age || "N/A"} years

                <Typography fontWeight="bold">Start Date:</Typography> {note.start_date ? new Date(note.start_date).toISOString().split("T")[0] : "N/A"}
                <Typography fontWeight="bold">Start Age:</Typography> {note.start_age || "N/A"} years

                <Typography fontWeight="bold">End Date:</Typography> {note.end_date ? (note.end_date === "Data Unknown" ? "Data Unknown" : new Date(note.end_date).toISOString().split("T")[0]) : "N/A"}
                <Typography fontWeight="bold">End Age:</Typography> {note.end_age || "N/A"} years

                <Typography fontWeight="bold">Route:</Typography> {note.route || "N/A"}
                <Typography fontWeight="bold">Dispensed Amount:</Typography> {note.disp ? `${note.disp} ${note.unit || ""}` : "N/A"}

                <Typography fontWeight="bold">Refills:</Typography> {note.refills || "N/A"}
                <Typography fontWeight="bold">Frequency:</Typography> {note.frequency || "N/A"}
                <Typography fontWeight="bold">Number of Times:</Typography> {note.number_of_times || "N/A"}

                <Typography fontWeight="bold">Order Status:</Typography> {note.order_status || "N/A"}
                <Typography fontWeight="bold">Order Class:</Typography> {note.order_class || "N/A"}
                <Typography fontWeight="bold">Order Mode:</Typography> {note.order_mode || "N/A"}

                <Typography fontWeight="bold">Pharmaceutical Class:</Typography> {note.pharmaceutical_class || "N/A"}
                <Typography fontWeight="bold">Therapeutic Class:</Typography> {note.therapeutic_class || "N/A"}

                <Typography fontWeight="bold">Ingredients:</Typography> {note.ingredients || "N/A"}
                <Typography fontWeight="bold">Prescribing Provider:</Typography> {note.prescribing_provider || "N/A"}
              </Card>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              No medical order reports available.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>

    {/* Orders and Ordersets */}
    <Card sx={{ maxWidth: 800, margin: "80px auto", padding: 3, borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Orders and Ordersets
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
          {ordersOrdersets.length > 0 ? (
            ordersOrdersets.map((note: any, index: number) => (
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
                <Typography fontWeight="bold">Order ID:</Typography> {note.order_id || "N/A"}

                <Typography fontWeight="bold">Date:</Typography> {note.date ? (note.date === "Data Unknown" ? "Data Unknown" : new Date(note.date).toISOString().split("T")[0]) : "N/A"}
                <Typography fontWeight="bold">Age:</Typography> {note.age || "N/A"} years

                <Typography fontWeight="bold">Order Type Code:</Typography> {note.order_type_code || "N/A"}
                <Typography fontWeight="bold">Order Type:</Typography> {note.order_type || "N/A"}

                <Typography fontWeight="bold">Procedure ID:</Typography> {note.proc_id || "N/A"}

                <Typography fontWeight="bold">Order Class Code:</Typography> {note.order_class_code || "N/A"}
                <Typography fontWeight="bold">Order Class:</Typography> {note.order_class || "N/A"}

                <Typography fontWeight="bold">Description:</Typography> {note.description || "N/A"}

                <Typography fontWeight="bold">Authorizing Provider:</Typography> {note.authrzing_provider || "N/A"}
                <Typography fontWeight="bold">Billing Provider:</Typography> {note.billing_provider || "N/A"}

                <Typography fontWeight="bold">Result Time:</Typography> {note.result_time || "N/A"}

                <Typography fontWeight="bold">Future or Standing Order:</Typography> {note.future_or_standing || "N/A"}

                <Typography fontWeight="bold">Instantiated Time:</Typography> {note.instantiated_time ? (note.instantiated_time === "Data Unknown" ? "Data Unknown" : new Date(note.instantiated_time).toISOString().split("T")[0]) : "N/A"}

                <Typography fontWeight="bold">Quantity:</Typography> {note.quantity || "N/A"}

                <Typography fontWeight="bold">Order Status Code:</Typography> {note.order_status_code || "N/A"}
                <Typography fontWeight="bold">Order Status:</Typography> {note.order_status || "N/A"}
              </Card>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              No orders and ordersets available.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
    </>
  )
}
