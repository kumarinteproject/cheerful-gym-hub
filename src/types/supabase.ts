
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'student' | 'trainer' | 'admin'
          profile_image: string | null
          membership_type: string | null
          expertise: string[] | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'student' | 'trainer' | 'admin'
          profile_image?: string | null
          membership_type?: string | null
          expertise?: string[] | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'student' | 'trainer' | 'admin'
          profile_image?: string | null
          membership_type?: string | null
          expertise?: string[] | null
          bio?: string | null
          created_at?: string
        }
      }
      time_slots: {
        Row: {
          id: string
          trainer_id: string
          day: string
          start_time: string
          end_time: string
          is_booked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          day: string
          start_time: string
          end_time: string
          is_booked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          trainer_id?: string
          day?: string
          start_time?: string
          end_time?: string
          is_booked?: boolean
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          student_id: string
          trainer_id: string
          time_slot_id: string
          date: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          trainer_id: string
          time_slot_id: string
          date: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          trainer_id?: string
          time_slot_id?: string
          date?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
