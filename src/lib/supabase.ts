import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create Supabase client if env vars are available
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

// Helper functions for Supabase operations (returns null if Supabase not configured)
export const supabaseHelpers = {
  // Users
  async getUser(id: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async updateUser(id: string, updates: any) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Courses
  async getCourses(grade?: number) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    let query = supabase
      .from('courses')
      .select(`
        *,
        chapters (
          id,
          title,
          order,
          lectures (id, title)
        )
      `)
      .eq('isPublished', true)
      .order('createdAt', { ascending: false })

    if (grade) {
      query = query.eq('grade', grade)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getCourse(id: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        chapters (
          id,
          title,
          order,
          lectures (*)
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Enrollments
  async enrollInCourse(userId: string, courseId: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        userId,
        courseId,
        progress: 0
      })
      .select()
      .single()
    return { data, error }
  },

  async getEnrollments(userId: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses (*)
      `)
      .eq('userId', userId)
    return { data, error }
  },

  // Progress
  async updateProgress(userId: string, lectureId: string, completed: boolean = true) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('progress')
      .upsert({
        userId,
        lectureId,
        completed,
        completedAt: completed ? new Date().toISOString() : null
      })
      .select()
      .single()
    return { data, error }
  },

  // Notifications
  async getNotifications(userId: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(50)
    return { data, error }
  },

  async createNotification(notification: any) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()
    return { data, error }
  },

  async markNotificationRead(id: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('notifications')
      .update({ isRead: true })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Messages
  async getMessages(userId1: string, userId2: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(senderId.eq.${userId1},receiverId.eq.${userId2}),and(senderId.eq.${userId2},receiverId.eq.${userId1})`)
      .order('createdAt', { ascending: true })
    return { data, error }
  },

  async sendMessage(message: any) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single()
    return { data, error }
  },

  // Support Tickets
  async getTickets(userId?: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    let query = supabase
      .from('tickets')
      .select(`
        *,
        user:users (id, name, email)
      `)
      .order('createdAt', { ascending: false })

    if (userId) {
      query = query.eq('userId', userId)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createTicket(ticket: any) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single()
    return { data, error }
  },

  async addTicketMessage(ticketId: string, message: any) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({ ...message, ticketId })
      .select()
      .single()
    return { data, error }
  },

  // Storage
  async uploadFile(bucket: string, path: string, file: File) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    return { data, error }
  },

  async getPublicUrl(bucket: string, path: string) {
    if (!supabase) return null
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data
  }
}

export default supabase