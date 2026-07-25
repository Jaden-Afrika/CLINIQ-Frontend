/** The appointment record returned by the appointment and treatment APIs. */
export interface AppointmentRecord {
  id: number
  ticket_number: number
  doctor: number
  doctor_name: string
  patient: number
  patient_username: string
  date: string
  scheduled_time: string | null
  status: 'booked' | 'completed' | 'no_show'
  source: 'online' | 'walk_in'
  diagnosis: string
  treatment: string
  created_at: string
  completed_at: string | null
}
