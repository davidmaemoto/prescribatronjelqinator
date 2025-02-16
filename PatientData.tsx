"use client"

import React, { useState } from "react"
import { 
  Menu, 
  MenuItem, 
  IconButton, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  TextField, 
  Button,
  FormControl,
  InputLabel,
  Select,
  Box,
  Collapse
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { useNavigate, useLocation } from "react-router-dom"
import patientData from "../data/data.json"

// A simple markdown processor to convert **bold** and *italic* syntax.
function processMarkdown(text: string): string {
  let processed = text
  // Convert **bold**
  processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  // Convert *italic*
  processed = processed.replace(/\*(.*?)\*/g, "<em>$1</em>")
  return processed
}

// Component to render a message that may contain chain-of-thought.
function RenderMessage({ msg }: { msg: { role: string; content: string } }) {
  // Check for chain-of-thought markers.
  const thinkMatch = msg.content.match(/<think>([\s\S]*?)<\/think>/)
  const chainText = thinkMatch ? thinkMatch[1].trim() : ""
  const mainText = msg.content.replace(/<think>[\s\S]*?<\/think>/, "").trim()

  // Local state for toggling the chain-of-thought display.
  const [showThink, setShowThink] = useState(false)

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: msg.role === "user" ? "flex-end" : "flex-start",
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            maxWidth: "70%",
            backgroundColor: msg.role === "user" ? "#1976d2" : "#e0e0e0",
            color: msg.role === "user" ? "#fff" : "#000",
            boxShadow: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{ __html: processMarkdown(mainText) }}
          />
        </Box>
        {chainText && (
          <Box sx={{ mt: 0.5, width: "70%" }}>
            <Button
              size="small"
              onClick={() => setShowThink((prev) => !prev)}
              sx={{ textTransform: "none" }}
            >
              {showThink ? "Hide internal chain-of-thought" : "Show internal chain-of-thought"}
            </Button>
            <Collapse in={showThink}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: "#f0f0f0",
                  border: "1px dashed #999",
                  mt: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ whiteSpace: "pre-wrap", fontStyle: "italic" }}
                  dangerouslySetInnerHTML={{ __html: processMarkdown(chainText) }}
                />
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export function PatientData() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // For the AI chat
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Full chat history: each entry has a role ("user" or "assistant") and the message content.
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])

  const patientId = location.state?.patientId
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [modelMode, setModelMode] = useState("fast")

  if (!patientId) {
    navigate("/")
    return null
  }

  const patient = patientData[patientId]
  const onLogout = () => {
    navigate("/", { replace: true })
  }

  const patientKeys = Object.keys(patient)
  const demographics = patient["demographics"][0]

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleModelChange = (event: any) => {
    setModelMode(event.target.value)
  }

  // Submit the query and update the chat history.
  const handleQuerySubmit = async (queryText: string, pId: string) => {
    if (!queryText.trim()) return;

    // Immediately clear the query field
    setQuery("");
    setLoading(true);

    // Add user's message
    setMessages((prev) => [...prev, { role: "user", content: queryText }]);

    try {
      const res = await fetch("http://127.0.0.1:5000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: pId,
          query: queryText,
          model_mode: modelMode,
        }),
      });
      const data = await res.json();
      
      // Add assistant's response
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error fetching response." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Dropdown Menu Button */}
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
        {patientKeys
          .filter(key => ![
            "demographics", 
            "procedures", 
            "pathology_report", 
            "radiology_report", 
            "med_admin", 
            "med_orders"
          ].includes(key))
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
                  navigate(path, { state: { patientId: demographics.patient_id } })
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

      {/* Patient Information Card */}
      <Card 
        sx={{ 
          maxWidth: 800, 
          margin: "80px auto", 
          padding: 3, 
          borderRadius: 4, 
          boxShadow: 3,
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": { transform: "scale(1.02)", boxShadow: 4 },
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
              <Typography fontWeight="bold">Date of Birth:</Typography>{" "}
              {demographics.date_of_birth ? new Date(demographics.date_of_birth).toISOString().split("T")[0] : "N/A"}
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

      {/* AI Chat Interface Card */}
      <Card 
        sx={{ 
          maxWidth: 800, 
          margin: "20px auto", 
          padding: 3, 
          borderRadius: 4, 
          boxShadow: 3,
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": { transform: "scale(1.02)", boxShadow: 4 },
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            AI Assistant
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="model-mode-label">Model</InputLabel>
            <Select
              labelId="model-mode-label"
              value={modelMode}
              label="Model"
              onChange={handleModelChange}
            >
              <MenuItem value="fast">Fast (llama3.2)</MenuItem>
              <MenuItem value="reasoning">Reasoning (deepseek-1:7b)</MenuItem>
              <MenuItem value="goldilocks">Goldilocks (phi4)</MenuItem>
            </Select>
          </FormControl>

          {/* Chat History Section */}
          <Box
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 2,
              mb: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            {messages.map((msg, index) => (
              <RenderMessage key={index} msg={msg} />
            ))}
          </Box>

          <TextField
            fullWidth
            label="Ask about the patient"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ mb: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleQuerySubmit(query, patientId)
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleQuerySubmit(query, patientId)}
            disabled={loading}
          >
            {loading ? "Processing..." : "Ask AI"}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
